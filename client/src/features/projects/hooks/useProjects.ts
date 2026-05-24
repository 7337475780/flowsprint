import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats,
} from '../api/projectApi.js';

/**
 * Hook to retrieve filtered, searched, and paginated projects list.
 */
export function useProjectsQuery(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['projects-paginated', params],
    queryFn: () => getProjects(params),
    staleTime: 60000,
    gcTime: 300000,
  });
}

/**
 * Hook to retrieve single project details.
 */
export function useProjectDetailsQuery(id: string) {
  return useQuery({
    queryKey: ['project-details', id],
    queryFn: () => getProjectById(id),
    enabled: !!id,
    staleTime: 60000,
    gcTime: 300000,
  });
}

/**
 * Hook to retrieve aggregate project metrics overview.
 */
export function useProjectStatsQuery() {
  return useQuery({
    queryKey: ['projects-stats-overview'],
    queryFn: getProjectStats,
    staleTime: 60000,
    gcTime: 300000,
  });
}

/**
 * Hook to create a project with toast messages.
 */
export function useCreateProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProject,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['projects-stats-overview'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast.success(`Project "${data.name}" [${data.key}] created successfully!`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to create project';
      toast.error(msg);
    },
  });
}

/**
 * Hook to modify project variables.
 */
export function useUpdateProjectMutation(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => updateProject(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['projects-stats-overview'] });
      queryClient.invalidateQueries({ queryKey: ['project-details', id] });
      toast.success(`Project "${data.name}" [${data.key}] updated successfully!`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to update project';
      toast.error(msg);
    },
  });
}

/**
 * Hook to remove a project.
 */
export function useDeleteProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['projects-stats-overview'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast.success('Project deleted successfully');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to delete project';
      toast.error(msg);
    },
  });
}
