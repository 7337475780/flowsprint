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
} from '../api/sprintApi.js';

/**
 * Hook to retrieve filtered, searched, and paginated sprints.
 */
export function useSprintsQuery(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['sprints', params],
    queryFn: () => getSprints(params),
  });
}

/**
 * Hook to retrieve detailed sprint specs.
 */
export function useSprintDetailsQuery(id: string) {
  return useQuery({
    queryKey: ['sprint-details', id],
    queryFn: () => getSprintById(id),
    enabled: !!id,
  });
}

/**
 * Hook to retrieve daily burndown chart data.
 */
export function useSprintBurndownQuery(id: string) {
  return useQuery({
    queryKey: ['sprint-burndown', id],
    queryFn: () => getSprintBurndown(id),
    enabled: !!id,
  });
}

/**
 * Hook to retrieve sprint performance analytics report.
 */
export function useSprintAnalyticsQuery(id: string) {
  return useQuery({
    queryKey: ['sprint-analytics', id],
    queryFn: () => getSprintAnalytics(id),
    enabled: !!id,
  });
}

/**
 * Hook to plan a new agile sprint.
 */
export function useCreateSprintMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSprint,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast.success(`Sprint "${data.name}" planned successfully!`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to plan sprint';
      toast.error(msg);
    },
  });
}

/**
 * Hook to update sprint attributes.
 */
export function useUpdateSprintMutation(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => updateSprint(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      queryClient.invalidateQueries({ queryKey: ['sprint-details', id] });
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
export function useDeleteSprintMutation() {
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
export function useStartSprintMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: startSprint,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      queryClient.invalidateQueries({ queryKey: ['sprint-details', data._id] });
      queryClient.invalidateQueries({ queryKey: ['tasks-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast.success(`Sprint "${data.name}" is now active!`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to start sprint';
      toast.error(msg);
    },
  });
}

/**
 * Hook to close an active sprint (runs Velocity Engine).
 */
export function useEndSprintMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, retrospective }: { id: string; retrospective?: string }) =>
      endSprint(id, retrospective),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      queryClient.invalidateQueries({ queryKey: ['sprint-details', data._id] });
      queryClient.invalidateQueries({ queryKey: ['sprint-analytics', data._id] });
      queryClient.invalidateQueries({ queryKey: ['tasks-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast.success(`Sprint "${data.name}" completed! Velocity ratio computed!`);
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
export function useCancelSprintMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelSprint,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      queryClient.invalidateQueries({ queryKey: ['sprint-details', data._id] });
      queryClient.invalidateQueries({ queryKey: ['tasks-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast.success(`Sprint "${data.name}" has been cancelled.`);
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
export function useManageSprintTasksMutation(sprintId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskIds, action }: { taskIds: string[]; action: 'add' | 'remove' }) =>
      manageSprintTasks(sprintId, taskIds, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprint-details', sprintId] });
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-paginated'] });
      toast.success('Sprint backlog items modified!');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to update sprint items';
      toast.error(msg);
    },
  });
}
