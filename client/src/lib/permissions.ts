import { User } from '../api/authApi.js';

export type Role = 'admin' | 'manager' | 'member';

export type Permission =
  | 'create:workspace'
  | 'manage:workspace'
  | 'create:project'
  | 'delete:project'
  | 'create:task'
  | 'delete:task'
  | 'manage:sprint'
  | 'upload:files';

const permissionMatrix: Record<Role, Permission[]> = {
  admin: [
    'create:workspace',
    'manage:workspace',
    'create:project',
    'delete:project',
    'create:task',
    'delete:task',
    'manage:sprint',
    'upload:files',
  ],
  manager: [
    'manage:workspace',
    'create:project',
    'delete:project',
    'create:task',
    'delete:task',
    'manage:sprint',
    'upload:files',
  ],
  member: [
    'create:task',
    'upload:files',
  ],
};

/**
 * Checks if a user has a specific permission.
 */
export const hasPermission = (user: User | null | undefined, permission: Permission): boolean => {
  if (!user) return false;
  const role = user.role || 'member';
  return permissionMatrix[role]?.includes(permission) || false;
};

/**
 * Checks if a user has one of the allowed roles.
 */
export const hasRole = (user: User | null | undefined, allowedRoles: Role[]): boolean => {
  if (!user) return false;
  return allowedRoles.includes(user.role);
};

/**
 * Custom ownership checker: Can user delete a specific project?
 * Admin can delete any; Manager can delete their own; Members cannot delete projects.
 */
export const canDeleteProject = (user: User | null | undefined, projectOwnerId: string): boolean => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'manager' && user._id === projectOwnerId) return true;
  return false;
};

/**
 * Custom ownership checker: Can user delete a specific task?
 * Admin can delete any; Manager can delete if project owner or task reporter; Members cannot delete tasks.
 */
export const canDeleteTask = (
  user: User | null | undefined,
  projectOwnerId: string,
  taskReporterId: string
): boolean => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'manager') {
    const userIdStr = user._id.toString();
    return userIdStr === projectOwnerId || userIdStr === taskReporterId;
  }
  return false;
};
