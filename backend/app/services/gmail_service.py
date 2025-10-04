import imaplib
import email
from datetime import datetime
from app.core.config import settings
from app.utils.parse_resume import upload_to_blob
from app.core.constants import AZURE_CONFIG
import logging

logger = logging.getLogger(__name__)

async def process_gmail_resumes():
    """Process unread emails from Gmail and upload attachments"""
    try:
        logger.info("Starting Gmail sync...")
        
        # Connect to Gmail
        mail = imaplib.IMAP4_SSL(settings.GMAIL_IMAP_SERVER, settings.GMAIL_IMAP_PORT)
        mail.login(settings.GMAIL_EMAIL, settings.GMAIL_APP_PASSWORD)
        mail.select('inbox')
        
        logger.info("Connected to Gmail successfully")
        
        # Search for unread emails
        status, messages = mail.search(None, 'UNSEEN')
        email_ids = messages[0].split()
        
        logger.info(f"Found {len(email_ids)} unread emails")
        
        emails_processed = 0
        files_uploaded = 0
        
        for email_id in email_ids:
            try:
                status, msg_data = mail.fetch(email_id, '(RFC822)')
                msg = email.message_from_bytes(msg_data[0][1])
                
                # Process attachments
                for part in msg.walk():
                    if part.get_content_maintype() == 'multipart':
                        continue
                    if part.get('Content-Disposition') is None:
                        continue
                    
                    filename = part.get_filename()
                    if filename and any(filename.lower().endswith(ext) for ext in ['.pdf', '.doc', '.docx']):
                        file_data = part.get_payload(decode=True)
                        
                        logger.info(f"Processing attachment: {filename}")
                        
                        # Upload to blob
                        success = upload_to_blob(
                            file_data,
                            filename,
                            AZURE_CONFIG["resumes_container"]
                        )
                        
                        if success:
                            files_uploaded += 1
                            logger.info(f"Uploaded {filename} from Gmail")
                
                emails_processed += 1
                
            except Exception as e:
                logger.error(f"Error processing email {email_id}: {e}")
                continue
        
        mail.close()
        mail.logout()
        
        logger.info(f"Gmail sync complete: {emails_processed} emails, {files_uploaded} files")
        
        return {
            "emails_processed": emails_processed,
            "files_uploaded": files_uploaded,
            "timestamp": datetime.now().isoformat()
        }
        
    except imaplib.IMAP4.error as e:
        logger.error(f"Gmail IMAP error: {e}")
        return {
            "emails_processed": 0,
            "files_uploaded": 0,
            "timestamp": datetime.now().isoformat(),
            "error": f"Gmail authentication failed: {str(e)}"
        }
    except Exception as e:
        logger.error(f"Gmail sync error: {e}")
        return {
            "emails_processed": 0,
            "files_uploaded": 0,
            "timestamp": datetime.now().isoformat(),
            "error": str(e)
        }