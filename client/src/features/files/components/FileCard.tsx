import { useState } from 'react';
import { 
  FileText, Image, File, Trash2, Eye, ExternalLink, ShieldAlert
} from 'lucide-react';
import { useAuthStore } from '../../../store/authStore.js';
import { useDeleteFileMutation } from '../hooks/useFiles.js';
import { IFile } from '../api/fileApi.js';
import { cn } from '../../../lib/utils.js';

interface FileCardProps {
  file: IFile;
  onPreview: (file: IFile) => void;
}

/**
 * Format file size in bytes to a human-readable string.
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/**
 * Returns type-specific styling and icons for various file types.
 */
const getFileIconConfig = (type: string) => {
  switch (type) {
    case 'image':
      return {
        icon: Image,
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
      };
    case 'pdf':
      return {
        icon: FileText,
        color: 'text-rose-400 bg-rose-500/10 border-rose-500/25',
      };
    case 'doc':
      return {
        icon: FileText,
        color: 'text-sky-400 bg-sky-500/10 border-sky-500/25',
      };
    default:
      return {
        icon: File,
        color: 'text-slate-400 bg-slate-500/10 border-slate-500/25',
      };
  }
};

export default function FileCard({ file, onPreview }: FileCardProps) {
  const user = useAuthStore((s) => s.user);
  const deleteMutation = useDeleteFileMutation();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const ownerId = typeof file.uploadedBy === 'object' ? file.uploadedBy._id : file.uploadedBy;
  const canDelete = user?.role === 'admin' || user?.role === 'manager' || user?._id === ownerId;

  const { icon: Icon, color: iconTheme } = getFileIconConfig(file.fileType);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000); // Reset confirmation after 3s
      return;
    }
    deleteMutation.mutate(file._id);
  };

  // Safe file path resolution
  const resolvedUrl = file.fileUrl.startsWith('http')
    ? file.fileUrl
    : `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}${file.fileUrl}`;

  return (
    <div
      onClick={() => onPreview(file)}
      className={cn(
        'group relative border bg-card/65 backdrop-blur-xs rounded-xl p-4.5 flex gap-3.5 items-center',
        'hover:shadow-md hover:border-primary/45 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer',
        deleteMutation.isPending && 'opacity-55 pointer-events-none'
      )}
    >
      {/* Dynamic Type Icon */}
      <div className={cn('h-10.5 w-10.5 rounded-lg border flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover:scale-105', iconTheme)}>
        {file.fileType === 'image' && file.fileUrl ? (
          <img
            src={resolvedUrl}
            alt={file.originalName}
            className="h-full w-full object-cover rounded-lg"
            loading="lazy"
            onError={(e) => {
              // fallback if image fails to load
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <Icon className="h-5 w-5" />
        )}
      </div>

      {/* File Details */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-xs text-foreground truncate select-none tracking-tight group-hover:text-primary transition-colors">
          {file.originalName}
        </h4>
        <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-4xs font-mono font-medium text-muted-foreground">
          <span>{formatFileSize(file.size)}</span>
          <span className="h-1 w-1 bg-secondary rounded-full" />
          <span className="truncate max-w-[80px]" title={file.uploadedBy?.name || 'FlowSprint User'}>
            by {file.uploadedBy?.name || 'Unknown'}
          </span>
          <span className="h-1 w-1 bg-secondary rounded-full" />
          <span>{new Date(file.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Control Actions Row (Invisible by default, reveals on card hover!) */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200" onClick={(e) => e.stopPropagation()}>
        {/* Open in tab */}
        <a
          href={resolvedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 hover:bg-secondary text-muted-foreground hover:text-primary rounded-md transition-colors"
          title="Open in new tab"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>

        {/* Inline Preview Toggle */}
        <button
          onClick={() => onPreview(file)}
          className="p-1.5 hover:bg-secondary text-muted-foreground hover:text-primary rounded-md transition-colors"
          title="Quick preview inline"
        >
          <Eye className="h-3.5 w-3.5" />
        </button>

        {/* Authorized Delete controls */}
        {canDelete && (
          <button
            onClick={handleDelete}
            className={cn(
              'p-1.5 rounded-md transition-all',
              confirmDelete
                ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'
                : 'hover:bg-secondary text-muted-foreground hover:text-destructive'
            )}
            title={confirmDelete ? 'Click again to confirm delete' : 'Delete file'}
          >
            <Trash2 className="h-3.5 w-3.5 animate-pulse" />
          </button>
        )}
      </div>

      {/* Compact confirmation banner */}
      {confirmDelete && (
        <div className="absolute inset-0 bg-destructive/95 backdrop-blur-xs rounded-xl flex items-center justify-center gap-2 text-3xs font-bold text-destructive-foreground animate-in fade-in zoom-in duration-200">
          <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
          <span>Confirm hard delete? Click trash icon to wipe!</span>
        </div>
      )}
    </div>
  );
}
