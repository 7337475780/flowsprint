import { Workspace } from './workspace.model.js';
import { User } from '../../models/User.js';
import { IWorkspace } from './workspace.types.js';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../../utils/errors.js';
import { Types } from 'mongoose';

/**
 * Assures that a user has at least one active Workspace.
 * Automatically creates a default workspace if none exists and updates user fields.
 */
export const ensureDefaultWorkspace = async (userId: string, userName: string): Promise<IWorkspace> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User profile not found');
  }

  // 1. Return current workspace if valid and user is still member/owner
  if (user.currentWorkspace) {
    const existing = await Workspace.findById(user.currentWorkspace);
    if (existing) {
      const isStillMember = existing.members.some(m => m.toString() === userId) || existing.owner.toString() === userId;
      if (isStillMember) {
        return existing;
      }
    }
  }

  // 2. Scan if user already belongs to any other workspaces in DB
  const matchingWorkspaces = await Workspace.find({
    $or: [{ owner: userId }, { members: userId }]
  });

  if (matchingWorkspaces.length > 0) {
    // Select first matched workspace and sync user record
    const selected = matchingWorkspaces[0];
    user.currentWorkspace = selected._id as any;
    if (!user.workspaces) user.workspaces = [];
    matchingWorkspaces.forEach(w => {
      if (!user.workspaces?.includes(w._id.toString())) {
        user.workspaces?.push(w._id.toString());
      }
    });
    await user.save();
    return selected;
  }

  // 3. Fallback: Create brand new default workspace for user
  const newWorkspace = await Workspace.create({
    name: `${userName}'s Workspace`,
    owner: new Types.ObjectId(userId),
    members: [new Types.ObjectId(userId)],
  });

  user.currentWorkspace = newWorkspace._id as any;
  user.workspaces = [newWorkspace._id.toString()];
  await user.save();

  return newWorkspace;
};

/**
 * Creates a new Workspace (Admin-only or Manager capability).
 */
export const createWorkspace = async (name: string, userId: string): Promise<IWorkspace> => {
  if (!name || name.trim().length < 3) {
    throw new BadRequestError('Workspace name must be at least 3 characters long');
  }

  const workspace = await Workspace.create({
    name: name.trim(),
    owner: new Types.ObjectId(userId),
    members: [new Types.ObjectId(userId)],
  });

  // Attach workspace directly to user's collection
  await User.findByIdAndUpdate(userId, {
    $push: { workspaces: workspace._id.toString() },
    $set: { currentWorkspace: workspace._id as any }
  });

  return workspace;
};

/**
 * Fetches all workspaces a user belongs to.
 */
export const getWorkspaces = async (userId: string): Promise<IWorkspace[]> => {
  return await Workspace.find({
    $or: [{ owner: userId }, { members: userId }]
  }).populate('owner', 'name email avatar');
};

/**
 * Fetch detail parameters for a single workspace.
 */
export const getWorkspaceById = async (id: string, userId: string): Promise<IWorkspace> => {
  const ws = await Workspace.findById(id)
    .populate('owner', 'name email avatar')
    .populate('members', 'name email avatar');

  if (!ws) {
    throw new NotFoundError('Workspace not found');
  }

  const isMember = ws.members.some(m => m._id.toString() === userId) || ws.owner._id.toString() === userId;
  if (!isMember) {
    throw new UnauthorizedError('Access denied. You do not belong to this workspace.');
  }

  return ws;
};

/**
 * Add a new user member to the active workspace (Admins/Managers only).
 */
export const addMemberToWorkspace = async (
  workspaceId: string,
  email: string,
  activeUserId: string
): Promise<IWorkspace> => {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundError('Workspace not found');
  }

  // Verify only Owner/Admin or Manager can add members
  const isOwner = workspace.owner.toString() === activeUserId;
  const activeUser = await User.findById(activeUserId);
  const isPrivileged = activeUser && (activeUser.role === 'admin' || activeUser.role === 'manager');

  if (!isOwner && !isPrivileged) {
    throw new UnauthorizedError('Access denied. Only workspace owners, managers or admins can add members.');
  }

  const targetUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (!targetUser) {
    throw new NotFoundError(`No user found with the email address "${email}"`);
  }

  const isAlreadyMember = workspace.members.some(m => m.toString() === targetUser._id.toString());
  if (isAlreadyMember) {
    throw new BadRequestError('User is already a member of this workspace');
  }

  workspace.members.push(targetUser._id);
  await workspace.save();

  // Update target user workspaces arrays
  await User.findByIdAndUpdate(targetUser._id, {
    $push: { workspaces: workspace._id.toString() },
    $set: { currentWorkspace: workspace._id as any }
  });

  return workspace;
};
