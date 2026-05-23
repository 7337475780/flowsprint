import { useMemo } from 'react';
import { Users, Mail, Shield, FolderKanban } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.js';
import EmptyState from '../components/common/EmptyState.js';
import Loader from '../components/common/Loader.js';
import { useProjects } from '../hooks/useProjects.js';
import type { User } from '../api/authApi.js';

interface AggregatedMember {
  user: User;
  projects: { id: string; name: string }[];
}

export default function TeamPage() {
  // 1. Load active projects to extract membership allocations
  const { data: projectsData, isLoading } = useProjects({ limit: 100 });

  const roster = useMemo(() => {
    if (!projectsData?.projects) return [];

    const memberMap: Record<string, AggregatedMember> = {};

    projectsData.projects.forEach((proj) => {
      // Owner
      if (proj.owner && typeof proj.owner === 'object') {
        const uid = proj.owner._id;
        if (!memberMap[uid]) {
          memberMap[uid] = {
            user: proj.owner,
            projects: [],
          };
        }
        // Link project ownership
        if (!memberMap[uid].projects.some((p) => p.id === proj._id)) {
          memberMap[uid].projects.push({ id: proj._id, name: proj.name });
        }
      }

      // Teammates
      if (proj.members && Array.isArray(proj.members)) {
        proj.members.forEach((m) => {
          if (m && typeof m === 'object') {
            const uid = m._id;
            if (!memberMap[uid]) {
              memberMap[uid] = {
                user: m,
                projects: [],
              };
            }
            if (!memberMap[uid].projects.some((p) => p.id === proj._id)) {
              memberMap[uid].projects.push({ id: proj._id, name: proj.name });
            }
          }
        });
      }
    });

    return Object.values(memberMap);
  }, [projectsData]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Directory"
        description="View workspace members, administrative roles, and active project team allocations."
      />

      {isLoading ? (
        <Loader />
      ) : roster.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No active roster yet"
          description="Members allocated as project owners or project teammates will appear here in the workspace directory."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {roster.map(({ user, projects }) => {
            const initials = user.name
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();

            return (
              <div
                key={user._id}
                className="group border rounded-xl bg-card p-6 flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transform transition-all duration-300"
              >
                <div className="space-y-4">
                  {/* Profil header */}
                  <div className="flex items-center gap-3.5">
                    <div className="h-11 w-11 rounded-full bg-primary/10 text-primary border flex items-center justify-center text-sm font-bold shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-heading font-extrabold text-base tracking-tight truncate leading-tight group-hover:text-primary transition-colors">
                        {user.name}
                      </h3>
                      <span className="inline-flex items-center gap-1 mt-1 text-3xs font-bold uppercase tracking-wider text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/20">
                        <Shield className="h-2.5 w-2.5" /> {user.role}
                      </span>
                    </div>
                  </div>

                  {/* Mail */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1.5 border-t">
                    <Mail className="h-4 w-4 shrink-0 text-primary/75" />
                    <span className="truncate">{user.email}</span>
                  </div>
                </div>

                {/* Allocated projects list */}
                <div className="border-t pt-4 mt-5 space-y-2">
                  <span className="text-3xs font-extrabold text-muted-foreground uppercase tracking-widest block">
                    ACTIVE PROJECT MEMBERSHIPS
                  </span>
                  {projects.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {projects.map((proj) => (
                        <span
                          key={proj.id}
                          className="inline-flex items-center gap-1 bg-secondary text-foreground text-3xs px-2.5 py-1 border rounded-md font-medium"
                        >
                          <FolderKanban className="h-2.5 w-2.5 text-primary/75" /> {proj.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-2xs text-muted-foreground italic block">
                      No project memberships allocated
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
