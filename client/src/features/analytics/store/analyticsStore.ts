import { create } from 'zustand';
import api from '../../../api/axios.js';
import {
  DashboardOverview,
  ProjectAnalytics,
  SprintAnalytics,
  TeamAnalytics,
  TrendAnalytics,
} from '../../../../../server/src/modules/analytics/analytics.types.js';

interface AnalyticsState {
  overview: DashboardOverview | null;
  project: ProjectAnalytics | null;
  sprint: SprintAnalytics | null;
  team: TeamAnalytics | null;
  trends: TrendAnalytics | null;
  isLoading: boolean;
  activeTab: 'overview' | 'projects' | 'sprints' | 'team' | 'trends';
  selectedProjectId: string;
  selectedSprintId: string;

  // Actions
  setActiveTab: (tab: 'overview' | 'projects' | 'sprints' | 'team' | 'trends') => void;
  setSelectedProjectId: (id: string) => void;
  setSelectedSprintId: (id: string) => void;
  fetchOverview: () => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  fetchSprint: (id: string) => Promise<void>;
  fetchTeam: () => Promise<void>;
  fetchTrends: () => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  overview: null,
  project: null,
  sprint: null,
  team: null,
  trends: null,
  isLoading: false,
  activeTab: 'overview',
  selectedProjectId: '',
  selectedSprintId: '',

  setActiveTab: (activeTab) => set({ activeTab }),
  setSelectedProjectId: (selectedProjectId) => set({ selectedProjectId }),
  setSelectedSprintId: (selectedSprintId) => set({ selectedSprintId }),

  fetchOverview: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/analytics/overview');
      if (response.data?.success) {
        set({ overview: response.data.data });
      }
    } catch (error) {
      console.error('❌ Error fetching analytics overview:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProject: async (projectId) => {
    if (!projectId) return;
    set({ isLoading: true });
    try {
      const response = await api.get(`/analytics/projects/${projectId}`);
      if (response.data?.success) {
        set({ project: response.data.data });
      }
    } catch (error) {
      console.error(`❌ Error fetching project analytics (${projectId}):`, error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchSprint: async (sprintId) => {
    if (!sprintId) return;
    set({ isLoading: true });
    try {
      const response = await api.get(`/analytics/sprints/${sprintId}`);
      if (response.data?.success) {
        set({ sprint: response.data.data });
      }
    } catch (error) {
      console.error(`❌ Error fetching sprint analytics (${sprintId}):`, error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTeam: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/analytics/team');
      if (response.data?.success) {
        set({ team: response.data.data });
      }
    } catch (error) {
      console.error('❌ Error fetching team analytics:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTrends: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/analytics/trends');
      if (response.data?.success) {
        set({ trends: response.data.data });
      }
    } catch (error) {
      console.error('❌ Error fetching trends analytics:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
