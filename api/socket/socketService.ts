import { io, Socket } from 'socket.io-client';
import { store } from '../../store/store';

let socket: Socket | null = null;

export const initiateSocketConnection = () => {
  const token = store.getState().auth.token;
  if (!token) return;

  if (socket?.connected) return socket;

  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL as string, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5
  });

  socket.on('connect', () => console.log('Socket connected:', socket?.id));
  socket.on('connect_error', (err) => console.error('Socket error:', err.message));

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;