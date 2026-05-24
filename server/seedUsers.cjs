const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://flowsprint_admin:flowsprint_admin@ac-bw0itex-shard-00-00.qdypedp.mongodb.net:27017,ac-bw0itex-shard-00-01.qdypedp.mongodb.net:27017,ac-bw0itex-shard-00-02.qdypedp.mongodb.net:27017/flowsprint?replicaSet=atlas-es5qvx-shard-0&ssl=true&authSource=admin';

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
  name: String,
  members: [mongoose.Schema.Types.ObjectId]
});

const User = mongoose.model('User', userSchema);
const Project = mongoose.model('Project', projectSchema);

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    // 1. Define assignable mock users
    const mockUsers = [
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

    const seededUserIds = [];

    // 2. Create users (avoiding duplicates)
    for (const u of mockUsers) {
      let existing = await User.findOne({ email: u.email });
      if (!existing) {
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        u.password = await bcrypt.hash(u.password, salt);
        
        const created = await User.create(u);
        console.log(`Created user: ${created.name} (${created.email})`);
        seededUserIds.push(created._id);
      } else {
        console.log(`User already exists: ${existing.name} (${existing.email})`);
        seededUserIds.push(existing._id);
      }
    }

    // 3. Fetch all active projects and push these users into their member lists
    const projects = await Project.find({});
    console.log(`Found ${projects.length} projects to update.`);

    for (const project of projects) {
      let updated = false;
      for (const uid of seededUserIds) {
        if (!project.members.includes(uid.toString())) {
          project.members.push(uid);
          updated = true;
        }
      }
      if (updated) {
        await project.save();
        console.log(`Successfully added teammates to project workspace: "${project.name}"`);
      } else {
        console.log(`Teammates already assigned to project: "${project.name}"`);
      }
    }

    console.log('Seeding and project assignment complete!');
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

seed();
