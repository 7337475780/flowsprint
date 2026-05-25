import { useEffect, useState } from 'react';
import { useAnalyticsStore } from '../store/analyticsStore.js';
import { cn } from '../../../lib/utils.js';
import api from '../../../api/axios.js';
import { TrendingUp, Layers, Folder, Users, Calendar } from 'lucide-react';
import Loader from '../../../components/common/Loader.js';

interface DropdownItem {
  _id: string;
  name: string;
}

export default function AnalyticsFilters() {
  const {
    activeTab,
    setActiveTab,
    selectedProjectId,
    setSelectedProjectId,
    selectedSprintId,
    setSelectedSprintId,
    isLoading,
  } = useAnalyticsStore();

  const [projects, setProjects] = useState<DropdownItem[]>([]);
  const [sprints, setSprints] = useState<DropdownItem[]>([]);

  // Self-contained fetch to guarantee absolute decoupling from other paginated views
  useEffect(() => {
    const fetchLists = async () => {
      try {
        const [projRes, sprintRes] = await Promise.all([
          api.get('/projects?limit=100'),
          api.get('/sprints?limit=100'),
        ]);

        if (projRes.data?.success) {
          // Standardise fallback for varying pagination schemas
          const list = projRes.data.data?.data || projRes.data.data || [];
          setProjects(list);
          if (list.length > 0 && !selectedProjectId) {
            setSelectedProjectId(list[0]._id);
          }
        }

        if (sprintRes.data?.success) {
          const list = sprintRes.data.data?.sprints || sprintRes.data.data?.data || sprintRes.data.data || [];
          setSprints(list);
          if (list.length > 0 && !selectedSprintId) {
            setSelectedSprintId(list[0]._id);
          }
        }
      } catch (err) {
        console.error('❌ Error preloading filters lists inside analytics:', err);
      }
    };

    fetchLists();
  }, []);

  const tabs = [
    { id: 'overview' as const, label: 'Workspace KPIs', icon: TrendingUp },
    { id: 'projects' as const, label: 'Projects Metrics', icon: Folder },
    { id: 'sprints' as const, label: 'Sprints Burndown', icon: Layers },
    { id: 'team' as const, label: 'Team Leaderboard', icon: Users },
    { id: 'trends' as const, label: 'Velocity Trends', icon: Calendar },
  ];

  return (
    <div className="space-y-4 border-b pb-4 mt-2">
      {/* Top row: Tab Switchers */}
      <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-secondary/40 border max-w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer',
                isActive
                  ? 'bg-card text-foreground shadow-2xs border border-border'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40 border border-transparent'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Bottom row: Dynamic Dropdown filters depending on active tab scope */}
      {(activeTab === 'projects' || activeTab === 'sprints') && (
        <div className="flex flex-wrap items-center gap-4 animate-in fade-in slide-in-from-top-1 duration-150">
          {activeTab === 'projects' && (
            <div className="flex items-center gap-2">
              <label className="text-3xs font-black uppercase text-muted-foreground tracking-widest uppercase">
                Select Project Scope:
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  disabled={isLoading}
                  className={cn(
                    'text-xs font-semibold rounded-lg border bg-card outline-none px-3 py-1.5 cursor-pointer min-w-[160px]',
                    'focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all',
                    isLoading && 'opacity-60 cursor-not-allowed'
                  )}
                >
                  {projects.length === 0 ? (
                    <option value="">No projects found</option>
                  ) : (
                    projects.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name}
                      </option>
                    ))
                  )}
                </select>
                {isLoading && <Loader size="sm" className="shrink-0" />}
              </div>
            </div>
          )}

          {activeTab === 'sprints' && (
            <div className="flex items-center gap-2">
              <label className="text-3xs font-black uppercase text-muted-foreground tracking-widest uppercase">
                Select Sprint Scope:
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={selectedSprintId}
                  onChange={(e) => setSelectedSprintId(e.target.value)}
                  disabled={isLoading}
                  className={cn(
                    'text-xs font-semibold rounded-lg border bg-card outline-none px-3 py-1.5 cursor-pointer min-w-[160px]',
                    'focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all',
                    isLoading && 'opacity-60 cursor-not-allowed'
                  )}
                >
                  {sprints.length === 0 ? (
                    <option value="">No sprints planned</option>
                  ) : (
                    sprints.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))
                  )}
                </select>
                {isLoading && <Loader size="sm" className="shrink-0" />}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
