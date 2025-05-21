import { useEffect } from 'react';

export function useNotifyLeaveRoom(socket, roomId) {
  useEffect(() => {
    if (!socket || !roomId) return;

    const handleBeforeUnload = () => {
      socket.emit('local:player-leave', { roomId });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    socket.on('disconnect', () => {
      socket.emit('local:player-leave', { roomId });
    });

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      socket.off('disconnect');
    };
  }, [socket, roomId]);
}
