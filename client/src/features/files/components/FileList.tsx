import { useState } from 'react';
import { 
  LayoutGrid, List, Loader2, RefreshCw, FolderClosed
} from 'lucide-react';
import { IFile } from '../api/fileApi.js';
import FileCard from './FileCard.js';
import { cn } from '../../../lib/utils.js';

interface FileListProps {
  files: IFile[];
  isLoading: boolean;
  onPreview: (file: IFile) => void;
  onRefresh?: () => void;
  className?: string;
}

export default function FileList({ files, isLoading, onPreview, onRefresh, className }: FileListProps) {
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-3.5 bg-card/40 border border-dashed rounded-2xl">
        <Loader2 className="h-6.5 w-6.5 text-primary animate-spin" />
        <span className="text-3xs font-mono font-bold text-muted-foreground uppercase tracking-widest">
          Syncing local attachments...
        </span>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="border border-dashed rounded-2xl p-7 text-center bg-secondary/5 flex flex-col items-center justify-center gap-2">
        <FolderClosed className="h-7 w-7 text-muted-foreground opacity-55" />
        <div className="space-y-0.5">
          <span className="text-2xs font-extrabold text-foreground block tracking-tight">
            No files attached yet
          </span>
          <span className="text-4xs text-muted-foreground block">
            Add assets using the uploader above to view them here.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* List Toolbar Controls */}
      <div className="flex items-center justify-between border-b pb-3.5">
        <span className="text-3xs font-extrabold uppercase tracking-widest text-muted-foreground">
          Attached Assets ({files.length})
        </span>

        <div className="flex items-center gap-1 bg-secondary/55 p-0.5 rounded-lg border">
          {/* Refresh */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1 hover:bg-card text-muted-foreground hover:text-foreground rounded transition-colors mr-1"
              title="Refresh list"
            >
              <RefreshCw className="h-3 w-3" />
            </button>
          )}

          {/* Grid Toggle */}
          <button
            onClick={() => setLayout('grid')}
            className={cn(
              'p-1.5 rounded transition-all',
              layout === 'grid' 
                ? 'bg-card text-foreground shadow-3xs border' 
                : 'text-muted-foreground hover:text-foreground'
            )}
            title="Grid view"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>

          {/* List Toggle */}
          <button
            onClick={() => setLayout('list')}
            className={cn(
              'p-1.5 rounded transition-all',
              layout === 'list' 
                ? 'bg-card text-foreground shadow-3xs border' 
                : 'text-muted-foreground hover:text-foreground'
            )}
            title="List view"
          >
            <List className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Grid or List dynamic structure */}
      <div
        className={cn(
          'transition-all duration-300',
          layout === 'grid'
            ? 'grid gap-3.5 sm:grid-cols-2'
            : 'space-y-2'
        )}
      >
        {files.map((file) => (
          <FileCard
            key={file._id}
            file={file}
            onPreview={onPreview}
          />
        ))}
      </div>
    </div>
  );
}
