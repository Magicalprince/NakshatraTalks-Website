'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { liveSessionService } from '@/lib/services/live-session.service';
import { socketService } from '@/lib/services/socket.service';
import {
  Radio,
  Clock,
  Send,
  ArrowLeft,
  Eye,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import type {
  LiveSession,
  LiveSessionMessage,
  JoinLiveSessionResponse,
} from '@/types/api.types';

function formatDuration(startedAt: string): string {
  const diff = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function LiveSessionViewerPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuthStore();
  const { isReady } = useRequireAuth();
  const sessionId = params.sessionId as string;

  // Session state
  const [session, setSession] = useState<LiveSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isSessionEnded, setIsSessionEnded] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [elapsed, setElapsed] = useState('00:00');

  // Twilio video
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const roomRef = useRef<any>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  // Store streams for deferred attachment after element mounts
  const remoteVideoStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioStreamRef = useRef<MediaStream | null>(null);

  // Chat state
  const [messages, setMessages] = useState<LiveSessionMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Timer ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Track if join has been attempted to prevent double-join
  const joinAttemptedRef = useRef(false);

  // Auto-scroll chat
  useEffect(() => {
    const container = chatScrollRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  // Elapsed timer
  useEffect(() => {
    if (isJoined && session?.startedAt) {
      const tick = () => setElapsed(formatDuration(session.startedAt!));
      tick();
      timerRef.current = setInterval(tick, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isJoined, session?.startedAt]);

  // Apply stored remote streams to video/audio elements when they mount
  useEffect(() => {
    if (isJoined && remoteVideoRef.current && remoteVideoStreamRef.current) {
      remoteVideoRef.current.srcObject = remoteVideoStreamRef.current;
    }
    if (isJoined && remoteAudioRef.current && remoteAudioStreamRef.current) {
      remoteAudioRef.current.srcObject = remoteAudioStreamRef.current;
    }
  }, [isJoined]);

  // Attach remote participant tracks
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const attachParticipantTracks = useCallback((participant: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const addTrack = (track: any) => {
      if (track.kind === 'video') {
        const stream = new MediaStream([track.mediaStreamTrack]);
        remoteVideoStreamRef.current = stream;
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
      }
      if (track.kind === 'audio') {
        const stream = new MediaStream([track.mediaStreamTrack]);
        remoteAudioStreamRef.current = stream;
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = stream;
        }
      }
    };

    // Attach existing tracks
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    participant.tracks.forEach((publication: any) => {
      if (publication.isSubscribed && publication.track) {
        addTrack(publication.track);
      }
    });

    // Listen for new tracks
    participant.on('trackSubscribed', addTrack);
  }, []);

  // Join session handler
  const handleJoin = useCallback(async () => {
    if (!sessionId || isJoining || isJoined) return;
    setIsJoining(true);

    try {
      const response = await liveSessionService.joinSession(sessionId);
      const joinData = response.data as JoinLiveSessionResponse;

      if (!joinData?.accessGranted && joinData?.accessGranted !== undefined) {
        toast.error('Cannot join', 'Access denied to this session');
        setIsJoining(false);
        return;
      }

      // Connect to Twilio room as viewer (subscribe-only)
      const twilioToken = joinData?.twilioToken;
      const twilioRoomName = joinData?.twilioRoomName || joinData?.session?.twilioRoomName;

      if (twilioToken && twilioRoomName) {
        try {
          const Video = await import('twilio-video');

          const room = await Video.connect(twilioToken, {
            name: twilioRoomName,
            tracks: [], // Viewer doesn't publish tracks
          });

          roomRef.current = room;

          // Handle existing participants (astrologer)
          room.participants.forEach(attachParticipantTracks);

          // Handle new participants joining
          room.on('participantConnected', attachParticipantTracks);

          // Handle participant leaving
          room.on('participantDisconnected', () => {
            remoteVideoStreamRef.current = null;
            remoteAudioStreamRef.current = null;
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
            if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
          });

          room.on('disconnected', () => {
            remoteVideoStreamRef.current = null;
            remoteAudioStreamRef.current = null;
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
            if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
          });
        } catch (err) {
          console.error('Twilio connect error:', err);
        }
      }

      // Connect socket and join room
      if (!socketService.isConnected) {
        socketService.connect();
      }
      socketService.joinLiveSession(
        sessionId,
        user?.id || '',
        user?.name || 'User',
        false
      );

      // Load existing messages
      try {
        const msgResponse = await liveSessionService.getMessages(sessionId);
        const existingMessages = msgResponse.data;
        if (Array.isArray(existingMessages)) {
          setMessages(existingMessages);
        }
      } catch {
        // Messages loading failure is non-critical
      }

      setIsJoined(true);
      setViewerCount((joinData?.session?.viewerCount || viewerCount) + 1);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to join session';
      toast.error('Could not join session', message);
    } finally {
      setIsJoining(false);
    }
  }, [sessionId, isJoining, isJoined, user?.id, user?.name, viewerCount, attachParticipantTracks, toast]);

  // Fetch session details and auto-join
  useEffect(() => {
    if (!isReady || !sessionId) return;

    async function fetchAndJoin() {
      try {
        setIsLoading(true);
        const response = await liveSessionService.getSession(sessionId);
        const s = response.data;
        if (!s) {
          setError('Session not found');
          return;
        }
        setSession(s);
        setViewerCount(s.viewerCount || 0);

        if (s.status === 'ended') {
          setIsSessionEnded(true);
        }
      } catch {
        setError('Failed to load session');
      } finally {
        setIsLoading(false);
      }
    }

    fetchAndJoin();
  }, [isReady, sessionId]);

  // Auto-join once session is loaded and not ended
  useEffect(() => {
    if (session && !isSessionEnded && !isJoined && !isJoining && !joinAttemptedRef.current) {
      joinAttemptedRef.current = true;
      handleJoin();
    }
  }, [session, isSessionEnded, isJoined, isJoining, handleJoin]);

  // Socket event handlers
  useEffect(() => {
    if (!isJoined || !sessionId) return;

    const unsubViewerCount = socketService.on('live:viewer-count', (data: unknown) => {
      const d = data as { viewerCount: number };
      setViewerCount(d.viewerCount);
    });

    const unsubViewerJoin = socketService.on('live:viewer-join', (data: unknown) => {
      const d = data as { viewerCount: number };
      setViewerCount(d.viewerCount);
    });

    const unsubViewerLeave = socketService.on('live:viewer-leave', (data: unknown) => {
      const d = data as { viewerCount: number };
      setViewerCount(d.viewerCount);
    });

    const unsubMessage = socketService.on('live:message', (data: unknown) => {
      const msg = data as LiveSessionMessage;
      setMessages((prev) => [...prev, msg]);
    });

    const unsubSessionEnd = socketService.on('live:session-end', () => {
      setIsSessionEnded(true);
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }
      remoteVideoStreamRef.current = null;
      remoteAudioStreamRef.current = null;
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
      toast.info('Session Ended', 'The astrologer has ended this live session');
    });

    return () => {
      unsubViewerCount();
      unsubViewerJoin();
      unsubViewerLeave();
      unsubMessage();
      unsubSessionEnd();
    };
  }, [isJoined, sessionId, toast]);

  // Send chat message
  const handleSendMessage = useCallback(async () => {
    if (!chatInput.trim() || !sessionId || isSendingMessage) return;
    setIsSendingMessage(true);
    try {
      await liveSessionService.sendMessage(sessionId, chatInput.trim());
      setChatInput('');
    } catch {
      toast.error('Failed to send message');
    } finally {
      setIsSendingMessage(false);
    }
  }, [chatInput, sessionId, isSendingMessage, toast]);

  // Leave session
  const handleLeave = useCallback(async () => {
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }
    remoteVideoStreamRef.current = null;
    remoteAudioStreamRef.current = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;

    if (sessionId) {
      try {
        await liveSessionService.leaveSession(sessionId);
      } catch {
        // Non-critical
      }
      socketService.leaveLiveSession(sessionId, user?.id || '', user?.name || 'User');
    }

    router.push('/live-sessions');
  }, [sessionId, user?.id, user?.name, router]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }
      if (sessionId && isJoined) {
        liveSessionService.leaveSession(sessionId).catch(() => {});
        socketService.leaveLiveSession(sessionId, user?.id || '', user?.name || 'User');
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Loading state ─────────────────────────────────────────────────────────
  if (!isReady || isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[60]">
        <div className="w-12 h-12 border-3 border-white/20 border-t-white rounded-full animate-spin mb-4" />
        <p className="text-white/70 text-sm font-nunito">Loading session...</p>
      </div>
    );
  }

  // ─── Error state ───────────────────────────────────────────────────────────
  if (error || !session) {
    return (
      <div className="min-h-screen bg-background-offWhite flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 bg-status-error/10 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-status-error" />
        </div>
        <h2 className="text-lg font-semibold text-text-primary mb-2 font-lexend">Session Not Found</h2>
        <p className="text-text-secondary text-center mb-4 font-nunito">{error || 'Unable to load this session.'}</p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
          <Button variant="primary" onClick={() => router.push('/live-sessions')}>
            Back to Sessions
          </Button>
        </div>
      </div>
    );
  }

  // ─── Session ended state ───────────────────────────────────────────────────
  if (isSessionEnded) {
    return (
      <div className="min-h-screen bg-background-offWhite flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Radio className="w-10 h-10 text-text-muted" />
        </div>
        <h2 className="text-xl font-bold text-text-primary font-lexend mb-2">Session Ended</h2>
        <p className="text-text-secondary text-center mb-1 font-nunito">
          {session.astrologerName}&apos;s live session has ended
        </p>
        <p className="text-text-muted text-sm mb-6 font-nunito">{session.title}</p>
        <Button variant="primary" onClick={() => router.push('/live-sessions')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Live Sessions
        </Button>
      </div>
    );
  }

  // ─── Joining state (connecting) ────────────────────────────────────────────
  if (!isJoined) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[60]">
        <div className="w-12 h-12 border-3 border-white/20 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-white/70 text-sm font-nunito">Joining session...</p>
        <p className="text-white/40 text-xs font-nunito mt-1">{session.title}</p>
      </div>
    );
  }

  // ─── Joined — fullscreen live viewer ───────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black flex flex-col z-[60]">
      {/* Video fills the screen */}
      <div className="relative flex-1 min-h-0">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-contain bg-black"
        />
        <audio ref={remoteAudioRef} autoPlay />

        {/* Top bar — gradient overlay with controls */}
        <div className="absolute top-0 left-0 right-0 px-3 pt-3 pb-8 bg-gradient-to-b from-black/70 via-black/30 to-transparent z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={handleLeave}
                className="flex items-center gap-1 text-white/90 hover:text-white text-sm font-nunito bg-white/10 hover:bg-white/20 rounded-full px-3 py-1.5 transition-colors backdrop-blur-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Leave</span>
              </button>
              <Badge variant="error" className="bg-red-500 shadow-glow-live">
                <span className="relative flex h-1.5 w-1.5 mr-1">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                </span>
                LIVE
              </Badge>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-nunito">
                <Eye className="w-3 h-3" />
                {viewerCount}
              </div>
              <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-nunito">
                <Clock className="w-3 h-3" />
                {elapsed}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom overlay — astrologer info + chat */}
        <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
          {/* Chat messages — floating bubbles with fade mask */}
          <div className="px-3 sm:px-4 pb-1">
            <div
              ref={chatScrollRef}
              className="max-h-[35vh] overflow-y-auto pointer-events-auto scrollbar-hide"
              style={{
                maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%)',
              }}
            >
              <div className="space-y-1 py-2">
                {messages.map((msg) => (
                  <div key={msg.id} className="flex items-start gap-1.5 max-w-[90%]">
                    <div className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-white/90">
                        {(msg.userName || 'U')[0].toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[13px] leading-snug">
                      <span className="font-semibold text-primary-light mr-1 font-lexend text-xs">
                        {msg.userName || 'User'}
                      </span>
                      <span className="text-white/90 font-nunito break-words">
                        {msg.message}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Astrologer info strip */}
          <div className="px-3 sm:px-4 py-2 pointer-events-auto bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-700 ring-2 ring-red-400/40 flex-shrink-0">
                <Image
                  src={session.astrologerImage || '/images/astrologer/astrologer3.png'}
                  alt={session.astrologerName}
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white font-semibold text-sm font-lexend truncate">{session.title}</p>
                <p className="text-white/50 text-xs font-nunito">{session.astrologerName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat input — pinned to bottom */}
      <div className="flex-shrink-0 bg-gray-950 border-t border-white/5 px-3 sm:px-4 py-2.5 z-30">
        <div className="flex items-center gap-2 max-w-5xl mx-auto">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Say something..."
            className="flex-1 bg-white/8 text-white rounded-full px-4 py-2.5 text-sm font-nunito outline-none focus:bg-white/12 focus:ring-1 focus:ring-primary/30 placeholder:text-white/30 transition-colors"
            disabled={isSendingMessage}
          />
          <button
            onClick={handleSendMessage}
            disabled={!chatInput.trim() || isSendingMessage}
            className="w-10 h-10 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center disabled:opacity-30 transition-all flex-shrink-0"
            aria-label="Send message"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
