from pydantic import BaseModel
from typing import List, Optional, Any, Dict

class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None
    error: Optional[str] = None

class AnalysisResponse(BaseModel):
    success: bool
    total_processed: int
    shortlisted: int
    under_review: int
    rejected: int
    processing_time: float
    candidates: List[Any]
    metrics: Optional[Dict] = None

class GmailSyncStatus(BaseModel):
    last_sync: Optional[str]
    emails_processed: int
    files_uploaded: int
    is_active: bool
    errors: List[str]

class DashboardStats(BaseModel):
    total_candidates: int
    shortlisted: int
    under_review: int
    rejected: int
    avg_score: float
    recent_analyses: List[Dict]
    format_breakdown: Dict[str, int]