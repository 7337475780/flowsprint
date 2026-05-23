import { Project } from '../models/Project.js';
import { User } from '../models/User.js';
import { IProject } from '../types/project.js';
import { IUser } from '../types/user.js';
import { 
  BadRequestError, 
  NotFoundError, 
  UnauthorizedError 
} from '../utils/errors.js';

/**
 * Creates a new project in the workspace database.
 */
export const createProject = async (
  projectData: Partial<IProject>,
  ownerId: string
): Promise<IProject> => {
  const project = new Project({
    ...projectData,
    owner: ownerId,
  });

  return await project.save();
};

/**
 * Retrieves a list of projects filtering by roles, scopes, search keys, and options.
 */
export const getProjects = async (
  query: any,
  user: IUser
): Promise<{ projects: IProject[]; total: number; page: number; pages: number }> => {
  const page = parseInt(query.page as string, 10) || 1;
  const limit = parseInt(query.limit as string, 10) || 10;
  const skip = (page - 1) * limit;

  const dbQuery: any = {};

  // 1. Role-based Project Security:
  // Members can ONLY query projects they own or are assigned to as teammates
  if (user.role === 'member') {
    dbQuery.$or = [
      { owner: user._id },
      { members: user._id },
    ];
  }

  // 2. Mount optional search and filter keys
  if (query.search) {
    dbQuery.name = { $regex: query.search, $options: 'i' };
  }
  if (query.status) {
    dbQuery.status = query.status;
  }
  if (query.priority) {
    dbQuery.priority = query.priority;
  }
  if (query.owner) {
    dbQuery.owner = query.owner;
  }
  if (query.member) {
    dbQuery.members = query.member;
  }

  // Safe default: hide archived projects unless explicitly asked
  if (query.archived !== undefined) {
    dbQuery.isArchived = query.archived === 'true';
  } else {
    dbQuery.isArchived = false;
  }

  // 3. Configure Sort Criteria
  let sortQuery: any = { createdAt: -1 }; // Newest by default
  if (query.sort) {
    if (query.sort === 'oldest') {
      sortQuery = { createdAt: 1 };
    } else if (query.sort === 'dueDate') {
      sortQuery = { dueDate: 1 };
    } else if (query.sort === 'name') {
      sortQuery = { name: 1 };
    }
  }

  // 4. Parallel Query execution for high velocity performance
  const [projects, total] = await Promise.all([
    Project.find(dbQuery)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar')
      .sort(sortQuery)
      .skip(skip)
      .limit(limit),
    Project.countDocuments(dbQuery),
  ]);

  return {
    projects,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
};

/**
 * Fetches a single project populated with owner/members and enforces role gates.
 */
export const getProjectById = async (id: string, user: IUser): Promise<IProject> => {
  const project = await Project.findById(id)
    .populate('owner', 'name email avatar')
    .populate('members', 'name email avatar');

  if (!project) {
    throw new NotFoundError('Project was not found');
  }

  // Security gate: Members can only inspect if owner or assigned to team list
  const ownerId = (project.owner as any)._id?.toString() || project.owner.toString();
  const memberIds = project.members.map((m: any) => m._id?.toString() || m.toString());

  if (
    user.role === 'member' &&
    ownerId !== user._id.toString() &&
    !memberIds.includes(user._id.toString())
  ) {
    throw new UnauthorizedError('Access denied. You are not assigned to this project.');
  }

  return project;
};

/**
 * Updates project details based on user's authorization role.
 */
export const updateProject = async (
  id: string,
  updateData: Partial<IProject>,
  user: IUser
): Promise<IProject> => {
  const project = await Project.findById(id);

  if (!project) {
    throw new NotFoundError('Project was not found');
  }

  // Security check: Admins/Managers can update all; members can only update if they own the project
  const isOwner = project.owner.toString() === user._id.toString();
  const isAuthorized = user.role === 'admin' || user.role === 'manager' || isOwner;

  if (!isAuthorized) {
    throw new UnauthorizedError('Access denied. You do not have permission to modify this project.');
  }

  // Limit modifiable variables to protect structural fields (e.g. owner stays immutable)
  const editableFields: Array<keyof IProject> = [
    'name',
    'description',
    'status',
    'priority',
    'dueDate',
    'progress',
    'tags',
    'isArchived',
  ];

  editableFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      (project as any)[field] = updateData[field];
    }
  });

  return await project.save();
};

/**
 * Handles project deletions securely.
 */
export const deleteProject = async (id: string, user: IUser): Promise<void> => {
  const project = await Project.findById(id);

  if (!project) {
    throw new NotFoundError('Project was not found');
  }

  // Security check: Only an Admin or the specific Owner has deletion privileges
  const isOwner = project.owner.toString() === user._id.toString();
  if (user.role !== 'admin' && !isOwner) {
    throw new UnauthorizedError('Access denied. Only the project owner or admins can delete this project.');
  }

  await Project.findByIdAndDelete(id);
};

/**
 * Handles adding or removing a user from the project's member list team assignments.
 */
export const manageMembers = async (
  projectId: string,
  memberId: string,
  action: 'add' | 'remove',
  user: IUser
): Promise<IProject> => {
  const project = await Project.findById(projectId);

  if (!project) {
    throw new NotFoundError('Project was not found');
  }

  // Security check: Only owner, manager, or admin can assign members
  const isOwner = project.owner.toString() === user._id.toString();
  if (user.role !== 'admin' && user.role !== 'manager' && !isOwner) {
    throw new UnauthorizedError('Access denied. You do not have permission to modify team assignments.');
  }

  // Verify that the assigned member exists in DB
  const memberExists = await User.findById(memberId);
  if (!memberExists) {
    throw new NotFoundError('User to assign was not found');
  }

  const memberObjectId: any = memberExists._id;

  if (action === 'add') {
    // Block duplicate additions to project list
    if (project.members.some((m) => m.toString() === memberObjectId.toString())) {
      throw new BadRequestError('User is already assigned to this project team');
    }
    project.members.push(memberObjectId);
  } else {
    // Remove user from array
    project.members = project.members.filter(
      (m) => m.toString() !== memberObjectId.toString()
    ) as any;
  }

  const updated = await project.save();
  return (await updated.populate('owner', 'name email avatar')).populate('members', 'name email avatar');
};
