# backend.py — Enhanced GPT Evaluator + Role Extractor with improved performance and error handling

import json
import asyncio
import time
import logging
from typing import Dict, Any, Optional

from app.core.constants import AZURE_CONFIG, MODEL_CONFIG, WEIGHTS, STRICT_GPT_PROMPT
from openai import AzureOpenAI
from app.utils.parse_resume import chunk_text
import numpy as np
import pandas as pd

# Configure logging
logger = logging.getLogger(__name__)

# GPT client with connection pooling
client = AzureOpenAI(
    api_key=AZURE_CONFIG["openai_key"],
    api_version=AZURE_CONFIG["api_version"],
    azure_endpoint=AZURE_CONFIG["azure_endpoint"],
    max_retries=3,
    timeout=30.0
)

# Cache for role extraction to avoid repeated calls
_role_cache = {}

def extract_role_from_jd(jd_text: str) -> str:
    """Extract job role from JD with caching and improved error handling"""
    # Use first 500 chars as cache key
    cache_key = hash(jd_text[:500])
    
    if cache_key in _role_cache:
        return _role_cache[cache_key]
    
    try:
        # Truncate JD for faster processing
        jd_truncated = jd_text[:2000]
        
        prompt = f"""
Extract the primary job title from this job description. Return only the role title (2-4 words max).
If unclear, return "N/A".

Examples: "Data Analyst", "Frontend Developer", "Product Manager"

Job Description:
{jd_truncated}

Role:"""

        response = client.chat.completions.create(
            model=MODEL_CONFIG["fast_gpt_model"],
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
            max_tokens=15,
        )
        
        role = response.choices[0].message.content.strip()
        
        # Validate role format
        if 2 <= len(role.split()) <= 6 and not any(char in role for char in ['\n', '\t', '|']):
            _role_cache[cache_key] = role
            return role
        else:
            _role_cache[cache_key] = "N/A"
            return "N/A"
            
    except Exception as e:
        logger.error(f"Role extraction failed: {str(e)}")
        _role_cache[cache_key] = "N/A"
        return "N/A"

async def get_resume_analysis_async(
    jd: str,
    resume_text: str,
    contact: dict,
    role: str,
    domain: str,
    skills: str,
    experience_range: str,
    jd_similarity: float,
    resume_file: str
) -> dict:
    """
    Enhanced async resume evaluator with improved performance and error handling
    """
    start_time = time.time()
    
    try:
        # Optimize text chunking - use only first 2 chunks for speed
        chunks = chunk_text(resume_text, max_tokens=1500)
        combined_text = "\n\n".join(chunks[:2])
        
        # Construct optimized prompt
        user_prompt = f"""
JD: {jd[:1500]}

REQUIREMENTS:
- ROLE: {role}
- DOMAIN: {domain}
- SKILLS: {skills}
- EXPERIENCE: {experience_range}

RESUME:
{combined_text}

Analyze this resume against the job requirements. Focus on accuracy and be strict about scoring."""

        messages = [
            {"role": "system", "content": STRICT_GPT_PROMPT.strip()},
            {"role": "user", "content": user_prompt}
        ]

        # Make API call with optimized settings
        response = await asyncio.to_thread(
            client.chat.completions.create,
            model=MODEL_CONFIG["deep_gpt_model"],
            messages=messages,
            temperature=0.1,
            max_tokens=1000,
            timeout=25.0
        )

        raw_response = response.choices[0].message.content
        processing_time = time.time() - start_time
        
        logger.info(f"GPT analysis completed for {resume_file} in {processing_time:.2f}s")
        
        return parse_gpt_response(
            raw_response, contact, role, jd_similarity, 
            resume_text, resume_file, processing_time
        )

    except asyncio.TimeoutError:
        logger.error(f"Timeout processing {resume_file}")
        return create_fallback_response(
            contact, role, jd_similarity, resume_text, 
            resume_file, "Analysis timeout"
        )
    except Exception as e:
        logger.error(f"Error processing {resume_file}: {str(e)}")
        return create_fallback_response(
            contact, role, jd_similarity, resume_text, 
            resume_file, f"Processing error: {str(e)[:100]}"
        )

def parse_gpt_response(
    raw_json: str, 
    contact: dict, 
    role: str, 
    jd_similarity: float, 
    resume_text: str, 
    resume_file: str,
    processing_time: float = 0.0
) -> dict:
    """Enhanced GPT response parser with better error handling and fallbacks"""
    
    try:
        # Clean the JSON response
        json_str = raw_json.strip()
        if json_str.startswith('```json'):
            json_str = json_str[7:]
        if json_str.endswith('```'):
            json_str = json_str[:-3]
        
        parsed = json.loads(json_str)
        
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing failed for {resume_file}: {str(e)}")
        return create_fallback_response(
            contact, role, jd_similarity, resume_text, 
            resume_file, "JSON parsing failed"
        )

    # Extract scores with validation
    def get_score(key: str, fallback: int = 0) -> int:
        value = parsed.get(key, fallback)
        try:
            score = int(float(value)) if value is not None else fallback
            return max(0, min(100, score))
        except (ValueError, TypeError):
            return fallback

    skills_match = get_score("skills_match")
    domain_match = get_score("domain_match") 
    experience_match = get_score("experience_match")

    # Calculate weighted final score
    final_score = (
        skills_match * WEIGHTS["skills_match"] +
        domain_match * WEIGHTS["domain_match"] +
        experience_match * WEIGHTS["experience_match"] +
        jd_similarity * WEIGHTS["jd_similarity"]
    )

    score_rounded = round(final_score, 2)

    # Enhanced verdict logic
    verdict = parsed.get("verdict", "review").lower()
    if verdict not in ["shortlist", "review", "reject"]:
        verdict = "review"

    # Extract other fields with fallbacks
    def get_field(key: str, fallback: Any = "N/A") -> Any:
        value = parsed.get(key, fallback)
        if value is None or value == "" or value == "null":
            return fallback
        if isinstance(value, str):
            value = value.strip()
            if not value or value.lower() in ["n/a", "na", "none", "null"]:
                return fallback
        return value

    extracted_name = get_field("name")
    if extracted_name == "N/A" or not extracted_name:
        extracted_name = contact.get("name", "N/A")
    
    fitment = get_field("fitment")
    if fitment == "N/A" or not fitment:
        if score_rounded >= 75:
            fitment = f"Strong candidate with {score_rounded}% overall match."
        elif score_rounded >= 50:
            fitment = f"Potential candidate with {score_rounded}% overall match."
        else:
            fitment = f"Limited match with {score_rounded}% overall compatibility."
    
    if len(str(fitment)) > 500:
        fitment = str(fitment)[:500] + "..."
    
    summary = get_field("summary_5_lines")
    if summary == "N/A" or not summary:
        summary = f"Candidate analysis for {role} position. Overall score: {score_rounded}%."
    
    def get_list_field(key: str) -> list:
        value = parsed.get(key, [])
        if isinstance(value, list):
            return [str(item).strip() for item in value if item and str(item).strip()]
        elif isinstance(value, str) and value.strip() and value.strip() not in ["N/A", "n/a", "none", "null"]:
            items = []
            for delimiter in [';', ',', '\n', '|']:
                if delimiter in value:
                    items = [item.strip() for item in value.split(delimiter) if item.strip()]
                    break
            return items if items else [value.strip()]
        return []

    red_flags = get_list_field("red_flags")
    missing_gaps = get_list_field("missing_gaps") 
    highlights = get_list_field("highlights")
    rejection_reasons = get_list_field("reasons_if_rejected")

    fraud_detected = bool(parsed.get("fraud_detected", False))

    return {
        "name": extracted_name or "N/A",
        "email": contact.get("email", "N/A"),
        "phone": contact.get("phone", "N/A"),
        "jd_role": get_field("jd_role", role),
        "skills_match": skills_match,
        "domain_match": domain_match,
        "experience_match": experience_match,
        "jd_similarity": jd_similarity,
        "score": score_rounded,
        "fitment": str(fitment),
        "summary_5_lines": str(summary),
        "red_flags": red_flags[:10],
        "missing_gaps": missing_gaps[:10],
        "fraud_detected": fraud_detected,
        "reasons_if_rejected": rejection_reasons[:10],
        "recommendation": str(get_field("recommendation"))[:500],
        "highlights": highlights[:15],
        "verdict": verdict,
        "resume_text": resume_text,
        "resume_file": resume_file,
        "processing_time": processing_time,
        "analysis_timestamp": time.time()
    }

def create_fallback_response(
    contact: dict, 
    role: str, 
    jd_similarity: float, 
    resume_text: str, 
    resume_file: str, 
    error_reason: str = "Analysis failed"
) -> dict:
    """Create a fallback response when GPT analysis fails"""
    
    basic_score = max(0, jd_similarity * 0.6)
    candidate_name = contact.get("name", "N/A")
    fitment = f"Automated analysis incomplete due to: {error_reason}."
    
    return {
        "name": candidate_name,
        "email": contact.get("email", "N/A"), 
        "phone": contact.get("phone", "N/A"),
        "jd_role": role,
        "skills_match": 0,
        "domain_match": 0,
        "experience_match": 0,
        "jd_similarity": jd_similarity,
        "score": round(basic_score, 2),
        "fitment": fitment,
        "summary_5_lines": f"Analysis for {role} position was incomplete.",
        "red_flags": ["Analysis failed - manual review required"],
        "missing_gaps": ["Complete analysis unavailable"],
        "fraud_detected": True,
        "reasons_if_rejected": [f"Analysis failure: {error_reason}"],
        "recommendation": "Manual review recommended",
        "highlights": [],
        "verdict": "review",
        "resume_text": resume_text,
        "resume_file": resume_file,
        "processing_time": 0.0,
        "analysis_timestamp": time.time()
    }