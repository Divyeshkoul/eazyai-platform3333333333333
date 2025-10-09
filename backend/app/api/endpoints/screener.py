from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse, JSONResponse
from typing import List, Optional
from pydantic import BaseModel
import json
import asyncio
from asyncio import Semaphore
import time
import io
import pandas as pd
from datetime import datetime

from app.schemas.candidate import (
    ScreenerRequest, JobConfiguration, CandidateAnalysis,
    BulkEmailRequest, UpdateCandidateRequest
)
from app.schemas.response import APIResponse, AnalysisResponse
from app.services.screener_service import (
    get_resume_analysis_async, extract_role_from_jd
)
from app.services.email_service import send_email
from app.services.pdf_service import generate_summary_pdf
from app.utils.parse_resume import (
    parse_resume, get_text_chunks, get_embedding_cached,
    get_cosine_similarity, upload_to_blob, extract_contact_info,
    save_summary_to_blob, save_csv_to_blob
)
from app.core.constants import AZURE_CONFIG
from azure.storage.blob import BlobServiceClient
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Global state for analysis results
analysis_cache = {}

# Store uploaded files temporarily in memory
uploaded_files_cache = {}

CONCURRENT_LIMIT = 15


def get_blob_service_client():
    return BlobServiceClient.from_connection_string(
        AZURE_CONFIG["connection_string"]
    )


def download_all_supported_resume_blobs():
    """Download all supported resume files from Azure Blob"""
    try:
        blob_service_client = get_blob_service_client()
        container_client = blob_service_client.get_container_client(
            AZURE_CONFIG["resumes_container"]
        )

        blobs = container_client.list_blobs()
        resume_files = []
        supported_extensions = ['.pdf', '.docx', '.doc']

        for blob in blobs:
            if any(blob.name.lower().endswith(ext) for ext in supported_extensions):
                try:
                    downloader = container_client.download_blob(blob.name)
                    file_bytes = downloader.readall()
                    resume_files.append((blob.name, file_bytes))
                except Exception as e:
                    logger.error(f"Error downloading {blob.name}: {e}")
                    continue

        logger.info(f"Downloaded {len(resume_files)} resume files from blob")
        return resume_files
    except Exception as e:
        logger.error(f"Error accessing blob storage: {e}")
        return []


async def analyze_with_semaphore(sem, task):
    """Limit concurrent API calls"""
    async with sem:
        return await task


class EmailRequest(BaseModel):
    email: str
    subject: str
    body: str


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_resumes(request: ScreenerRequest):
    """Main endpoint to analyze resumes against job description"""
    start_time = time.time()

    try:
        job_config = request.job_config

        if not job_config.role:
            job_config.role = extract_role_from_jd(job_config.jd)

        # Load resumes
        if request.load_from_blob:
            logger.info("Loading resumes from Azure Blob Storage")
            resume_files = download_all_supported_resume_blobs()
            if not resume_files:
                raise HTTPException(status_code=404, detail="No resumes found in Azure Blob storage")
        else:
            logger.info("Using manually uploaded resumes")
            if not uploaded_files_cache:
                raise HTTPException(status_code=400, detail="No resumes uploaded. Please upload resumes first.")
            resume_files = list(uploaded_files_cache.values())

        logger.info(f"Processing {len(resume_files)} resumes")

        jd_embedding = get_embedding_cached(job_config.jd)

        tasks = []
        for file_name, file_bytes in resume_files:
            try:
                resume_text = parse_resume(file_bytes, file_name)
                contact = extract_contact_info(resume_text)

                chunks = get_text_chunks(resume_text)
                resume_embedding = get_embedding_cached(chunks[0] if chunks else resume_text[:1000])
                jd_sim = round(get_cosine_similarity(resume_embedding, jd_embedding) * 100, 2)

                task = get_resume_analysis_async(
                    jd=job_config.jd,
                    resume_text=resume_text,
                    contact=contact,
                    role=job_config.role or "N/A",
                    domain=job_config.domain or "",
                    skills=job_config.skills or "",
                    experience_range=job_config.experience_range,
                    jd_similarity=jd_sim,
                    resume_file=file_name
                )
                tasks.append(task)

            except Exception as e:
                logger.error(f"Error preparing {file_name}: {e}")
                continue

        if not tasks:
            raise HTTPException(status_code=500, detail="No resumes could be processed")

        semaphore = Semaphore(CONCURRENT_LIMIT)
        limited_tasks = [analyze_with_semaphore(semaphore, task) for task in tasks]

        results = await asyncio.gather(*limited_tasks, return_exceptions=True)

        valid_results = []
        for r in results:
            if isinstance(r, Exception):
                logger.error(f"Task failed: {r}")
                continue
            if isinstance(r, dict):
                r["recruiter_notes"] = ""
                valid_results.append(r)

        if not valid_results:
            raise HTTPException(status_code=500, detail="All resume analyses failed")

        df = pd.DataFrame(valid_results)

        def determine_verdict(row):
            score = row["score"]
            exp_match = row["experience_match"]

            if exp_match < 40:
                return "reject"

            if (
                row["jd_similarity"] < job_config.jd_threshold or
                row["skills_match"] < job_config.skills_threshold or
                row["domain_match"] < job_config.domain_threshold or
                row["experience_match"] < job_config.experience_threshold or
                score < job_config.reject_threshold
            ):
                return "reject"
            elif score >= job_config.shortlist_threshold:
                return "shortlist"
            else:
                return "review"

        df["verdict"] = df.apply(determine_verdict, axis=1)

        if job_config.top_n > 0:
            sorted_df = df.sort_values("score", ascending=False)
            top_candidates = sorted_df.head(job_config.top_n).copy()
            top_candidates["verdict"] = "shortlist"
            remaining = sorted_df.iloc[job_config.top_n:].copy()
            df = pd.concat([top_candidates, remaining], ignore_index=True)

        candidates = df.to_dict('records')

        shortlisted = len(df[df["verdict"] == "shortlist"])
        under_review = len(df[df["verdict"] == "review"])
        rejected = len(df[df["verdict"] == "reject"])

        processing_time = time.time() - start_time
        avg_time = processing_time / len(candidates)

        session_id = f"analysis_{int(time.time())}"
        analysis_cache[session_id] = {
            "candidates": candidates,
            "timestamp": datetime.now().isoformat()
        }

        if not request.load_from_blob:
            uploaded_files_cache.clear()
            logger.info("Cleared temporary upload cache")

        return AnalysisResponse(
            success=True,
            total_processed=len(candidates),
            shortlisted=shortlisted,
            under_review=under_review,
            rejected=rejected,
            processing_time=processing_time,
            candidates=candidates,
            metrics={
                "avg_time_per_resume": round(avg_time, 2),
                "session_id": session_id
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# -------------------------------------------------------------------
# Upload / Delete / Cache management endpoints
# -------------------------------------------------------------------

@router.post("/upload")
async def upload_single_resume(file: UploadFile = File(...)):
    """Upload a SINGLE resume file to temporary memory"""
    try:
        allowed_extensions = ['.pdf', '.docx', '.doc']
        file_ext = '.' + file.filename.split('.')[-1].lower()

        if file_ext not in allowed_extensions:
            raise HTTPException(status_code=400, detail=f"Unsupported file type. Allowed: {', '.join(allowed_extensions)}")

        contents = await file.read()
        uploaded_files_cache[file.filename] = (file.filename, contents)

        logger.info(f"Uploaded to temp cache: {file.filename}")
        return APIResponse(success=True, message=f"File {file.filename} uploaded to temporary storage")

    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload-to-blob")
async def upload_single_resume_to_blob(file: UploadFile = File(...)):
    """Upload a SINGLE resume file directly to Azure Blob Storage"""
    try:
        allowed_extensions = ['.pdf', '.docx', '.doc']
        file_ext = '.' + file.filename.split('.')[-1].lower()

        if file_ext not in allowed_extensions:
            raise HTTPException(status_code=400, detail=f"Unsupported file type. Allowed: {', '.join(allowed_extensions)}")

        contents = await file.read()
        success = upload_to_blob(contents, file.filename, AZURE_CONFIG["resumes_container"])

        if not success:
            raise HTTPException(status_code=500, detail="Azure Blob upload failed")

        logger.info(f"Uploaded to Azure Blob: {file.filename}")
        return APIResponse(success=True, message=f"File {file.filename} uploaded to Azure Blob")

    except Exception as e:
        logger.error(f"Blob upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/list-blob-files")
async def list_blob_files():
    """List all files in Azure Blob Storage"""
    try:
        blob_service_client = get_blob_service_client()
        container_client = blob_service_client.get_container_client(AZURE_CONFIG["resumes_container"])
        files = [blob.name for blob in container_client.list_blobs()]
        return APIResponse(success=True, message=f"Found {len(files)} files", data={"files": files})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/delete-temp/{filename}")
async def delete_temp_file(filename: str):
    """Delete file from temporary cache"""
    try:
        if filename in uploaded_files_cache:
            del uploaded_files_cache[filename]
            return APIResponse(success=True, message=f"Deleted {filename} from temporary storage")
        raise HTTPException(status_code=404, detail="File not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/delete-blob/{filename}")
async def delete_blob_file(filename: str):
    """Delete file from Azure Blob Storage"""
    try:
        blob_service_client = get_blob_service_client()
        blob_client = blob_service_client.get_blob_client(container=AZURE_CONFIG["resumes_container"], blob=filename)
        blob_client.delete_blob()
        return APIResponse(success=True, message=f"Deleted {filename} from Azure Blob")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/clear-cache")
async def clear_upload_cache():
    """Clear temporary upload cache"""
    count = len(uploaded_files_cache)
    uploaded_files_cache.clear()
    return APIResponse(success=True, message=f"Cleared {count} files from temporary storage")


# -------------------------------------------------------------------
# Email, CSV, and Candidate Summary endpoints
# -------------------------------------------------------------------

@router.post("/email/send")
async def send_candidate_email(request: EmailRequest):
    """Send email to a single candidate"""
    try:
        success = send_email(request.email, request.subject, request.body)
        if not success:
            raise HTTPException(status_code=500, detail="Email sending failed")
        return APIResponse(success=True, message="Email sent successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/export/csv")
async def export_candidates_csv(verdict: Optional[str] = None):
    """Export candidates to CSV"""
    try:
        if not analysis_cache:
            raise HTTPException(status_code=404, detail="No analysis data available")

        latest_session = max(analysis_cache.keys())
        candidates = analysis_cache[latest_session]["candidates"]

        df = pd.DataFrame(candidates)
        if verdict:
            df = df[df["verdict"] == verdict]
        df = df.drop(columns=["resume_text"], errors="ignore")

        csv_data = df.to_csv(index=False)
        filename = f"{verdict or 'all'}_candidates_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"

        return StreamingResponse(
            io.StringIO(csv_data),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/summary/{candidate_email}")
async def generate_candidate_summary(candidate_email: str):
    """Generate PDF summary for a candidate"""
    try:
        candidate_data = None
        for session_data in analysis_cache.values():
            for candidate in session_data["candidates"]:
                if candidate["email"] == candidate_email:
                    candidate_data = candidate
                    break
            if candidate_data:
                break

        if not candidate_data:
            raise HTTPException(status_code=404, detail="Candidate not found")

        pdf_bytes = generate_summary_pdf(candidate_data)
        filename = f"{candidate_data['name'].replace(' ', '_')}_Summary.pdf"

        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/candidate/update")
async def update_candidate(request: UpdateCandidateRequest):
    """Update candidate notes and verdict"""
    try:
        updated = False
        for session_data in analysis_cache.values():
            for candidate in session_data["candidates"]:
                if candidate["email"] == request.candidate_id:
                    if request.recruiter_notes:
                        candidate["recruiter_notes"] = request.recruiter_notes
                    if request.verdict:
                        candidate["verdict"] = request.verdict
                    updated = True
                    break
            if updated:
                break

        if not updated:
            raise HTTPException(status_code=404, detail="Candidate not found")

        return APIResponse(success=True, message="Candidate updated successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -------------------------------------------------------------------
# 🆕 Enhanced Session Management Endpoints
# -------------------------------------------------------------------

@router.get("/results/{session_id}")
async def get_results_by_session(session_id: str):
    """Retrieve analysis results by session ID"""
    try:
        if session_id not in analysis_cache:
            raise HTTPException(status_code=404, detail="Session not found or expired")
        session_data = analysis_cache[session_id]
        return APIResponse(success=True, message="Results retrieved", data=session_data)
    except Exception as e:
        logger.error(f"Error retrieving results: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sessions/list")
async def list_sessions():
    """List all available analysis sessions"""
    try:
        sessions = []
        for session_id, data in analysis_cache.items():
            sessions.append({
                "session_id": session_id,
                "timestamp": data.get("timestamp"),
                "total_candidates": len(data.get("candidates", []))
            })
        return APIResponse(success=True, message=f"Found {len(sessions)} sessions", data={"sessions": sessions})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
