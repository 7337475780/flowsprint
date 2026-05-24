import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getSprints,
  getSprintById,
  createSprint,
  updateSprint,
  deleteSprint,
  startSprint,
  endSprint,
  cancelSprint,
  manageSprintTasks,
  getSprintBurndown,
  getSprintAnalytics,
} from '../api/sprintsApi.js';

/**
 * Hook to retrieve filtered list of sprints.
 */
export function useSprints(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['sprints', params],
    queryFn: () => getSprints(params),
    staleTime: 60000,
    gcTime: 300000,
  });
}

/**
 * Hook to retrieve sprint details with live task lists.
 */
export function useSprintDetails(id: string) {
  return useQuery({
    queryKey: ['sprint', id],
    queryFn: () => getSprintById(id),
    enabled: !!id,
    staleTime: 60000,
    gcTime: 300000,
  });
}

/**
 * Hook to retrieve daily burndown chart metrics.
 */
export function useSprintBurndown(id: string) {
  return useQuery({
    queryKey: ['sprint-burndown', id],
    queryFn: () => getSprintBurndown(id),
    enabled: !!id,
    staleTime: 60000,
    gcTime: 300000,
  });
}

/**
 * Hook to retrieve sprint performance and developer output analytics.
 */
export function useSprintAnalytics(id: string) {
  return useQuery({
    queryKey: ['sprint-analytics', id],
    queryFn: () => getSprintAnalytics(id),
    enabled: !!id,
    staleTime: 60000,
    gcTime: 300000,
  });
}

/**
 * Hook to plan a new agile sprint.
 */
export function useCreateSprint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSprint,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast.success(`Sprint "${data.name}" created and planned!`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to create sprint';
      toast.error(msg);
    },
  });
}

/**
 * Hook to update sprint attributes.
 */
export function useUpdateSprint(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => updateSprint(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      queryClient.invalidateQueries({ queryKey: ['sprint', id] });
      toast.success(`Sprint "${data.name}" updated successfully!`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to update sprint';
      toast.error(msg);
    },
  });
}

/**
 * Hook to remove a sprint.
 */
export function useDeleteSprint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSprint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast.success('Sprint removed successfully');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to delete sprint';
      toast.error(msg);
    },
  });
}

/**
 * Hook to start a planned sprint.
 */
export function useStartSprint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: startSprint,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      queryClient.invalidateQueries({ queryKey: ['sprint', data._id] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast.success(`Sprint "${data.name}" is now live!`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to start sprint';
      toast.error(msg);
    },
  });
}

/**
 * Hook to end an active sprint with retrospective feedback notes.
 */
export function useEndSprint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, retrospective }: { id: string; retrospective?: string }) =>
      endSprint(id, retrospective),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      queryClient.invalidateQueries({ queryKey: ['sprint', data._id] });
      queryClient.invalidateQueries({ queryKey: ['sprint-analytics', data._id] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast.success(`Sprint "${data.name}" completed successfully!`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to complete sprint';
      toast.error(msg);
    },
  });
}

/**
 * Hook to cancel a sprint.
 */
export function useCancelSprint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelSprint,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      queryClient.invalidateQueries({ queryKey: ['sprint', data._id] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast.success(`Sprint "${data.name}" was cancelled.`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to cancel sprint';
      toast.error(msg);
    },
  });
}

/**
 * Hook to add or remove tasks inside a sprint bin.
 */
export function useManageSprintTasks(sprintId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskIds, action }: { taskIds: string[]; action: 'add' | 'remove' }) =>
      manageSprintTasks(sprintId, taskIds, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprint', sprintId] });
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Sprint backlog items modified!');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to update sprint items';
      toast.error(msg);
    },
  });
}
