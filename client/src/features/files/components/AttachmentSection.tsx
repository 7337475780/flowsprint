import { useState } from 'react';
import { Paperclip } from 'lucide-react';
import { useFilesQuery } from '../hooks/useFiles.js';
import FileUploader from './FileUploader.js';
import FileList from './FileList.js';
import FileModal from './FileModal.js';
import { IFile } from '../api/fileApi.js';
import { cn } from '../../../lib/utils.js';

interface AttachmentSectionProps {
  taskId?: string;
  projectId?: string;
  sprintId?: string;
  className?: string;
}

export default function AttachmentSection({ taskId, projectId, sprintId, className }: AttachmentSectionProps) {
  const [selectedFile, setSelectedFile] = useState<IFile | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch files automatically based on task or project parameters
  const { data: files = [], isLoading, refetch } = useFilesQuery({ taskId, projectId });

  const handleOpenPreview = (file: IFile) => {
    setSelectedFile(file);
    setModalOpen(true);
  };

  const handleClosePreview = () => {
    setSelectedFile(null);
    setModalOpen(false);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Title Header */}
      <div className="flex items-center gap-2 border-b pb-2">
        <Paperclip className="h-4.5 w-4.5 text-primary" />
        <h4 className="font-heading font-extrabold text-sm text-foreground tracking-tight select-none">
          File Attachments
        </h4>
        <span className="text-4xs font-mono font-extrabold bg-secondary text-foreground px-2 py-0.5 rounded-md border shrink-0">
          {files.length} ASSETS
        </span>
      </div>

      {/* Drag and Drop Zone */}
      <FileUploader
        taskId={taskId}
        projectId={projectId}
        sprintId={sprintId}
      />

      {/* Attachments List */}
      <FileList
        files={files}
        isLoading={isLoading}
        onPreview={handleOpenPreview}
        onRefresh={refetch}
      />

      {/* Fullscreen Lightbox Preview Overlay */}
      <FileModal
        isOpen={modalOpen}
        onClose={handleClosePreview}
        file={selectedFile}
      />
    </div>
  );
}
