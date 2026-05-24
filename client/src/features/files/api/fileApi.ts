import api from '../../../api/axios.js';

export interface IFile {
  _id: string;
  fileName: string;
  originalName: string;
  fileUrl: string;
  fileType: 'image' | 'pdf' | 'doc' | 'other';
  size: number;
  uploadedBy: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  taskId?: string;
  projectId?: string;
  sprintId?: string;
  visibility: 'public' | 'private';
  createdAt: string;
  updatedAt: string;
}

export interface FileResponse {
  success: boolean;
  message: string;
  data: IFile[];
}

export interface SingleFileResponse {
  success: boolean;
  message: string;
  data: IFile;
}

/**
 * Fetch files matching taskId or projectId.
 */
export const getFiles = async (params: { taskId?: string; projectId?: string }): Promise<IFile[]> => {
  const { data } = await api.get<FileResponse>('/files', { params });
  return data.data;
};

/**
 * Upload files utilizing standard Multipart FormData.
 */
export const uploadFiles = async (
  files: File[],
  association: { taskId?: string; projectId?: string; sprintId?: string }
): Promise<IFile[]> => {
  const formData = new FormData();
  
  // Append files (using 'files' as key to match uploadMiddleware.any())
  files.forEach((file) => {
    formData.append('files', file);
  });

  // Append associations
  if (association.taskId) formData.append('taskId', association.taskId);
  if (association.projectId) formData.append('projectId', association.projectId);
  if (association.sprintId) formData.append('sprintId', association.sprintId);

  const { data } = await api.post<FileResponse>('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return data.data;
};

/**
 * Hard delete a file attachment.
 */
export const deleteFile = async (id: string): Promise<void> => {
  await api.delete(`/files/${id}`);
};
