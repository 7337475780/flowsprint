import path from 'path';
import { FileType } from './file.types.js';

/**
 * Sanitizes a filename to make it safe for file storage systems.
 * Removes spaces and dangerous characters, prefixes timestamp for uniqueness.
 */
export const sanitizeFileName = (originalName: string): string => {
  const ext = path.extname(originalName);
  const base = path.basename(originalName, ext);
  
  // Keep only alphanumeric and dashes, convert to lowercase
  const cleanBase = base
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-') // collapse consecutive dashes
    .replace(/(^-|-$)/g, ''); // trim leading/trailing dashes

  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 6);

  return `${cleanBase}-${timestamp}-${randomStr}${ext}`;
};

/**
 * Maps standard MIME types and extensions to FlowSprint categorizations.
 */
export const getFileTypeFromMime = (mimeType: string, fileName: string): FileType => {
  const typeStr = mimeType ? mimeType.toLowerCase() : '';
  const extStr = fileName ? path.extname(fileName).toLowerCase() : '';

  if (typeStr.startsWith('image/')) {
    return 'image';
  }

  if (typeStr === 'application/pdf' || extStr === '.pdf') {
    return 'pdf';
  }

  // Document types
  const docMimes = [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
    'text/plain',
    'text/csv',
    'text/markdown',
  ];
  
  const docExtensions = ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv', '.md'];

  if (docMimes.includes(typeStr) || docExtensions.includes(extStr)) {
    return 'doc';
  }

  return 'other';
};
