from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.schemas.response import APIResponse, GmailSyncStatus
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Simple status tracking without gmail_service dependency
gmail_status = {
    "last_sync": None,
    "emails_processed": 0,
    "files_uploaded": 0,
    "is_active": False,
    "errors": []
}

@router.get("/status", response_model=GmailSyncStatus)
async def get_gmail_sync_status():
    """Get current Gmail sync status"""
    try:
        return GmailSyncStatus(**gmail_status)
    except Exception as e:
        logger.error(f"Error getting Gmail status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sync")
async def trigger_gmail_sync(background_tasks: BackgroundTasks):
    """Manually trigger Gmail sync"""
    try:
        # Import here to avoid circular dependency
        from app.services.gmail_service import process_gmail_resumes
        
        # Update status
        gmail_status["is_active"] = True
        
        # Process in background
        result = await process_gmail_resumes()
        
        # Update status with results
        gmail_status["emails_processed"] = result.get("emails_processed", 0)
        gmail_status["files_uploaded"] = result.get("files_uploaded", 0)
        gmail_status["last_sync"] = result.get("timestamp")
        gmail_status["is_active"] = False
        
        return APIResponse(
            success=True,
            message="Gmail sync completed",
            data=gmail_status
        )
        
    except Exception as e:
        gmail_status["is_active"] = False
        gmail_status["errors"].append(str(e))
        logger.error(f"Error triggering Gmail sync: {e}")
        raise HTTPException(status_code=500, detail=f"Gmail sync failed: {str(e)}")

@router.post("/start-auto-sync")
async def start_auto_sync():
    """Start automatic Gmail syncing"""
    try:
        return APIResponse(
            success=True,
            message="Auto-sync feature not implemented yet"
        )
    except Exception as e:
        logger.error(f"Error starting auto-sync: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
async def get_sync_history():
    """Get Gmail sync history"""
    try:
        return APIResponse(
            success=True,
            message="Sync history retrieved",
            data={
                "last_sync": gmail_status.get("last_sync"),
                "total_emails_processed": gmail_status.get("emails_processed", 0),
                "total_files_uploaded": gmail_status.get("files_uploaded", 0),
                "recent_errors": gmail_status.get("errors", [])[-10:]
            }
        )
    except Exception as e:
        logger.error(f"Error getting sync history: {e}")
        raise HTTPException(status_code=500, detail=str(e))