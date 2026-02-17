import os
import io
import sys
import pickle
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload, MediaFileUpload

# Scopes for full access to upload, download, and manage files
SCOPES = ['https://www.googleapis.com/auth/drive']

def get_base_path():
    """Finds the directory where credentials should live."""
    if getattr(sys, 'frozen', False):
        # Running as a PyInstaller bundle
        return os.path.dirname(sys.executable)
    # Running as a script
    return os.path.dirname(os.path.abspath(__file__))

class GoogleDriveService:
    def __init__(self):
        self.creds = None
        self.service = None
        self.download_progress = {}

        # 1. Start with the directory of the executable/script
        base_dir = get_base_path()
        
        # 2. Try to find client_secret.json in a few common places
        possible_paths = [
            os.path.join(base_dir, 'client_secret.json'),                 # Next to binary
            os.path.join(os.getcwd(), 'client_secret.json'),              # Current working directory
            os.path.join(os.path.dirname(base_dir), 'client_secret.json') # Parent (src-tauri)
        ]
        
        self.secret_path = None
        for path in possible_paths:
            if os.path.exists(path):
                self.secret_path = path
                self.base_dir = os.path.dirname(path) # Set base to where we found secrets
                break
        
        if not self.secret_path:
            # If not found, default to binary folder (will throw error later in authenticate)
            self.base_dir = base_dir
            self.secret_path = os.path.join(base_dir, 'client_secret.json')
            
        self.token_path = os.path.join(self.base_dir, 'token.json')

    def authenticate(self):
        """Handles OAuth 2.0 flow with robust pathing for sidecar environment."""
        creds = None
        
        # 1. Load existing token from the resolved path
        if os.path.exists(self.token_path):
            creds = Credentials.from_authorized_user_file(self.token_path, SCOPES)
        
        # 2. Refresh or re-authenticate if necessary
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                try:
                    creds.refresh(Request())
                except Exception:
                    if os.path.exists(self.token_path):
                        os.remove(self.token_path)
                    return self.authenticate()
            else:
                # 3. New Login Flow
                if not os.path.exists(self.secret_path):
                    raise FileNotFoundError(f"Missing client_secret.json at {self.secret_path}")
                
                flow = InstalledAppFlow.from_client_secrets_file(self.secret_path, SCOPES)
                creds = flow.run_local_server(port=0)
            
            # Save the credentials back to the resolved path
            with open(self.token_path, 'w') as token:
                token.write(creds.to_json())

        self.creds = creds
        self.service = build('drive', 'v3', credentials=creds)
        
        return {"status": "Authenticated", "scopes": SCOPES}

    def list_files(self, page_size=20): 
        """Returns a list of files with rich metadata."""
        if not self.service:
            self.authenticate()
            
        fields = "nextPageToken, files(id, name, mimeType, size, iconLink, thumbnailLink, createdTime)"
        results = self.service.files().list(
            pageSize=page_size, 
            fields=fields
        ).execute()
        
        return results.get('files', [])

    def download_file(self, file_id):
        """Downloads/Exports file and tracks progress in self.download_progress."""
        if not self.service:
            self.authenticate()

        self.download_progress[file_id] = 0.0
        file_metadata = self.service.files().get(fileId=file_id, fields='name, mimeType').execute()
        mime_type = file_metadata.get('mimeType')
        
        # Handle Google Workspace files (Docs/Sheets) via Export
        if mime_type.startswith('application/vnd.google-apps.'):
            export_mapping = {
                'application/vnd.google-apps.document': 'application/pdf',
                'application/vnd.google-apps.spreadsheet': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.google-apps.presentation': 'application/pdf'
            }
            export_mime = export_mapping.get(mime_type, 'application/pdf')
            request = self.service.files().export_media(fileId=file_id, mimeType=export_mime)
        else:
            # Handle binary files
            request = self.service.files().get_media(fileId=file_id)

        file_stream = io.BytesIO()
        downloader = MediaIoBaseDownload(file_stream, request)
        
        done = False
        while not done:
            status, done = downloader.next_chunk()
            if status:
                self.download_progress[file_id] = status.progress() * 100
        
        self.download_progress[file_id] = 100.0
        file_stream.seek(0)
        return file_stream, file_metadata.get('name', 'downloaded_file')

    def get_progress(self, item_id):
        """Pollable helper for UI progress bars."""
        return self.download_progress.get(item_id, 0.0)

    def upload_file(self, local_path, file_name):
        """Uploads local file via resumable media and tracks progress."""
        if not self.service:
            self.authenticate()

        self.download_progress[file_name] = 0.0

        try:
            file_metadata = {'name': file_name}
            media = MediaFileUpload(local_path, resumable=True)
            
            request = self.service.files().create(
                body=file_metadata, 
                media_body=media, 
                fields='id'
            )
            
            response = None
            while response is None:
                status, response = request.next_chunk()
                if status:
                    self.download_progress[file_name] = status.progress() * 100

            self.download_progress[file_name] = 100.0
            return response
            
        except Exception as e:
            print(f"Upload Error: {str(e)}")
            raise e
        finally:
            # Keep progress briefly for UI catch-up, then clear
            if file_name in self.download_progress:
                # Optional: you could use a timer thread here to clear after 2 seconds
                pass

# Singleton instance
drive_service = GoogleDriveService()