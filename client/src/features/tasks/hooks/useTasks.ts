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
    staleTime: 60000,
    gcTime: 300000,
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
    staleTime: 60000,
    gcTime: 300000,
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
    staleTime: 60000,
    gcTime: 300000,
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
 * Hook to quick-shift status columns using taskId in payload.
 */
export function useUpdateTaskStatusGeneralMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateTaskStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks-paginated'] });
      await queryClient.cancelQueries({ queryKey: ['sprints'] });
      await queryClient.cancelQueries({ queryKey: ['sprint-details'] });

      const previousTasksQueries = queryClient.getQueriesData({ queryKey: ['tasks-paginated'] });
      const previousSprintDetailsQueries = queryClient.getQueriesData({ queryKey: ['sprint-details'] });

      // Optimistically update tasks-paginated
      queryClient.setQueriesData<any>({ queryKey: ['tasks-paginated'] }, (old: any) => {
        if (!old) return old;
        const isArray = Array.isArray(old);
        const taskList = isArray ? old : old.data;
        if (!Array.isArray(taskList)) return old;

        const updatedList = taskList.map((t: any) => {
          if (t._id === id) {
            return { ...t, status };
          }
          return t;
        });

        return isArray ? updatedList : { ...old, data: updatedList };
      });

      // Optimistically update sprint-details
      queryClient.setQueriesData<any>({ queryKey: ['sprint-details'] }, (old: any) => {
        if (!old) return old;
        const isEnvelope = typeof old === 'object' && 'data' in old;
        const sprintData = isEnvelope ? old.data : old;

        if (sprintData && Array.isArray(sprintData.tasks)) {
          const updatedTasks = sprintData.tasks.map((t: any) => {
            if (t._id === id) {
              return { ...t, status };
            }
            return t;
          });
          const updatedSprint = { ...sprintData, tasks: updatedTasks };
          return isEnvelope ? { ...old, data: updatedSprint } : updatedSprint;
        }
        return old;
      });

      return { previousTasksQueries, previousSprintDetailsQueries };
    },
    onError: (err: any, _variables, context: any) => {
      if (context?.previousTasksQueries) {
        context.previousTasksQueries.forEach(([queryKey, previousValue]: any) => {
          queryClient.setQueryData(queryKey, previousValue);
        });
      }
      if (context?.previousSprintDetailsQueries) {
        context.previousSprintDetailsQueries.forEach(([queryKey, previousValue]: any) => {
          queryClient.setQueryData(queryKey, previousValue);
        });
      }
      const msg = err?.response?.data?.message || 'Failed to transition task';
      toast.error(msg);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-stats-overview'] });
      queryClient.invalidateQueries({ queryKey: ['task-details', data._id] });
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      queryClient.invalidateQueries({ queryKey: ['sprint-details'] });
      toast.success(`Task transitioned to "${data.status}"`);
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
    onMutate: async ({ id, status, position }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks-paginated'] });
      await queryClient.cancelQueries({ queryKey: ['sprints'] });
      await queryClient.cancelQueries({ queryKey: ['sprint-details'] });

      const previousTasksQueries = queryClient.getQueriesData({ queryKey: ['tasks-paginated'] });

      queryClient.setQueriesData<any>({ queryKey: ['tasks-paginated'] }, (old: any) => {
        if (!old) return old;
        const isArray = Array.isArray(old);
        const taskList = isArray ? old : old.data;
        if (!Array.isArray(taskList)) return old;

        const updatedList = taskList.map((t: any) => {
          if (t._id === id) {
            return { ...t, status, position };
          }
          return t;
        });

        return isArray ? updatedList : { ...old, data: updatedList };
      });

      return { previousTasksQueries };
    },
    onError: (err: any, _variables, context: any) => {
      if (context?.previousTasksQueries) {
        context.previousTasksQueries.forEach(([queryKey, previousValue]: any) => {
          queryClient.setQueryData(queryKey, previousValue);
        });
      }
      const msg = err?.response?.data?.message || 'Failed to reorder task';
      toast.error(msg);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-stats-overview'] });
      queryClient.invalidateQueries({ queryKey: ['task-details', data._id] });
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      queryClient.invalidateQueries({ queryKey: ['sprint-details'] });
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
