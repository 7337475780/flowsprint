import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  reorderTasks,
  addComment,
  toggleSubtask,
  getTaskStats,
} from '../api/taskApi.js';

/**
 * Hook to retrieve filtered, searched, and paginated tasks.
 */
export function useTasksQuery(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['tasks-paginated', params],
    queryFn: () => getTasks(params),
  });
}

/**
 * Hook to retrieve single task details.
 */
export function useTaskDetailsQuery(id: string) {
  return useQuery({
    queryKey: ['task-details', id],
    queryFn: () => getTaskById(id),
    enabled: !!id,
  });
}

/**
 * Hook to retrieve aggregate task metrics.
 */
export function useTaskStatsQuery(projectId?: string) {
  return useQuery({
    queryKey: ['tasks-stats-overview', projectId],
    queryFn: () => getTaskStats(projectId),
    enabled: !!projectId,
  });
}

/**
 * Hook to create a new task.
 */
export function useCreateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-stats-overview'] });
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
 * Hook to modify task variables.
 */
export function useUpdateTaskMutation(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => updateTask(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-stats-overview'] });
      queryClient.invalidateQueries({ queryKey: ['task-details', id] });
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
export function useDeleteTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-stats-overview'] });
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
 * Hook to quick-shift status columns.
 */
export function useUpdateTaskStatusMutation(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: string) => updateTaskStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-stats-overview'] });
      queryClient.invalidateQueries({ queryKey: ['task-details', id] });
      toast.success(`Task transitioned to "${data.status}"`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to transition task';
      toast.error(msg);
    },
  });
}

/**
 * Hook to reorder task ranks (used during Drag & Drop).
 */
export function useReorderTasksMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, position }: { id: string; status: string; position: number }) =>
      reorderTasks(id, status, position),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-stats-overview'] });
      queryClient.invalidateQueries({ queryKey: ['task-details', data._id] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to reorder task';
      toast.error(msg);
    },
  });
}

/**
 * Hook to append a comment.
 */
export function useAddCommentMutation(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (text: string) => addComment(id, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['task-details', id] });
      toast.success('Comment posted successfully');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to post comment';
      toast.error(msg);
    },
  });
}

/**
 * Hook to toggle a subtask checklist checkmark.
 */
export function useToggleSubtaskMutation(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ subtaskId, completed }: { subtaskId: string; completed: boolean }) =>
      toggleSubtask(taskId, subtaskId, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['task-details', taskId] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to update subtask';
      toast.error(msg);
    },
  });
}
