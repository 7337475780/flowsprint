import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  reorderTasks,
  addComment,
  editComment,
  deleteComment,
} from '../api/tasksApi.js';

/**
 * Hook to retrieve filtered list of tasks.
 */
export function useTasks(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: () => getTasks(params),
  });
}

/**
 * Hook to retrieve details for a single task.
 */
export function useTaskDetails(id: string) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => getTaskById(id),
    enabled: !!id,
  });
}

/**
 * Hook to create a new task.
 */
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast.success(`Task "${data.title}" created successfully!`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to create task';
      toast.error(msg);
    },
  });
}

/**
 * Hook to update task metadata fields.
 */
export function useUpdateTask(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => updateTask(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      toast.success(`Task "${data.title}" updated successfully!`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to update task';
      toast.error(msg);
    },
  });
}

/**
 * Hook to remove a task.
 */
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast.success('Task deleted successfully');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to delete task';
      toast.error(msg);
    },
  });
}

/**
 * Hook to move task columns or statuses in the board.
 */
export function useMoveTask(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ status, position }: { status: any; position?: number }) =>
      moveTask(id, status, position),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to move task';
      toast.error(msg);
    },
  });
}

/**
 * Hook to reorder multiple tasks batch (optimistic updates ready).
 */
export function useReorderTasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reorderTasks,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

/**
 * Hook to post a comment to a task's thread.
 */
export function useAddComment(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (text: string) => addComment(taskId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      toast.success('Comment added successfully!');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to add comment';
      toast.error(msg);
    },
  });
}

/**
 * Hook to modify a task's comment.
 */
export function useEditComment(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, text }: { commentId: string; text: string }) =>
      editComment(taskId, commentId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      toast.success('Comment updated successfully!');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to modify comment';
      toast.error(msg);
    },
  });
}

/**
 * Hook to delete a task's comment.
 */
export function useDeleteComment(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => deleteComment(taskId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      toast.success('Comment deleted successfully!');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to delete comment';
      toast.error(msg);
    },
  });
}
