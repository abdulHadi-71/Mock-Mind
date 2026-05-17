import { io, Socket } from 'socket.io-client';
import { api } from './api';

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ??
  process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ??
  'http://localhost:5000';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: { token: api.getAccessToken() },
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });
  }
  const token = api.getAccessToken();
  if (token) socket.auth = { token };
  return socket;
}

export function connectSocket(): Socket {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket() {
  socket?.disconnect();
}
