import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getFiles, uploadFiles, deleteFile } from '../api/fileApi.js';

/**
 * Hook to retrieve files optionally filtered by taskId or projectId.
 */
export function useFilesQuery(params: { taskId?: string; projectId?: string }) {
  return useQuery({
    queryKey: ['files', params],
    queryFn: () => getFiles(params),
    enabled: !!(params.taskId || params.projectId),
    staleTime: 60000,
    gcTime: 300000,
  });
}

/**
 * Hook to upload one or multiple files.
 * Invalidates related queries on success to keep all parts of the UI perfectly synced.
 */
export function useUploadFilesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      files,
      association,
    }: {
      files: File[];
      association: { taskId?: string; projectId?: string; sprintId?: string };
    }) => uploadFiles(files, association),
    onSuccess: (data, variables) => {
      // Invalidate files lists
      queryClient.invalidateQueries({ queryKey: ['files'] });
      
      // Invalidate task details and boards if task context exists
      if (variables.association.taskId) {
        queryClient.invalidateQueries({ queryKey: ['task-details', variables.association.taskId] });
        queryClient.invalidateQueries({ queryKey: ['tasks-paginated'] });
      }

      // Invalidate project details and overview boards if project context exists
      if (variables.association.projectId) {
        queryClient.invalidateQueries({ queryKey: ['project-details', variables.association.projectId] });
        queryClient.invalidateQueries({ queryKey: ['projects-paginated'] });
      }

      toast.success(`${data.length} file(s) uploaded successfully!`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to upload files';
      toast.error(msg);
    },
  });
}

/**
 * Hook to delete an attachment.
 * Optimistically invalidates caches.
 */
export function useDeleteFileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteFile(id),
    onSuccess: () => {
      // Invalidate files lists
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['task-details'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['projects-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['project-details'] });
      
      toast.success('Attachment deleted successfully!');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to delete attachment';
      toast.error(msg);
    },
  });
}
