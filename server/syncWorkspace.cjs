const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/flowsprint';

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  workspaces: [String],
  currentWorkspace: mongoose.Schema.Types.ObjectId
});

const workspaceSchema = new mongoose.Schema({
  name: String,
  owner: mongoose.Schema.Types.ObjectId,
  members: [mongoose.Schema.Types.ObjectId]
});

const projectSchema = new mongoose.Schema({
  name: String,
  owner: mongoose.Schema.Types.ObjectId,
  members: [mongoose.Schema.Types.ObjectId],
  workspaceId: mongoose.Schema.Types.ObjectId
});

const User = mongoose.model('User', userSchema);
const Workspace = mongoose.model('Workspace', workspaceSchema);
const Project = mongoose.model('Project', projectSchema);

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    // 1. Find all users in the database
    const users = await User.find({});
    console.log(`Found ${users.length} total users in database.`);

    // 2. Identify the main workspace (owned by Tharun)
    const mainWorkspaceId = '6a1298128a8ab8df9fed21f0';
    let mainWorkspace = await Workspace.findById(mainWorkspaceId);
    if (!mainWorkspace) {
      // Fallback search by Tharun's email
      const tharun = await User.findOne({ email: 'tharunlingala6@gmail.com' });
      if (tharun) {
        mainWorkspace = await Workspace.findOne({ owner: tharun._id });
      }
    }

    if (!mainWorkspace) {
      console.error('Could not find the main workspace.');
      return;
    }

    console.log(`Main Workspace found: "${mainWorkspace.name}" (${mainWorkspace._id})`);

    // 3. Add all users to the main workspace members and switch their currentWorkspace to it
    const memberIds = mainWorkspace.members.map(m => m.toString());
    let workspaceUpdated = false;

    for (const user of users) {
      const uidStr = user._id.toString();

      // Ensure user is in workspace members
      if (uidStr !== mainWorkspace.owner.toString() && !memberIds.includes(uidStr)) {
        mainWorkspace.members.push(user._id);
        memberIds.push(uidStr);
        workspaceUpdated = true;
        console.log(`Added user "${user.name}" to main workspace member roster.`);
      }

      // Sync user workspaces list and currentWorkspace
      let userUpdated = false;
      if (!user.workspaces) user.workspaces = [];
      
      if (!user.workspaces.includes(mainWorkspace._id.toString())) {
        user.workspaces.push(mainWorkspace._id.toString());
        userUpdated = true;
      }
      
      if (!user.currentWorkspace || user.currentWorkspace.toString() !== mainWorkspace._id.toString()) {
        user.currentWorkspace = mainWorkspace._id;
        userUpdated = true;
      }

      if (userUpdated) {
        await user.save();
        console.log(`Synced workspace routing fields for user "${user.name}".`);
      }
    }

    if (workspaceUpdated) {
      await mainWorkspace.save();
      console.log('Main workspace roster saved.');
    }

    // 4. Find all active projects inside this main workspace and populate their member lists with everyone
    const projects = await Project.find({ workspaceId: mainWorkspace._id });
    console.log(`Found ${projects.length} projects in main workspace.`);

    for (const project of projects) {
      let projectUpdated = false;
      const projMembers = project.members.map(m => m.toString());

      for (const user of users) {
        const uidStr = user._id.toString();
        // Add to project members if not already owner and not already in members
        if (uidStr !== project.owner.toString() && !projMembers.includes(uidStr)) {
          project.members.push(user._id);
          projMembers.push(uidStr);
          projectUpdated = true;
          console.log(`Added user "${user.name}" as teammate to project: "${project.name}"`);
        }
      }

      if (projectUpdated) {
        await project.save();
        console.log(`Project "${project.name}" members list saved.`);
      }
    }

    console.log('Roster and project synchronization complete!');
  } catch (err) {
    console.error('Sync failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

run();
