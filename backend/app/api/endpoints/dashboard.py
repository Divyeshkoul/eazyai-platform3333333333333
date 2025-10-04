from fastapi import APIRouter, HTTPException
from typing import Dict, List
import pandas as pd
from datetime import datetime, timedelta

from app.schemas.response import APIResponse, DashboardStats
from app.api.endpoints.screener import analysis_cache
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_statistics():
    """
    Get comprehensive dashboard statistics
    """
    try:
        if not analysis_cache:
            return DashboardStats(
                total_candidates=0,
                shortlisted=0,
                under_review=0,
                rejected=0,
                avg_score=0.0,
                recent_analyses=[],
                format_breakdown={}
            )
        
        # Get latest analysis
        latest_session = max(analysis_cache.keys())
        candidates = analysis_cache[latest_session]["candidates"]
        
        df = pd.DataFrame(candidates)
        
        # Calculate statistics
        total = len(df)
        shortlisted = len(df[df["verdict"] == "shortlist"])
        under_review = len(df[df["verdict"] == "review"])
        rejected = len(df[df["verdict"] == "reject"])
        avg_score = float(df["score"].mean()) if total > 0 else 0.0
        
        # Recent analyses (top 5 by score)
        recent = df.nlargest(5, 'score')[['name', 'email', 'score', 'verdict']].to_dict('records')
        
        # Format breakdown
        format_breakdown = {}
        for candidate in candidates:
            file_name = candidate.get('resume_file', '')
            if '.' in file_name:
                ext = file_name.split('.')[-1].lower()
                format_breakdown[ext] = format_breakdown.get(ext, 0) + 1
        
        return DashboardStats(
            total_candidates=total,
            shortlisted=shortlisted,
            under_review=under_review,
            rejected=rejected,
            avg_score=round(avg_score, 2),
            recent_analyses=recent,
            format_breakdown=format_breakdown
        )
        
    except Exception as e:
        logger.error(f"Dashboard stats error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics")
async def get_analytics():
    """
    Get detailed analytics for charts and graphs
    """
    try:
        if not analysis_cache:
            return APIResponse(
                success=True,
                message="No data available",
                data={
                    "score_distribution": [],
                    "verdict_breakdown": {},
                    "skill_trends": [],
                    "processing_metrics": {}
                }
            )
        
        latest_session = max(analysis_cache.keys())
        candidates = analysis_cache[latest_session]["candidates"]
        df = pd.DataFrame(candidates)
        
        # Score distribution (for histogram)
        score_bins = [0, 20, 40, 60, 80, 100]
        score_dist = pd.cut(df['score'], bins=score_bins).value_counts().to_dict()
        score_distribution = [
            {"range": str(k), "count": int(v)} 
            for k, v in score_dist.items()
        ]
        
        # Verdict breakdown
        verdict_breakdown = df['verdict'].value_counts().to_dict()
        
        # Average scores by category
        skill_trends = {
            "jd_similarity": float(df["jd_similarity"].mean()),
            "skills_match": float(df["skills_match"].mean()),
            "domain_match": float(df["domain_match"].mean()),
            "experience_match": float(df["experience_match"].mean())
        }
        
        # Processing metrics
        processing_metrics = {
            "total_processed": len(df),
            "avg_processing_time": float(df["processing_time"].mean()) if "processing_time" in df else 0,
            "success_rate": 100.0
        }
        
        return APIResponse(
            success=True,
            message="Analytics retrieved",
            data={
                "score_distribution": score_distribution,
                "verdict_breakdown": verdict_breakdown,
                "skill_trends": skill_trends,
                "processing_metrics": processing_metrics,
                "timestamp": datetime.now().isoformat()
            }
        )
        
    except Exception as e:
        logger.error(f"Analytics error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recent-activity")
async def get_recent_activity():
    """
    Get recent activity feed
    """
    try:
        activities = []
        
        # Get all sessions sorted by time
        sorted_sessions = sorted(analysis_cache.keys(), reverse=True)
        
        for session_id in sorted_sessions[:10]:  # Last 10 sessions
            session_data = analysis_cache[session_id]
            candidates = session_data["candidates"]
            timestamp = session_data["timestamp"]
            
            activities.append({
                "type": "analysis_completed",
                "timestamp": timestamp,
                "details": {
                    "total_candidates": len(candidates),
                    "session_id": session_id
                }
            })
        
        return APIResponse(
            success=True,
            message="Recent activity retrieved",
            data=activities
        )
        
    except Exception as e:
        logger.error(f"Recent activity error: {e}")
        raise HTTPException(status_code=500, detail=str(e))