const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/flowsprint';

// 1. Schemas definition
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: { type: String, select: false },
  role: { type: String, default: 'member' },
  avatar: String,
  isActive: { type: Boolean, default: true },
  bio: String
}, { timestamps: true });

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  key: { type: String, required: true, uppercase: true },
  slug: { type: String },
  description: { type: String },
  status: { type: String, enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled'], default: 'planning' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  startDate: Date,
  dueDate: Date,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  tags: [String],
  progress: { type: Number, default: 0 },
  isArchived: { type: Boolean, default: false }
}, { timestamps: true });

const sprintSchema = new mongoose.Schema({
  name: { type: String, required: true },
  goal: { type: String },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  startDate: Date,
  endDate: Date,
  status: { type: String, enum: ['planned', 'active', 'completed', 'cancelled'], default: 'planned' },
  plannedPoints: { type: Number, default: 0 },
  completedPoints: { type: Number, default: 0 },
  velocity: { type: Number, default: 0 },
  progress: { type: Number, default: 0 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  retrospective: { type: String },
  isArchived: { type: Boolean, default: false }
}, { timestamps: true });

const commentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true }
}, { timestamps: true });

const activitySchema = new mongoose.Schema({
  action: { type: String, enum: ['created', 'assigned', 'moved', 'commented', 'updated', 'archived'], required: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  details: { type: String }
}, { timestamps: true });

const subtaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String },
  description: { type: String },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  sprintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sprint' },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['backlog', 'todo', 'in-progress', 'review', 'done'], default: 'backlog' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  labels: [String],
  dueDate: Date,
  estimatedHours: Number,
  actualHours: Number,
  spentHours: { type: Number, default: 0 },
  storyPoints: { type: Number, default: 0 },
  order: { type: Number, default: 0 },
  position: { type: Number, default: 0 },
  attachments: [String],
  isArchived: { type: Boolean, default: false },
  subtasks: [subtaskSchema],
  comments: [commentSchema],
  activities: [activitySchema]
}, { timestamps: true });

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  entityType: { type: String, enum: ['task', 'sprint', 'project', 'comment'] },
  entityId: { type: mongoose.Schema.Types.ObjectId },
  isRead: { type: Boolean, default: false },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical', 'urgent'], default: 'medium' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);
const Sprint = mongoose.models.Sprint || mongoose.model('Sprint', sprintSchema);
const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);
const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

async function seed() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log(`🔌 MongoDB Connected.`);

    // 1. Create or Find Mock Teammates
    const mockTeammates = [
      {
        name: 'Sarah Connor',
        email: 'sarah.connor@flowsprint.io',
        password: 'Password123!',
        role: 'member',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        bio: 'Senior Technical Product Owner. Specializing in high-velocity agile sprints and scrum scaling.',
        isActive: true
      },
      {
        name: 'Marcus Wright',
        email: 'marcus.wright@flowsprint.io',
        password: 'Password123!',
        role: 'member',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        bio: 'Lead Full-Stack Developer. Focused on React Kanban boards and robust Node.js backend workflows.',
        isActive: true
      },
      {
        name: 'Elena Rostova',
        email: 'elena.rostova@flowsprint.io',
        password: 'Password123!',
        role: 'manager',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        bio: 'Agile Coach & Project Workspace Manager. Helping teams accelerate sprint velocities.',
        isActive: true
      }
    ];

    const teamMembers = [];
    for (const item of mockTeammates) {
      let u = await User.findOne({ email: item.email });
      if (!u) {
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(item.password, salt);
        u = await User.create({ ...item, password: hashed });
        console.log(`Created team member: ${u.name}`);
      } else {
        console.log(`Team member already exists: ${u.name}`);
      }
      teamMembers.push(u);
    }

    const [sarah, marcus, elena] = teamMembers;

    // Find all users in the DB
    const allUsers = await User.find({});
    console.log(`Found ${allUsers.length} total users in database.`);

    // If there are no other users, create a default user
    let defaultUser;
    const nonMockUsers = allUsers.filter(u => !mockTeammates.some(t => t.email === u.email));
    if (nonMockUsers.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash('Password123!', salt);
      defaultUser = await User.create({
        name: 'Alex Mercer',
        email: 'alex.mercer@flowsprint.io',
        password: hashed,
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        bio: 'System Admin and workspace architect.',
        isActive: true
      });
      console.log(`Created default user: ${defaultUser.name}`);
      nonMockUsers.push(defaultUser);
    }

    // We will clear existing Projects, Sprints, Tasks, and Notifications to make data perfectly consistent
    console.log('Clearing existing projects, sprints, tasks, and notifications...');
    await Project.deleteMany({});
    await Sprint.deleteMany({});
    await Task.deleteMany({});
    await Notification.deleteMany({});
    console.log('Cleared existing data.');

    // 2. Seed projects for EVERY non-mock user (so whichever user they login as, they are the owner and see great data!)
    for (const activeUser of nonMockUsers) {
      console.log(`Seeding projects for user: ${activeUser.name} (${activeUser.email})...`);

      const membersList = [sarah._id, marcus._id, elena._id, activeUser._id];

      // Project 1: FlowSprint Core Engine (Active)
      const project1 = await Project.create({
        name: 'FlowSprint Core Platform',
        key: 'FS',
        slug: `fs-core-${activeUser._id.toString().substring(18)}`,
        description: 'Primary workspace repository for FlowSprint planning, sprint telemetries, and Kanban engines.',
        status: 'active',
        priority: 'high',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        owner: activeUser._id,
        members: membersList,
        tags: ['React', 'Node.js', 'WebSockets', 'Agile'],
        progress: 68
      });
      console.log(`Created project: ${project1.name}`);

      // Project 2: Alpha Mobile App (Planning)
      const project2 = await Project.create({
        name: 'Alpha Mobile App client',
        key: 'AMA',
        slug: `ama-client-${activeUser._id.toString().substring(18)}`,
        description: 'React Native mobile application client with real-time push alerts and board views.',
        status: 'planning',
        priority: 'medium',
        startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        owner: activeUser._id,
        members: membersList,
        tags: ['React Native', 'Mobile', 'iOS', 'Android'],
        progress: 0
      });
      console.log(`Created project: ${project2.name}`);

      // 3. Seed sprints for Project 1
      // Sprint 1 (Completed)
      const sprint1 = await Sprint.create({
        name: 'Sprint 1 - System Foundations',
        goal: 'Deploy initial databases, Auth servers, and baseline workspace routers.',
        project: project1._id,
        projectId: project1._id,
        startDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
        endDate: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000), // 11 days ago
        status: 'completed',
        plannedPoints: 30,
        completedPoints: 26,
        velocity: 0.8667,
        progress: 100,
        owner: activeUser._id,
        members: membersList,
        retrospective: 'Excellent baseline speed. Redundant routing is resolved; authorization pipelines are extremely robust.'
      });

      // Sprint 2 (Active)
      const sprint2 = await Sprint.create({
        name: 'Sprint 2 - Realtime Boards',
        goal: 'Integrate dynamic drag-and-drop dashboards and socket connection feeds.',
        project: project1._id,
        projectId: project1._id,
        startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
        status: 'active',
        plannedPoints: 38,
        completedPoints: 0,
        velocity: 0,
        progress: 45,
        owner: activeUser._id,
        members: membersList
      });

      // Sprint 3 (Planned)
      const sprint3 = await Sprint.create({
        name: 'Sprint 3 - Performance Tuning',
        goal: 'Optimize telemetry aggregation caches and resolve mobile scaling bottlenecks.',
        project: project1._id,
        projectId: project1._id,
        startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        endDate: new Date(Date.now() + 19 * 24 * 60 * 60 * 1000), // 19 days from now
        status: 'planned',
        plannedPoints: 25,
        completedPoints: 0,
        velocity: 0,
        progress: 0,
        owner: activeUser._id,
        members: membersList
      });

      // 4. Seed tasks for Project 1 / Sprints
      const tasksToCreate = [
        // Sprint 1 (Completed Tasks)
        {
          title: 'FS-101: Express Setup & TypeScript compilation',
          description: 'Setup initial node packages, tsconfigs, and dev scripts for server hot-reload.',
          status: 'done',
          priority: 'high',
          storyPoints: 5,
          assignee: marcus._id,
          reporter: activeUser._id,
          sprintId: sprint1._id,
          dueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
        },
        {
          title: 'FS-102: Mongoose database schema definitions',
          description: 'Model users, projects, tasks, sprints and configure compound index fields.',
          status: 'done',
          priority: 'critical',
          storyPoints: 8,
          assignee: elena._id,
          reporter: activeUser._id,
          sprintId: sprint1._id,
          dueDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000)
        },
        {
          title: 'FS-103: Wireframe Authentication layout shells',
          description: 'Draw wireframes for registration/login and baseline login session forms.',
          status: 'done',
          priority: 'medium',
          storyPoints: 3,
          assignee: sarah._id,
          reporter: activeUser._id,
          sprintId: sprint1._id,
          dueDate: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000)
        },
        {
          title: 'FS-104: Design landing dashboard layout mockups',
          description: 'Establish standard sidebar navigations, headers, and grid widgets styles.',
          status: 'done',
          priority: 'high',
          storyPoints: 5,
          assignee: activeUser._id,
          reporter: marcus._id,
          sprintId: sprint1._id,
          dueDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
        },
        {
          title: 'FS-105: Core JWT Session verification logic',
          description: 'Write auth middleware, cookie parser settings, and session token generation.',
          status: 'done',
          priority: 'critical',
          storyPoints: 5,
          assignee: marcus._id,
          reporter: activeUser._id,
          sprintId: sprint1._id,
          dueDate: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000)
        },

        // Sprint 2 (Active Sprint Tasks)
        {
          title: 'FS-106: Setup socket.io communication pipelines',
          description: 'Connect client connection listeners and configure private channels for team updates.',
          status: 'in-progress',
          priority: 'high',
          storyPoints: 8,
          assignee: marcus._id,
          reporter: activeUser._id,
          sprintId: sprint2._id,
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
        },
        {
          title: 'FS-107: Implement Drag & Drop Kanban board grids',
          description: 'Introduce beautiful HTML5 drag handles and batch rank reorders algorithms.',
          status: 'in-progress',
          priority: 'critical',
          storyPoints: 8,
          assignee: sarah._id,
          reporter: activeUser._id,
          sprintId: sprint2._id,
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        },
        {
          title: 'FS-108: Fix Tickets Ring Mobile layout overflows',
          description: 'Introduce fluid aspect ratios and change fixed height containers to auto.',
          status: 'done',
          priority: 'high',
          storyPoints: 3,
          assignee: activeUser._id,
          reporter: sarah._id,
          sprintId: sprint2._id,
          dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        },
        {
          title: 'FS-109: Dynamic Recent Activity stream widgets',
          description: 'Connect active telemetry grids directly to database notification logs.',
          status: 'done',
          priority: 'medium',
          storyPoints: 5,
          assignee: activeUser._id,
          reporter: marcus._id,
          sprintId: sprint2._id,
          dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          title: 'FS-110: Compact task discussion comments thread',
          description: 'Render inline discussion streams, author avatars, and post text fields.',
          status: 'review',
          priority: 'medium',
          storyPoints: 5,
          assignee: elena._id,
          reporter: activeUser._id,
          sprintId: sprint2._id,
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        },
        {
          title: 'FS-111: Setup centralized error handling hooks',
          description: 'Write robust express catches for database failures and schema validation.',
          status: 'todo',
          priority: 'low',
          storyPoints: 3,
          assignee: marcus._id,
          reporter: activeUser._id,
          sprintId: sprint2._id,
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        },
        {
          title: 'FS-112: Write dynamic telemetry database aggregation',
          description: 'Formulate aggregate groupings to calculate workload densities and completion indices.',
          status: 'todo',
          priority: 'high',
          storyPoints: 5,
          assignee: elena._id,
          reporter: activeUser._id,
          sprintId: sprint2._id,
          dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
        },

        // Backlog Tasks (No Sprint assignment)
        {
          title: 'FS-113: Implement full-text project search index',
          description: 'Register text index fields on databases and hook search query strings parameters.',
          status: 'backlog',
          priority: 'low',
          storyPoints: 8,
          assignee: sarah._id,
          reporter: activeUser._id,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        {
          title: 'FS-114: Deploy production assets bundles to Vercel',
          description: 'Setup continuous integration workflows and specify custom caching parameters.',
          status: 'backlog',
          priority: 'medium',
          storyPoints: 5,
          assignee: elena._id,
          reporter: activeUser._id,
          dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
        }
      ];

      const createdTasks = [];
      const sprint1TaskIds = [];
      const sprint2TaskIds = [];

      for (let i = 0; i < tasksToCreate.length; i++) {
        const item = tasksToCreate[i];
        
        // Slug generation
        let slugStr = item.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');

        const task = await Task.create({
          ...item,
          slug: `${slugStr}-${activeUser._id.toString().substring(20)}`,
          project: project1._id,
          projectId: project1._id,
          order: i,
          position: i,
          subtasks: [
            { title: 'Subtask 1 - Setup baseline environment', completed: true },
            { title: 'Subtask 2 - Implement test validation', completed: item.status === 'done' }
          ],
          comments: item.status === 'done' ? [
            { author: marcus._id, text: 'Clean PR, works perfectly!' },
            { author: activeUser._id, text: 'Awesome, ready to merge.' }
          ] : [
            { author: elena._id, text: 'Please check the mobile layout scaling again.' }
          ],
          activities: [
            { action: 'created', performedBy: item.reporter, details: `Created task "${item.title}"` },
            { action: 'assigned', performedBy: item.reporter, details: `Assigned task to assignee` },
            { action: 'moved', performedBy: activeUser._id, details: `Moved task to [${item.status}]` }
          ]
        });

        createdTasks.push(task);

        if (item.sprintId && item.sprintId.toString() === sprint1._id.toString()) {
          sprint1TaskIds.push(task._id);
        } else if (item.sprintId && item.sprintId.toString() === sprint2._id.toString()) {
          sprint2TaskIds.push(task._id);
        }
      }

      // Update Sprint Task Arrays
      await Sprint.findByIdAndUpdate(sprint1._id, { tasks: sprint1TaskIds });
      await Sprint.findByIdAndUpdate(sprint2._id, { tasks: sprint2TaskIds });

      // 5. Seed Gorgeous Notification Stream logs for this user (Recent Activity feed targets!)
      const logsToCreate = [
        {
          type: 'sprint_completed',
          title: 'Sprint Completed',
          message: `${elena.name} completed the sprint "Sprint 1 - System Foundations"`,
          entityType: 'sprint',
          entityId: sprint1._id,
          createdBy: elena._id,
          createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000)
        },
        {
          type: 'task_moved',
          title: 'Task Completed',
          message: `${activeUser.name} completed the task "FS-108: Fix Tickets Ring Mobile layout overflows"`,
          entityType: 'task',
          entityId: createdTasks.find(t => t.title.includes('FS-108'))._id,
          createdBy: activeUser._id,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        },
        {
          type: 'task_moved',
          title: 'Task Completed',
          message: `${activeUser.name} completed the task "FS-109: Dynamic Recent Activity stream widgets"`,
          entityType: 'task',
          entityId: createdTasks.find(t => t.title.includes('FS-109'))._id,
          createdBy: activeUser._id,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          type: 'task_assigned',
          title: 'Task Assigned',
          message: `${activeUser.name} assigned task "FS-106: Setup socket.io communication pipelines" to ${marcus.name}`,
          entityType: 'task',
          entityId: createdTasks.find(t => t.title.includes('FS-106'))._id,
          createdBy: activeUser._id,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        },
        {
          type: 'comment_added',
          title: 'Discussion Update',
          message: `${sarah.name} added a comment on "FS-110: Compact task discussion comments thread"`,
          entityType: 'comment',
          entityId: createdTasks.find(t => t.title.includes('FS-110'))._id,
          createdBy: sarah._id,
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
        }
      ];

      for (const log of logsToCreate) {
        await Notification.create({
          userId: activeUser._id,
          type: log.type,
          title: log.title,
          message: log.message,
          entityType: log.entityType,
          entityId: log.entityId,
          createdBy: log.createdBy,
          isRead: false,
          priority: 'medium',
          createdAt: log.createdAt,
          updatedAt: log.createdAt
        });
      }
    }

    console.log('✅ Realistic Database Seeding succeeded successfully!');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database.');
  }
}

seed();
