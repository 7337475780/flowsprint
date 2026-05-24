import { X, Download, ExternalLink, Calendar, User, Layout } from 'lucide-react';
import { IFile } from '../api/fileApi.js';
import FilePreview from './FilePreview.js';
import { formatFileSize } from './FileCard.js';

interface FileModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: IFile | null;
}

export default function FileModal({ isOpen, onClose, file }: FileModalProps) {
  if (!isOpen || !file) return null;

  // Safe file URL resolution
  const resolvedUrl = file.fileUrl.startsWith('http')
    ? file.fileUrl
    : `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}${file.fileUrl}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
      {/* Dark backdrop with blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

      {/* Main modal container */}
      <div className="relative w-full max-w-2xl bg-card border rounded-2xl shadow-2xl z-10 flex flex-col overflow-hidden max-h-[85vh] animate-in zoom-in-95 duration-250">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b px-5.5 py-4 bg-secondary/15">
          <div className="flex items-center gap-2">
            <span className="font-mono text-3xs font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 tracking-wider">
              {file.fileType.toUpperCase()}
            </span>
            <span className="text-xs font-extrabold text-foreground truncate max-w-sm" title={file.originalName}>
              {file.originalName}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Download */}
            <a
              href={resolvedUrl}
              download={file.originalName}
              className="p-2 hover:bg-secondary text-muted-foreground hover:text-foreground rounded-lg transition-colors"
              title="Download file"
            >
              <Download className="h-4 w-4" />
            </a>

            {/* Open in tab */}
            <a
              href={resolvedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-secondary text-muted-foreground hover:text-foreground rounded-lg transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="h-4 w-4" />
            </a>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary text-muted-foreground hover:text-foreground rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content Area - Scrollable */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 flex flex-col gap-6 bg-card">
          {/* Main Visual Preview */}
          <div className="flex-1 flex justify-center items-center">
            <FilePreview file={file} className="w-full border-none shadow-none bg-transparent" />
          </div>

          {/* Metadata properties grid */}
          <div className="border-t pt-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-3xs font-mono font-medium text-muted-foreground">
            <div className="flex gap-2 items-center">
              <User className="h-4 w-4 text-primary shrink-0" />
              <div>
                <span className="block text-4xs uppercase tracking-wider opacity-60">Uploaded by</span>
                <span className="font-sans text-2xs font-extrabold text-foreground mt-0.5 truncate block">
                  {file.uploadedBy?.name || 'Unknown'}
                </span>
              </div>
            </div>

            <div className="flex gap-2 items-center">
              <Calendar className="h-4 w-4 text-primary shrink-0" />
              <div>
                <span className="block text-4xs uppercase tracking-wider opacity-60">Upload date</span>
                <span className="font-sans text-2xs font-bold text-foreground mt-0.5 block">
                  {new Date(file.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex gap-2 items-center">
              <Layout className="h-4 w-4 text-primary shrink-0" />
              <div>
                <span className="block text-4xs uppercase tracking-wider opacity-60">File size</span>
                <span className="font-sans text-2xs font-bold text-foreground mt-0.5 block">
                  {formatFileSize(file.size)}
                </span>
              </div>
            </div>

            <div className="flex gap-2 items-center">
              <div className="h-4 w-4 rounded bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <span className="text-primary font-bold text-4xs">V</span>
              </div>
              <div>
                <span className="block text-4xs uppercase tracking-wider opacity-60">Visibility</span>
                <span className="font-sans text-2xs font-extrabold text-emerald-400 capitalize mt-0.5 block">
                  {file.visibility}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
