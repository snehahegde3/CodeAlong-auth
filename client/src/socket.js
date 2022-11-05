import { io } from 'socket.io-client';
//es module syntax

export const initSocket = async () => {
  const options = {
    'force new connection': true,
    reconnectionAttempt: 'Infinity',
    timeout: 10000,
    transports: ['websocket'],
  };
  return io(process.env.REACT_APP_BACKEND_URL, options);
};
