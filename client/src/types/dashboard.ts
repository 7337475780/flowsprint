export interface DashboardStats {
  totalProjects: number;
  activeTasks: number;
  completedSprints: number;
  teamMembers: number;
  velocity: number;
  completionRate: number;
}

export interface ActivityItem {
  id: string | number;
  type: 'complete' | 'create' | 'update' | 'assign' | 'alert' | 'sprint_start' | 'deadline_change';
  actor: string;
  action: string;
  target: string;
  time: string;
}

export interface SprintMetric {
  name: string;
  goal?: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  progress: number;
  plannedPoints: number;
  completedPoints: number;
  riskLevel: 'low' | 'medium' | 'high';
  onTrackCount: number;
  delayedCount: number;
  blockedCount: number;
}

export interface TeamLoadData {
  id: string;
  name: string;
  avatar?: string;
  workload: number; // e.g. 75 for 75%
  activeTasks: number;
}
