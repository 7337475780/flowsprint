import { Download, FileText, ExternalLink } from 'lucide-react';
import { IFile } from '../api/fileApi.js';
import { formatFileSize } from './FileCard.js';
import { cn, resolveAssetUrl } from '../../../lib/utils.js';

interface FilePreviewProps {
  file: IFile;
  className?: string;
}

export default function FilePreview({ file, className }: FilePreviewProps) {
  // Safe URL resolution
  const resolvedUrl = resolveAssetUrl(file.fileUrl);

  // Image Preview Renderer
  if (file.fileType === 'image') {
    return (
      <div className={cn('flex flex-col items-center justify-center p-4 bg-secondary/10 rounded-2xl border overflow-hidden max-h-[450px]', className)}>
        <div className="relative group overflow-hidden rounded-xl border max-w-full">
          <img
            src={resolvedUrl}
            alt={file.originalName}
            className="max-h-[350px] max-w-full object-contain rounded-xl select-none group-hover:scale-[1.01] transition-transform duration-500 shadow-sm"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
            <a
              href={resolvedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-card/90 text-foreground text-3xs font-extrabold uppercase tracking-wider rounded-lg shadow-sm border flex items-center gap-1.5 hover:scale-105 transition-transform"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Full screen view
            </a>
          </div>
        </div>
        <div className="mt-3.5 text-center">
          <h4 className="text-xs font-bold text-foreground truncate max-w-xs">{file.originalName}</h4>
          <span className="text-4xs font-mono text-muted-foreground mt-0.5 block">
            IMAGE &bull; {formatFileSize(file.size)}
          </span>
        </div>
      </div>
    );
  }

  // PDF Preview Renderer
  if (file.fileType === 'pdf') {
    return (
      <div className={cn('flex flex-col border bg-card rounded-2xl overflow-hidden', className)}>
        {/* Render PDF in-app using iframe */}
        <div className="relative w-full h-[400px] border-b bg-secondary/15 flex items-center justify-center">
          <iframe
            src={`${resolvedUrl}#toolbar=0`}
            title={file.originalName}
            className="w-full h-full rounded-t-2xl border-none"
            loading="lazy"
          />
        </div>
        <div className="p-4 flex items-center justify-between bg-secondary/5 text-2xs">
          <div>
            <h4 className="font-bold text-foreground truncate max-w-xs">{file.originalName}</h4>
            <span className="text-4xs font-mono text-muted-foreground uppercase block mt-0.5">
              PDF Document &bull; {formatFileSize(file.size)}
            </span>
          </div>
          <a
            href={resolvedUrl}
            download={file.originalName}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground font-bold text-3xs uppercase tracking-wider rounded-lg shadow-sm hover:bg-primary/95 transition-all active:scale-95 shrink-0"
          >
            <Download className="h-3.5 w-3.5" /> Download
          </a>
        </div>
      </div>
    );
  }

  // Document/Other Preview Fallback
  return (
    <div className={cn('border bg-card p-6.5 rounded-2xl text-center space-y-4 flex flex-col items-center justify-center bg-gradient-to-b from-card to-secondary/5', className)}>
      <div className="h-16 w-16 rounded-2xl bg-secondary/50 border flex items-center justify-center text-primary shadow-3xs animate-pulse">
        <FileText className="h-8 w-8" />
      </div>

      <div className="space-y-1">
        <h4 className="text-sm font-extrabold text-foreground truncate max-w-sm tracking-tight">{file.originalName}</h4>
        <p className="text-2xs text-muted-foreground">
          Inline preview is not supported for {file.fileType === 'doc' ? 'documents' : 'this file format'}. Please download the file to inspect.
        </p>
        <span className="font-mono text-3xs text-muted-foreground uppercase bg-secondary px-2.5 py-0.5 rounded border inline-block mt-1">
          {file.fileType.toUpperCase()} &bull; {formatFileSize(file.size)}
        </span>
      </div>

      <div className="flex gap-3 justify-center pt-2">
        <a
          href={resolvedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-secondary border text-foreground font-bold text-3xs uppercase tracking-wider rounded-lg hover:bg-secondary/80 transition-all"
        >
          <ExternalLink className="h-3.5 w-3.5" /> Open in tab
        </a>
        <a
          href={resolvedUrl}
          download={file.originalName}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary text-primary-foreground font-bold text-3xs uppercase tracking-wider rounded-lg shadow-md hover:bg-primary/95 transition-all active:scale-95"
        >
          <Download className="h-3.5 w-3.5" /> Download Asset
        </a>
      </div>
    </div>
  );
}
