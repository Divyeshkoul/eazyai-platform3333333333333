from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
from app.schemas.response import APIResponse
from app.utils.parse_resume import upload_to_blob
from app.core.constants import AZURE_CONFIG
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/resume")
async def upload_single_resume(file: UploadFile = File(...)):
    """
    Upload a single resume file
    """
    try:
        # Validate file type
        allowed_extensions = ['.pdf', '.docx', '.doc']
        file_ext = '.' + file.filename.split('.')[-1].lower()
        
        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type. Allowed: {', '.join(allowed_extensions)}"
            )
        
        # Read file
        contents = await file.read()
        
        # Upload to blob
        success = upload_to_blob(
            contents,
            file.filename,
            AZURE_CONFIG["resumes_container"]
        )
        
        if success:
            return APIResponse(
                success=True,
                message=f"File {file.filename} uploaded successfully",
                data={"filename": file.filename, "size": len(contents)}
            )
        else:
            raise HTTPException(status_code=500, detail="Upload to Azure failed")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/resumes/batch")
async def upload_multiple_resumes(files: List[UploadFile] = File(...)):
    """
    Upload multiple resume files
    """
    try:
        uploaded = []
        failed = []
        
        for file in files:
            try:
                # Validate file type
                allowed_extensions = ['.pdf', '.docx', '.doc']
                file_ext = '.' + file.filename.split('.')[-1].lower()
                
                if file_ext not in allowed_extensions:
                    failed.append({
                        "filename": file.filename,
                        "reason": "Unsupported file type"
                    })
                    continue
                
                # Read and upload
                contents = await file.read()
                success = upload_to_blob(
                    contents,
                    file.filename,
                    AZURE_CONFIG["resumes_container"]
                )
                
                if success:
                    uploaded.append(file.filename)
                else:
                    failed.append({
                        "filename": file.filename,
                        "reason": "Azure upload failed"
                    })
                    
            except Exception as e:
                logger.error(f"Error uploading {file.filename}: {e}")
                failed.append({
                    "filename": file.filename,
                    "reason": str(e)
                })
        
        return APIResponse(
            success=len(uploaded) > 0,
            message=f"Uploaded {len(uploaded)} files, {len(failed)} failed",
            data={
                "uploaded": uploaded,
                "failed": failed,
                "total": len(files)
            }
        )
        
    except Exception as e:
        logger.error(f"Batch upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/resume/{filename}")
async def delete_resume(filename: str):
    """
    Delete a resume from blob storage
    """
    try:
        from azure.storage.blob import BlobServiceClient
        
        blob_service_client = BlobServiceClient.from_connection_string(
            AZURE_CONFIG["connection_string"]
        )
        blob_client = blob_service_client.get_blob_client(
            container=AZURE_CONFIG["resumes_container"],
            blob=filename
        )
        
        blob_client.delete_blob()
        
        return APIResponse(
            success=True,
            message=f"File {filename} deleted successfully"
        )
        
    except Exception as e:
        logger.error(f"Delete error: {e}")
        raise HTTPException(status_code=500, detail=str(e))