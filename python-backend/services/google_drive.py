import os.path
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/drive.readonly']

class GoogleDriveService:
    def __init__(self):
        self.creds = None
        self.service = None

    def authenticate(self):
        """
        Handles the OAuth 2.0 Flow.
        1. Checks for existing token.json.
        2. If expired, refreshes it.
        3. If missing, opens browser for login.
        """
        creds = None
        
        # 1. Load existing token
        if os.path.exists('token.json'):
            creds = Credentials.from_authorized_user_file('token.json', SCOPES)
        
        # 2. If no valid credentials, let user log in.
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                try:
                    creds.refresh(Request())
                except Exception:
                    # Token invalid, force re-login
                    os.remove('token.json')
                    return self.authenticate()
            else:
                # 3. New Login
                if not os.path.exists('client_secret.json'):
                    raise FileNotFoundError("Missing client_secret.json")
                
                flow = InstalledAppFlow.from_client_secrets_file(
                    'client_secret.json', SCOPES)
                
                # This opens the browser!
                # We use port 0 so the OS picks a free port for the callback
                creds = flow.run_local_server(port=0)
            
            # Save the credentials for the next run
            with open('token.json', 'w') as token:
                token.write(creds.to_json())

        self.creds = creds
        self.service = build('drive', 'v3', credentials=creds)
        
        return {"status": "Authenticated", "scopes": SCOPES}

    def list_files(self, page_size=10):
        """Returns a list of files from Drive."""
        if not self.service:
            self.authenticate()
            
        results = self.service.files().list(
            pageSize=page_size, fields="nextPageToken, files(id, name, mimeType)").execute()
        return results.get('files', [])

# Singleton instance
drive_service = GoogleDriveService()