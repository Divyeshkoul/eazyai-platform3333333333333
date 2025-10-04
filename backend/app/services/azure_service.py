from azure.storage.blob import BlobServiceClient, BlobClient
from typing import List, Tuple, Optional
import logging
from app.core.constants import AZURE_CONFIG

logger = logging.getLogger(__name__)

class AzureBlobService:
    def __init__(self):
        self.connection_string = AZURE_CONFIG["connection_string"]
        self.client = BlobServiceClient.from_connection_string(
            self.connection_string
        )
    
    def list_blobs(self, container_name: str) -> List[str]:
        """List all blobs in a container"""
        try:
            container_client = self.client.get_container_client(container_name)
            return [blob.name for blob in container_client.list_blobs()]
        except Exception as e:
            logger.error(f"Error listing blobs: {e}")
            return []
    
    def upload_blob(
        self, 
        data: bytes, 
        blob_name: str, 
        container_name: str,
        overwrite: bool = True
    ) -> bool:
        """Upload data to blob storage"""
        try:
            blob_client = self.client.get_blob_client(
                container=container_name,
                blob=blob_name
            )
            blob_client.upload_blob(data, overwrite=overwrite)
            return True
        except Exception as e:
            logger.error(f"Error uploading blob: {e}")
            return False
    
    def download_blob(self, blob_name: str, container_name: str) -> Optional[bytes]:
        """Download blob data"""
        try:
            blob_client = self.client.get_blob_client(
                container=container_name,
                blob=blob_name
            )
            return blob_client.download_blob().readall()
        except Exception as e:
            logger.error(f"Error downloading blob: {e}")
            return None
    
    def delete_blob(self, blob_name: str, container_name: str) -> bool:
        """Delete a blob"""
        try:
            blob_client = self.client.get_blob_client(
                container=container_name,
                blob=blob_name
            )
            blob_client.delete_blob()
            return True
        except Exception as e:
            logger.error(f"Error deleting blob: {e}")
            return False

azure_blob_service = AzureBlobService()