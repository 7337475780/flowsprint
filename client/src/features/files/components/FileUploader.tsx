import { useState, useRef } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useUploadFilesMutation } from '../hooks/useFiles.js';
import { cn } from '../../../lib/utils.js';

interface FileUploaderProps {
  taskId?: string;
  projectId?: string;
  sprintId?: string;
  className?: string;
}

export default function FileUploader({ taskId, projectId, sprintId, className }: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const uploadMutation = useUploadFilesMutation();

  // Drag Handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  // Drop files
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      await processAndUploadFiles(filesArray);
    }
  };

  // Click container to choose files
  const handleClickContainer = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // File explorer selection handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      await processAndUploadFiles(filesArray);
      // Reset input value so same files can be selected again
      e.target.value = '';
    }
  };

  // Validate and perform upload
  const processAndUploadFiles = async (files: File[]) => {
    const validFiles: File[] = [];
    const maxLimit = 10 * 1024 * 1024; // 10MB

    files.forEach((file) => {
      if (file.size > maxLimit) {
        toast.error(`File "${file.name}" exceeds the 10MB upload limit.`);
      } else {
        validFiles.push(file);
      }
    });

    if (validFiles.length === 0) return;

    try {
      await uploadMutation.mutateAsync({
        files: validFiles,
        association: { taskId, projectId, sprintId },
      });
    } catch {
      // Mutation handles error toasts internally
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Zone */}
      <div
        onClick={handleClickContainer}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-2xl p-6.5 text-center flex flex-col items-center justify-center cursor-pointer transition-all duration-300',
          isDragging 
            ? 'border-primary bg-primary/4 scale-[1.005] shadow-inner' 
            : 'border-secondary hover:border-primary/40 bg-secondary/5 hover:bg-secondary/15',
          uploadMutation.isPending && 'opacity-65 pointer-events-none'
        )}
      >
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          className="hidden"
          accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.md,.zip"
        />

        {/* Inner Content */}
        {uploadMutation.isPending ? (
          <div className="space-y-3.5 py-2">
            <Loader2 className="h-8.5 w-8.5 text-primary animate-spin mx-auto" />
            <div className="space-y-1">
              <span className="text-xs font-bold text-foreground block">
                Uploading files to storage...
              </span>
              <span className="text-4xs font-mono font-bold text-muted-foreground uppercase tracking-widest block">
                Executing cloud payload transfer
              </span>
            </div>
            {/* Linear animated progress simulator */}
            <div className="w-44 bg-secondary h-1.5 rounded-full overflow-hidden mx-auto">
              <div className="h-full bg-primary rounded-full animate-[progress_1.8s_ease-in-out_infinite]" style={{ width: '100%' }} />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className={cn(
              'h-11.5 w-11.5 rounded-xl border bg-card flex items-center justify-center text-muted-foreground mx-auto shadow-3xs transition-transform',
              isDragging && 'scale-110 text-primary border-primary/30 bg-primary/5'
            )}>
              <UploadCloud className="h-5.5 w-5.5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-extrabold text-foreground tracking-tight select-none">
                {isDragging ? 'Drop assets here to trigger upload' : 'Drag & drop assets here, or click to browse'}
              </p>
              <p className="text-4xs font-mono font-medium text-muted-foreground uppercase tracking-wider select-none">
                Supports images, PDF, documents up to 10MB
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
