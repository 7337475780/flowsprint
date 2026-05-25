import { useEffect, useState } from 'react';
import { useAnalyticsStore } from '../store/analyticsStore.js';
import { cn } from '../../../lib/utils.js';
import api from '../../../api/axios.js';
import { TrendingUp, Layers, Folder, Users, Calendar, ChevronDown } from 'lucide-react';
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
  const [filtersLoading, setFiltersLoading] = useState(false);

  // Self-contained fetch to guarantee absolute decoupling from other paginated views
  useEffect(() => {
    const fetchLists = async () => {
      setFiltersLoading(true);
      try {
        const [projRes, sprintRes] = await Promise.all([
          api.get('/projects?limit=100'),
          api.get('/sprints?limit=100'),
        ]);

        if (projRes.data?.success) {
          // Standardise fallback for varying pagination schemas
          const list =
            projRes.data.data?.data ||
            projRes.data.data ||
            [];
          setProjects(Array.isArray(list) ? list : []);
          if (list.length > 0 && !selectedProjectId) {
            setSelectedProjectId(list[0]._id);
          }
        }

        if (sprintRes.data?.success) {
          const list =
            sprintRes.data.data?.sprints ||
            sprintRes.data.data?.data ||
            sprintRes.data.data ||
            [];
          setSprints(Array.isArray(list) ? list : []);
          if (list.length > 0 && !selectedSprintId) {
            setSelectedSprintId(list[0]._id);
          }
        }
      } catch (err) {
        console.error('❌ Error preloading filters lists inside analytics:', err);
      } finally {
        setFiltersLoading(false);
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
              <label className="text-3xs font-black uppercase text-muted-foreground tracking-widest">
                Select Project Scope:
              </label>
              <div className="relative flex items-center gap-2">
                {filtersLoading ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border bg-card min-w-[160px] text-muted-foreground">
                    <Loader size="sm" />
                    Loading projects…
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      disabled={isLoading || projects.length === 0}
                      className={cn(
                        'text-xs font-semibold rounded-lg border bg-card outline-none pl-3 pr-8 py-1.5 cursor-pointer min-w-[180px] appearance-none',
                        'focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all',
                        (isLoading || projects.length === 0) && 'opacity-60 cursor-not-allowed'
                      )}
                    >
                      {projects.length === 0 ? (
                        <option value="">No projects available</option>
                      ) : (
                        projects.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name}
                          </option>
                        ))
                      )}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  </div>
                )}
                {/* Analytics data loading spinner (separate from filter list loading) */}
                {isLoading && !filtersLoading && <Loader size="sm" className="shrink-0" />}
              </div>
            </div>
          )}

          {activeTab === 'sprints' && (
            <div className="flex items-center gap-2">
              <label className="text-3xs font-black uppercase text-muted-foreground tracking-widest">
                Select Sprint Scope:
              </label>
              <div className="relative flex items-center gap-2">
                {filtersLoading ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border bg-card min-w-[160px] text-muted-foreground">
                    <Loader size="sm" />
                    Loading sprints…
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={selectedSprintId}
                      onChange={(e) => setSelectedSprintId(e.target.value)}
                      disabled={isLoading || sprints.length === 0}
                      className={cn(
                        'text-xs font-semibold rounded-lg border bg-card outline-none pl-3 pr-8 py-1.5 cursor-pointer min-w-[180px] appearance-none',
                        'focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all',
                        (isLoading || sprints.length === 0) && 'opacity-60 cursor-not-allowed'
                      )}
                    >
                      {sprints.length === 0 ? (
                        <option value="">No sprints available</option>
                      ) : (
                        sprints.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.name}
                          </option>
                        ))
                      )}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  </div>
                )}
                {isLoading && !filtersLoading && <Loader size="sm" className="shrink-0" />}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
