import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

let io: Server;

// Track online user presence: userId -> connection record
export interface ActiveUser {
  userId: string;
  socketId: string;
  name: string;
  email: string;
  avatar?: string;
  lastSeen: Date;
}

const connectedUsers = new Map<string, ActiveUser>();

export const initSocket = (server: any) => {
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [process.env.CLIENT_URL].filter(Boolean) as string[]
    : ['http://localhost:5173', 'http://localhost:3000', process.env.CLIENT_URL].filter(Boolean) as string[];

  io = new Server(server, {
    cors: {
      origin: allowedOrigins.length > 0 ? allowedOrigins : '*',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    },
  });

  // Socket authentication middleware using JWT tokens
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1];
      if (!token) {
        return next(new Error('Authentication failed: Missing token'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET || 'secret') as any;
      const user = await User.findById(decoded.id || decoded._id).select('-password');
      if (!user) {
        return next(new Error('Authentication failed: User not found'));
      }

      (socket as any).user = user;
      next();
    } catch (err) {
      return next(new Error('Authentication failed: Invalid authorization token'));
    }
  });

  io.on('connection', (socket) => {
    const user = (socket as any).user;
    const userId = user._id.toString();

    // 1. Connection Tracking & Online Presence registration
    const record: ActiveUser = {
      userId,
      socketId: socket.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      lastSeen: new Date(),
    };
    connectedUsers.set(userId, record);

    // Join user-specific personal notification room
    socket.join(`user:${userId}`);

    // Broadcast online presence status to all project rooms
    socket.broadcast.emit('presence:online', {
      userId,
      name: user.name,
      avatar: user.avatar,
    });

    // Provide client list of all online users
    socket.on('presence:get-active', () => {
      socket.emit('presence:active-users', Array.from(connectedUsers.values()));
    });

    // 2. Room Subscriptions
    socket.on('room:join', ({ projectId, sprintId }) => {
      if (projectId) {
        socket.join(`project:${projectId}`);
        // Notify others in room that a user entered
        io.to(`project:${projectId}`).emit('presence:project-users', getProjectUsers(projectId));
      }
      if (sprintId) {
        socket.join(`sprint:${sprintId}`);
      }
    });

    socket.on('room:leave', ({ projectId, sprintId }) => {
      if (projectId) {
        socket.leave(`project:${projectId}`);
        io.to(`project:${projectId}`).emit('presence:project-users', getProjectUsers(projectId));
      }
      if (sprintId) {
        socket.leave(`sprint:${sprintId}`);
      }
    });

    // 3. Typing Indicators
    socket.on('comment:typing', ({ projectId, sprintId, taskId, isTyping }) => {
      const targetRoom = sprintId ? `sprint:${sprintId}` : (projectId ? `project:${projectId}` : null);
      if (targetRoom) {
        socket.to(targetRoom).emit('comment:typing', {
          userId,
          name: user.name,
          taskId,
          isTyping,
        });
      }
    });

    // 4. Disconnect cleanups
    socket.on('disconnect', () => {
      connectedUsers.delete(userId);
      socket.broadcast.emit('presence:offline', { userId });
      
      // Clean up rooms
      socket.leave(`user:${userId}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.IO has not been initialized');
  }
  return io;
};

// Helper: list online users in a project room
const getProjectUsers = (projectId: string): ActiveUser[] => {
  const room = io.sockets.adapter.rooms.get(`project:${projectId}`);
  if (!room) return [];
  
  const list: ActiveUser[] = [];
  room.forEach((socketId) => {
    for (const record of connectedUsers.values()) {
      if (record.socketId === socketId) {
        list.push(record);
        break;
      }
    }
  });
  return list;
};

// --- Broadcasters for Backend Service triggers ---

export const emitTaskEvent = (projectId: string, eventName: string, payload: any) => {
  if (io) {
    io.to(`project:${projectId}`).emit(eventName, payload);
  }
};

export const emitSprintEvent = (projectId: string, sprintId: string, eventName: string, payload: any) => {
  if (io) {
    io.to(`project:${projectId}`).emit(eventName, payload);
    if (sprintId) {
      io.to(`sprint:${sprintId}`).emit(eventName, payload);
    }
  }
};

export const emitNotification = (userId: string, payload: any) => {
  if (io) {
    io.to(`user:${userId}`).emit('notification:new', payload);
  }
};
