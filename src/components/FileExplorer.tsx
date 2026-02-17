import React, { useState } from "react";
import { DriveFile, api } from "../api/client"; 
import "./FileExplorer.css";
import { open } from "@tauri-apps/plugin-dialog"; 

interface FileExplorerProps {
  files: DriveFile[];
  loading: boolean;
  onRefresh: () => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({ files, loading, onRefresh }) => {
  const [downloadingItems, setDownloadingItems] = useState<Record<string, number>>({});

  const handleDownload = async (file: DriveFile) => {
    setDownloadingItems(prev => ({ ...prev, [file.id]: 0.1 }));

    const progressInterval = setInterval(async () => {
      try {
        const status = await api.getDownloadStatus(file.id);
        setDownloadingItems(prev => ({ ...prev, [file.id]: status.progress }));
      } catch (e) {
        clearInterval(progressInterval);
      }
    }, 500);

    try {
      const blob = await api.downloadFile(file.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name; 
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      alert("Download failed. Check logs.");
    } finally {
      clearInterval(progressInterval);
      setDownloadingItems(prev => {
        const next = { ...prev };
        delete next[file.id];
        return next;
      });
    }
  };

  const handleUpload = async () => {
    try {
      // Use the Dialog plugin's open
      const selected = await open({
        multiple: false,
        directory: false,
      });

      // Extract the string path safely
      let filePath: string | null = null;
      
      if (selected && typeof selected === 'object' && 'path' in selected) {
        filePath = (selected as any).path;
      } else if (typeof selected === 'string') {
        filePath = selected;
      }

      if (filePath) {
        const fileName = filePath.split('/').pop() || "uploading-file";
        
        // Use filename for progress tracking
        setDownloadingItems(prev => ({ ...prev, [fileName]: 0.1 }));
        
        const progressInterval = setInterval(async () => {
          try {
            const status = await api.getDownloadStatus(fileName);
            setDownloadingItems(prev => ({ ...prev, [fileName]: status.progress }));
          } catch (e) {
            console.error("Status poll failed", e);
          }
        }, 500);

        try {
          await api.uploadFile(filePath);
          console.log("Upload successful!");
        } finally {
          clearInterval(progressInterval);
          setDownloadingItems(prev => {
            const next = { ...prev };
            delete next[fileName];
            return next;
          });
          onRefresh(); 
        }
      }
    } catch (e) {
      console.error("Upload failed", e);
      alert(`Upload Error: ${e}`);
    }
  };

  const formatSize = (bytes?: string) => {
    if (!bytes) return "";
    const b = parseInt(bytes, 10);
    if (b < 1024) return b + " B";
    if (b < 1048576) return (b / 1024).toFixed(1) + " KB";
    return (b / 1048576).toFixed(1) + " MB";
  };

  return (
    <div className="explorer-container">
      <div className="explorer-header">
        <h2>My Drive</h2>
        <div className="header-actions">
           <button onClick={handleUpload} className="upload-main-btn">
             ↑ Upload File
           </button>
           <button onClick={onRefresh} disabled={loading}>
             {loading ? "Syncing..." : "↻ Refresh"}
           </button>
        </div>
      </div>

      {files.length === 0 && !loading ? (
        <div className="empty-state">No files found.</div>
      ) : (
        <div className="file-grid">
          {files.map((file) => {
            const isDownloading = file.id in downloadingItems;
            const progress = downloadingItems[file.id] || 0;

            return (
              <div key={file.id} className={`file-card ${isDownloading ? 'downloading' : ''}`}>
                <div className="file-icon">
                  <img 
                    src={file.thumbnailLink || file.iconLink} 
                    alt="" 
                    className={file.thumbnailLink ? "thumb" : "icon"} 
                  />
                </div>
                <div className="file-info">
                  <div className="file-name" title={file.name}>{file.name}</div>
                  <div className="file-meta">
                    {file.mimeType.includes("folder") ? "Folder" : formatSize(file.size)}
                  </div>
                </div>
                
                {!file.mimeType.includes("folder") && (
                  isDownloading ? (
                    <div className="progress-container">
                      <div className="progress-bar-bg">
                        <div 
                          className="progress-bar-fill" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">{Math.round(progress)}%</span>
                    </div>
                  ) : (
                    <button 
                      className="download-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(file);
                      }}
                    >
                      Download
                    </button>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};