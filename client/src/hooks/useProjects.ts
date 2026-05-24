import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  manageProjectMembers,
} from '../api/projectsApi.js';

/**
 * Hook to retrieve filtered and paginated projects.
 */
export function useProjects(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => getProjects(params),
    staleTime: 60000,
    gcTime: 300000,
  });
}

/**
 * Hook to retrieve details for a single project.
 */
export function useProjectDetails(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => getProjectById(id),
    enabled: !!id,
    staleTime: 60000,
    gcTime: 300000,
  });
}

/**
 * Hook to create a project with toast messages and cache flushing.
 */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProject,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast.success(`Project "${data.name}" created successfully!`);
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
export function useUpdateProject(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => updateProject(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      toast.success(`Project "${data.name}" updated successfully!`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to update project';
      toast.error(msg);
    },
  });
}

/**
 * Hook to remove a project workspace.
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast.success('Project deleted successfully');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to delete project';
      toast.error(msg);
    },
  });
}

/**
 * Hook to manage project team membership.
 */
export function useManageProjectMembers(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, action }: { memberId: string; action: 'add' | 'remove' }) =>
      manageProjectMembers(projectId, memberId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project team updated successfully!');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to modify team assignments';
      toast.error(msg);
    },
  });
}
