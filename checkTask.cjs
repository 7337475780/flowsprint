const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/flowsprint';

async function main() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    const db = mongoose.connection.db;

    // Search for the specific task ID
    const targetId = '6a130adf83be94a52373b1b4';
    let task = null;
    try {
      task = await db.collection('tasks').findOne({ _id: new mongoose.Types.ObjectId(targetId) });
    } catch (e) {
      console.log('Error parsing ObjectId:', e.message);
    }

    if (task) {
      console.log('--- FOUND TASK ---');
      console.log(task);
    } else {
      console.log(`Task ${targetId} not found by ObjectId. Trying string query...`);
      const taskStr = await db.collection('tasks').findOne({ _id: targetId });
      if (taskStr) {
        console.log('--- FOUND TASK (String ID) ---');
        console.log(taskStr);
      } else {
        console.log('Task not found in tasks collection.');
      }
    }

    // List all tasks in the collection
    const allTasks = await db.collection('tasks').find({}).toArray();
    console.log(`\n--- ALL TASKS IN DB (Count: ${allTasks.length}) ---`);
    allTasks.forEach(t => {
      console.log(`- ${t.title} [id: ${t._id}] Status: ${t.status} Project: ${t.project || t.projectId}`);
    });

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

main();
