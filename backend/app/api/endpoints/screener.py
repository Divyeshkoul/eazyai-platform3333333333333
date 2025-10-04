from fastapi import APIRouter, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import StreamingResponse, JSONResponse
from typing import List, Optional
import json
import asyncio
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
from app.services.email_service import send_email, send_bulk_emails
from app.services.pdf_service import generate_summary_pdf
from app.utils.parse_resume import (
    parse_resume, get_text_chunks, get_embedding_cached,
    get_cosine_similarity, upload_to_blob, extract_contact_info,
    save_summary_to_blob, save_csv_to_blob
)
from app.core.constants import AZURE_CONFIG
from azure.storage.blob import BlobServiceClient
import logging
from pydantic import BaseModel

class EmailRequest(BaseModel):
    email: str
    subject: str
    body: str

logger = logging.getLogger(__name__)

router = APIRouter()

# Global state for analysis results (in production, use Redis or database)
analysis_cache = {}

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

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_resumes(request: ScreenerRequest):
    """
    Main endpoint to analyze resumes against job description
    """
    start_time = time.time()
    
    try:
        job_config = request.job_config
        
        # Extract role from JD
        if not job_config.role:
            job_config.role = extract_role_from_jd(job_config.jd)
        
        # Load resumes
        if request.load_from_blob:
            resume_files = download_all_supported_resume_blobs()
            if not resume_files:
                raise HTTPException(
                    status_code=404,
                    detail="No resumes found in Azure Blob storage"
                )
        else:
            raise HTTPException(
                status_code=400,
                detail="File upload not implemented in this endpoint. Use /upload endpoint first."
            )
        
        # Pre-compute JD embedding
        jd_embedding = get_embedding_cached(job_config.jd)
        
        # Process resumes asynchronously
        tasks = []
        for file_name, file_bytes in resume_files:
            try:
                # Parse resume
                resume_text = parse_resume(file_bytes, file_name)
                contact = extract_contact_info(resume_text)
                
                # Compute similarity
                chunks = get_text_chunks(resume_text)
                resume_embedding = get_embedding_cached(" ".join(chunks[:3]))
                jd_sim = round(
                    get_cosine_similarity(resume_embedding, jd_embedding) * 100, 2
                )
                
                # Create analysis task
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
                logger.error(f"Error processing {file_name}: {e}")
                continue
        
        # Execute all tasks
        if not tasks:
            raise HTTPException(
                status_code=500,
                detail="No resumes could be processed"
            )
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Filter valid results
        valid_results = []
        for r in results:
            if isinstance(r, Exception):
                logger.error(f"Task failed: {r}")
                continue
            if isinstance(r, dict):
                r["recruiter_notes"] = ""
                valid_results.append(r)
        
        if not valid_results:
            raise HTTPException(
                status_code=500,
                detail="All resume analyses failed"
            )
        
        # Apply verdict logic
        df = pd.DataFrame(valid_results)
        
        def determine_verdict(row):
            score = row["score"]
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
        
        # Apply Top-N logic
        if job_config.top_n > 0:
            sorted_df = df.sort_values("score", ascending=False)
            top_candidates = sorted_df.head(job_config.top_n).copy()
            top_candidates["verdict"] = "shortlist"
            remaining = sorted_df.iloc[job_config.top_n:].copy()
            df = pd.concat([top_candidates, remaining], ignore_index=True)
        
        # Convert to dict for response
        candidates = df.to_dict('records')
        
        # Calculate statistics
        shortlisted = len(df[df["verdict"] == "shortlist"])
        under_review = len(df[df["verdict"] == "review"])
        rejected = len(df[df["verdict"] == "reject"])
        
        processing_time = time.time() - start_time
        
        # Cache results
        session_id = f"analysis_{int(time.time())}"
        analysis_cache[session_id] = {
            "candidates": candidates,
            "timestamp": datetime.now().isoformat()
        }
        
        return AnalysisResponse(
            success=True,
            total_processed=len(candidates),
            shortlisted=shortlisted,
            under_review=under_review,
            rejected=rejected,
            processing_time=processing_time,
            candidates=candidates,
            metrics={
                "avg_time_per_resume": processing_time / len(candidates),
                "session_id": session_id
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload")
async def upload_resumes(files: List[UploadFile] = File(...)):
    """
    Upload resume files to Azure Blob storage
    """
    try:
        uploaded = []
        failed = []
        
        for file in files:
            try:
                contents = await file.read()
                filename = file.filename
                
                # Upload to blob
                success = upload_to_blob(
                    contents,
                    filename,
                    AZURE_CONFIG["resumes_container"]
                )
                
                if success:
                    uploaded.append(filename)
                else:
                    failed.append(filename)
                    
            except Exception as e:
                logger.error(f"Upload error for {file.filename}: {e}")
                failed.append(file.filename)
        
        return APIResponse(
            success=len(uploaded) > 0,
            message=f"Uploaded {len(uploaded)} files, {len(failed)} failed",
            data={"uploaded": uploaded, "failed": failed}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/email/send")
async def send_candidate_email(request: EmailRequest):
    """
    Send email to a single candidate
    """
    try:
        success = send_email(request.email, request.subject, request.body)
        
        if success:
            return APIResponse(
                success=True,
                message="Email sent successfully"
            )
        else:
            raise HTTPException(status_code=500, detail="Email sending failed")
            
    except Exception as e:
        logger.error(f"Email send error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
@router.post("/email/bulk")
async def send_bulk_candidate_emails(request: BulkEmailRequest):
    """
    Send bulk emails to multiple candidates
    """
    try:
        # This would need candidate data - simplified version
        results = {
            "sent": 0,
            "failed": len(request.candidate_emails)
        }
        
        return APIResponse(
            success=True,
            message=f"Bulk email process completed",
            data=results
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/summary/{candidate_email}")
async def generate_candidate_summary(candidate_email: str):
    """
    Generate PDF summary for a candidate
    """
    try:
        # Find candidate in cache
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
        
        # Generate PDF
        pdf_bytes = generate_summary_pdf(candidate_data)
        
        # Save to blob
        filename = f"{candidate_data['name'].replace(' ', '_')}_Summary.pdf"
        save_summary_to_blob(
            pdf_bytes,
            filename,
            AZURE_CONFIG["summaries_container"]
        )
        
        # Return PDF
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/export/csv")
async def export_candidates_csv(verdict: Optional[str] = None):
    """
    Export candidates to CSV
    """
    try:
        # Get latest analysis from cache
        if not analysis_cache:
            raise HTTPException(status_code=404, detail="No analysis data available")
        
        latest_session = max(analysis_cache.keys())
        candidates = analysis_cache[latest_session]["candidates"]
        
        df = pd.DataFrame(candidates)
        
        # Filter by verdict if specified
        if verdict:
            df = df[df["verdict"] == verdict]
        
        # Remove large fields
        df = df.drop(columns=["resume_text", "embedding"], errors="ignore")
        
        # Convert to CSV
        csv_data = df.to_csv(index=False)
        
        # Save to blob
        filename = f"{verdict or 'all'}_candidates_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        save_csv_to_blob(df, filename, AZURE_CONFIG["csv_container"])
        
        return StreamingResponse(
            io.StringIO(csv_data),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/candidate/update")
async def update_candidate(request: UpdateCandidateRequest):
    """
    Update candidate notes and verdict
    """
    try:
        # Update in cache
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
        
        return APIResponse(
            success=True,
            message="Candidate updated successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))