import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useNoteSocket = (noteId: string | null, userId: string, username: string, onContentChanged?: (data: any) => void) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!noteId || !userId || !username) {
      return;
    }

    const initSocket = async () => {
      try {
        // Initialize the socket server
        await fetch('/api/socket');
        
        const socket = io();
        socketRef.current = socket;

        socket.on('connect', () => {
          setIsConnected(true);
          socket.emit('join-note', { noteId, userId, username });
        });

        socket.on('connect_error', () => {
          setIsConnected(false);
        });

        socket.on('disconnect', () => {
          setIsConnected(false);
        });

        socket.on('user-joined', (data: any) => {
          // User joined notification
        });

        socket.on('content-changed', (data: any) => {
          // Handle incoming content changes - allow same user from different browser tabs/devices
          if (data.socketId !== socket.id) {
            if (onContentChanged) {
              onContentChanged(data);
            }
          }
        });

      } catch (error) {
        // Error initializing socket
      }
    };

    initSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [noteId, userId, username, onContentChanged]);

  const emitContentChange = (field: string, value: string) => {
    if (socketRef.current && isConnected && noteId) {
      socketRef.current.emit('content-change', { 
        noteId, 
        field, 
        value, 
        userId,
        socketId: socketRef.current.id 
      });
    }
  };

  return {
    isConnected,
    emitContentChange,
  };
};