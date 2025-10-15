import { NextApiRequest, NextApiResponse } from 'next';
import { Server as IOServer } from 'socket.io';
import { Server as NetServer } from 'http';

interface SocketServer extends NetServer {
  io?: IOServer | undefined;
}

const SocketHandler = (req: NextApiRequest, res: NextApiResponse & { socket: { server: SocketServer } }) => {
  if (res.socket.server.io) {
    res.end();
    return;
  }

  const io = new IOServer(res.socket.server);
  res.socket.server.io = io;

  io.on('connection', (socket) => {
    // Join note room
    socket.on('join-note', (data: any) => {
      socket.join(`note-${data.noteId}`);
      socket.to(`note-${data.noteId}`).emit('user-joined', data);
    });

    // Handle content changes
    socket.on('content-change', (data: any) => {
      socket.to(`note-${data.noteId}`).emit('content-changed', data);
    });

    socket.on('disconnect', () => {
      // Handle disconnect
    });
  });

  res.end();
};

export default SocketHandler;
