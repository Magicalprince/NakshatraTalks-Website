/**
 * Socket.io Service - Real-Time Communication
 *
 * Manages WebSocket connection for:
 * - Live session messages & viewer updates
 * - Chat message delivery
 * - Notification broadcasts
 */

import { io, Socket } from 'socket.io-client';
import { API_CONFIG } from '@/lib/api/endpoints';
import { apiClient } from '@/lib/api/client';

type SocketEventHandler = (...args: unknown[]) => void;

class SocketService {
  private socket: Socket | null = null;
  private eventHandlers: Map<string, Set<SocketEventHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Connect to the WebSocket server with auth token
   */
  connect() {
    if (this.socket?.connected) return;

    const token = apiClient.getAccessToken();
    if (!token) return;

    // Derive WS URL from API URL
    const wsUrl = API_CONFIG.BASE_URL.replace(/^http/, 'ws');

    this.socket = io(wsUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    this.socket.on('connect', () => {
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', () => {
      // Will auto-reconnect via socket.io
    });

    this.socket.on('connect_error', () => {
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.disconnect();
      }
    });

    // Re-register all existing handlers
    this.eventHandlers.forEach((handlers, event) => {
      handlers.forEach((handler) => {
        this.socket?.on(event, handler);
      });
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.reconnectAttempts = 0;
  }

  /**
   * Subscribe to an event
   */
  on(event: string, handler: SocketEventHandler): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
    this.socket?.on(event, handler);

    // Return unsubscribe function
    return () => this.off(event, handler);
  }

  /**
   * Unsubscribe from an event
   */
  off(event: string, handler: SocketEventHandler) {
    this.eventHandlers.get(event)?.delete(handler);
    this.socket?.off(event, handler);
  }

  /**
   * Emit an event to server
   */
  emit(event: string, ...args: unknown[]) {
    this.socket?.emit(event, ...args);
  }

  // ─── Convenience Methods ─────────────────────────────────────────

  /**
   * Join a live session room
   */
  joinLiveSession(sessionId: string, userId: string, userName: string, isAstrologer?: boolean) {
    this.emit('live:join-room', { sessionId, userId, userName, isAstrologer });
  }

  /**
   * Leave a live session room
   */
  leaveLiveSession(sessionId: string, userId: string, userName: string) {
    this.emit('live:leave-room', { sessionId, userId, userName });
  }

  /**
   * Send message in live session (via REST API, not socket)
   * Socket is only used for receiving broadcasts
   */
  sendLiveMessage(sessionId: string, message: string) {
    this.emit('live_message', { sessionId, message });
  }

  /**
   * Join a chat session room
   */
  joinChatSession(sessionId: string) {
    this.emit('join_chat', { sessionId });
  }

  /**
   * Leave a chat session room
   */
  leaveChatSession(sessionId: string) {
    this.emit('leave_chat', { sessionId });
  }
}

export const socketService = new SocketService();
