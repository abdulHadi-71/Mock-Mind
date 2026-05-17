import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { config } from '../config';
import { tokenService } from '../services/token.service';
import { interviewEngineService } from '../services/interview-engine.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

const interviewRooms = new Map<string, Set<string>>();

export function initSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: config.CLIENT_URL,
      credentials: true,
    },
    path: '/socket.io',
  });

  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error('Authentication required'));
    try {
      const payload = tokenService.verifyAccessToken(token);
      socket.userId = payload.sub;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;

    socket.on('join_interview', async (data: { interviewId: string }, cb) => {
      try {
        await interviewEngineService.getSession(userId, data.interviewId);
        const room = `interview:${data.interviewId}`;
        socket.join(room);

        if (!interviewRooms.has(data.interviewId)) {
          interviewRooms.set(data.interviewId, new Set());
        }
        interviewRooms.get(data.interviewId)!.add(userId);

        cb?.({ success: true, room });
      } catch (err) {
        cb?.({ success: false, message: err instanceof Error ? err.message : 'Join failed' });
      }
    });

    socket.on('user_answer', (data: { interviewId: string; answer: string }) => {
      const room = `interview:${data.interviewId}`;
      socket.to(room).emit('user_answer', { userId, answer: data.answer });
      io.to(room).emit('ai_typing', { typing: true });
    });

    socket.on('ai_response', (data: { interviewId: string; response: unknown }) => {
      const room = `interview:${data.interviewId}`;
      io.to(room).emit('ai_response', data.response);
      io.to(room).emit('ai_typing', { typing: false });
    });

    socket.on('next_question', (data: { interviewId: string; question: string }) => {
      const room = `interview:${data.interviewId}`;
      io.to(room).emit('next_question', { question: data.question });
    });

    socket.on('leave_interview', (data: { interviewId: string }) => {
      socket.leave(`interview:${data.interviewId}`);
      interviewRooms.get(data.interviewId)?.delete(userId);
    });

    socket.on('disconnect', () => {
      interviewRooms.forEach((users, id) => {
        users.delete(userId);
        if (users.size === 0) interviewRooms.delete(id);
      });
    });
  });

  return io;
}

export type SocketServer = Server;
