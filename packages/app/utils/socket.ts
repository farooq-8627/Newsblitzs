import { io, Socket } from 'socket.io-client';
import { BACKEND_URL } from '../config/config';

class SocketManager {
  private static instance: Socket | null = null;

  public static getSocket(): Socket {
    if (!this.instance) {
      this.instance = io(BACKEND_URL, {
        transports: ['websocket'],
        reconnection: false,
        forceNew: false,
        multiplex: true
      });

      this.instance.on('connect', () => {
        console.log('Socket connected:', this.instance?.id);
      });
    }
    return this.instance;
  }

  public static disconnect() {
    if (this.instance) {
      this.instance.disconnect();
      this.instance = null;
    }
  }
}

export default SocketManager; 