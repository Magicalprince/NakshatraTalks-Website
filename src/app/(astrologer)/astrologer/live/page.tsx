'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  useLiveSessionHistory,
  useScheduledLiveSessions,
  useCreateLiveSession,
  useStartLiveSession,
  useEndLiveSession,
  useCancelLiveSession,
} from '@/hooks/useAstrologerDashboard';
import { useToast } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { socketService } from '@/lib/services/socket.service';
import { liveSessionService } from '@/lib/services/live-session.service';
import {
  Radio,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Users,
  MessageSquare,
  Clock,
  Play,
  StopCircle,
  History,
  Lightbulb,
  Info,
  Calendar,
  Trash2,
  Loader2,
  Send,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PageContainer } from '@/components/layout/PageContainer';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { SectionHeader, EmptyState, StatCard } from '@/components/shared';
import type {
  SessionCategory,
  AstrologerSessionHistory,
  AstrologerScheduledSession,
  StartLiveSessionResponse,
  EndLiveSessionResponse,
  LiveSessionMessage,
} from '@/types/api.types';

function formatDurationDisplay(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatElapsed(startTime: string): string {
  const diff = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

const TOPICS: { value: SessionCategory; label: string }[] = [
  { value: 'general', label: 'General Discussion' },
  { value: 'love', label: 'Love & Relationships' },
  { value: 'career', label: 'Career & Finance' },
  { value: 'health', label: 'Health & Wellness' },
];

export default function AstrologerLivePage() {
  const toast = useToast();
  const { user } = useAuthStore();

  // Live state
  const [isLive, setIsLive] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [liveStartTime, setLiveStartTime] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState('00:00');
  const [viewerCount, setViewerCount] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Twilio video
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const roomRef = useRef<any>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Chat state
  const [messages, setMessages] = useState<LiveSessionMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // UI state
  const [showStartModal, setShowStartModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showEndSummary, setShowEndSummary] = useState(false);
  const [endSummary, setEndSummary] = useState<EndLiveSessionResponse | null>(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [sessionTopic, setSessionTopic] = useState<SessionCategory>('general');
  const [isStarting, setIsStarting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  // Data hooks
  const { data: pastSessions, isLoading: historyLoading } = useLiveSessionHistory();
  const { data: scheduledSessions, isLoading: scheduledLoading } = useScheduledLiveSessions();

  // Mutation hooks
  const createSession = useCreateLiveSession();
  const startSession = useStartLiveSession();
  const endSession = useEndLiveSession();
  const cancelSession = useCancelLiveSession();

  // Detect stuck/active live session on page load and show recovery UI
  const [stuckSession, setStuckSession] = useState<AstrologerScheduledSession | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);

  useEffect(() => {
    if (scheduledLoading || isLive) return;

    const sessions = scheduledSessions ?? [];
    const liveSession = sessions.find((s) => s.status === 'live');
    if (liveSession && !activeSessionId) {
      setStuckSession(liveSession);
    } else {
      setStuckSession(null);
    }
  }, [scheduledSessions, scheduledLoading, isLive, activeSessionId]);

  // Auto-scroll chat within its container only (not the page)
  useEffect(() => {
    const container = chatScrollRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  // Elapsed timer
  useEffect(() => {
    if (isLive && liveStartTime) {
      const tick = () => setElapsedTime(formatElapsed(liveStartTime));
      tick();
      timerRef.current = setInterval(tick, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLive, liveStartTime]);

  // Apply stored local stream to video element when it mounts (isLive becomes true)
  useEffect(() => {
    if (isLive && localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [isLive]);

  // Socket event handlers for live session
  useEffect(() => {
    if (!isLive || !activeSessionId) return;

    // Connect socket if not connected
    if (!socketService.isConnected) {
      socketService.connect();
    }

    // Join the session room
    socketService.joinLiveSession(
      activeSessionId,
      user?.id || '',
      user?.name || 'Astrologer',
      true
    );

    // Listen for viewer count updates
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

    // Listen for chat messages
    const unsubMessage = socketService.on('live:message', (data: unknown) => {
      const msg = data as LiveSessionMessage;
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      unsubViewerCount();
      unsubViewerJoin();
      unsubViewerLeave();
      unsubMessage();
      if (activeSessionId) {
        socketService.leaveLiveSession(
          activeSessionId,
          user?.id || '',
          user?.name || 'Astrologer'
        );
      }
    };
  }, [isLive, activeSessionId, user?.id, user?.name]);

  // Connect to Twilio room when going live
  const connectTwilioRoom = useCallback(async (token: string, roomName: string) => {
    try {
      const Video = await import('twilio-video');

      const localTracks = await Video.createLocalTracks({
        audio: true,
        video: { width: 1280, height: 720 },
      });

      // Store local stream in ref — it will be applied to the video element
      // via useEffect once isLive is true and the <video> element mounts
      const localStream = new MediaStream();
      localTracks.forEach((track) => {
        if ('mediaStreamTrack' in track) {
          localStream.addTrack(track.mediaStreamTrack);
        }
      });
      localStreamRef.current = localStream;

      // If video element is already mounted, apply immediately
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }

      const room = await Video.connect(token, {
        name: roomName,
        tracks: localTracks,
      });

      roomRef.current = room;

      room.on('disconnected', () => {
        localTracks.forEach((track) => {
          if ('stop' in track) track.stop();
        });
      });
    } catch (error) {
      const isDenied = error instanceof DOMException && (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError');
      toast.error(
        isDenied ? 'Permission Denied' : 'Camera Error',
        isDenied
          ? 'Camera/microphone access was denied. Please allow access in your browser settings.'
          : 'Failed to access camera. Please check your device settings.'
      );
    }
  }, [toast]);

  // Disconnect Twilio room
  const disconnectTwilioRoom = useCallback(() => {
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    localStreamRef.current = null;
  }, []);

  // Resume a stuck live session (reconnect Twilio)
  const handleResumeSession = useCallback(async (session: AstrologerScheduledSession) => {
    setIsRecovering(true);
    try {
      // Re-start returns a new Twilio token for the existing live session
      const response = await startSession.mutateAsync(session.id);
      const startData = response.data as StartLiveSessionResponse;

      if (startData?.twilioToken && startData?.twilioRoomName) {
        await connectTwilioRoom(startData.twilioToken, startData.twilioRoomName);
      }

      // Join as viewer so astrologer can send chat messages
      try { await liveSessionService.joinSession(session.id); } catch { /* non-critical */ }

      setActiveSessionId(session.id);
      setSessionTitle(session.title);
      setLiveStartTime(startData?.startTime || new Date().toISOString());
      setIsLive(true);
      setStuckSession(null);
      setViewerCount(0);
      setMessages([]);

      toast.success('Session resumed!', 'You are back live');
    } catch {
      toast.error('Could not resume session', 'Try ending the session and starting a new one.');
    } finally {
      setIsRecovering(false);
    }
  }, [startSession, connectTwilioRoom, toast]);

  // Force-end a stuck live session
  const handleForceEndSession = useCallback(async (sessionId: string) => {
    setIsRecovering(true);
    try {
      await endSession.mutateAsync(sessionId);
      setStuckSession(null);
      toast.success('Session ended', 'You can now start a new live session');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to end session';
      toast.error('Could not end session', message);
    } finally {
      setIsRecovering(false);
    }
  }, [endSession, toast]);

  // Toggle audio
  const handleToggleAudio = useCallback(() => {
    if (roomRef.current) {
      roomRef.current.localParticipant.audioTracks.forEach(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (publication: any) => {
          if (audioEnabled) {
            publication.track.disable();
          } else {
            publication.track.enable();
          }
        }
      );
    }
    setAudioEnabled((prev) => !prev);
  }, [audioEnabled]);

  // Toggle video
  const handleToggleVideo = useCallback(() => {
    if (roomRef.current) {
      roomRef.current.localParticipant.videoTracks.forEach(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (publication: any) => {
          if (videoEnabled) {
            publication.track.disable();
          } else {
            publication.track.enable();
          }
        }
      );
    }
    setVideoEnabled((prev) => !prev);
  }, [videoEnabled]);

  // Send chat message
  const handleSendMessage = useCallback(async () => {
    if (!chatInput.trim() || !activeSessionId || isSendingMessage) return;
    setIsSendingMessage(true);
    try {
      await liveSessionService.sendMessage(activeSessionId, chatInput.trim());
      setChatInput('');
    } catch {
      toast.error('Failed to send message');
    } finally {
      setIsSendingMessage(false);
    }
  }, [chatInput, activeSessionId, isSendingMessage, toast]);

  const handleStartLive = useCallback(async () => {
    if (!sessionTitle.trim()) return;
    setIsStarting(true);

    let createdSessionId: string | null = null;

    try {
      // Step 1: Create the session
      const createResponse = await createSession.mutateAsync({
        title: sessionTitle.trim(),
        description: sessionDescription.trim() || undefined,
        category: sessionTopic,
      });

      const session = createResponse.data;
      if (!session?.id) {
        toast.error('Failed to create session', 'No session ID returned');
        setIsStarting(false);
        return;
      }

      createdSessionId = session.id;

      // Step 2: Start the session (get Twilio token)
      const startResponse = await startSession.mutateAsync(session.id);
      const startData = startResponse.data as StartLiveSessionResponse;

      // Step 3: Connect to Twilio room
      if (startData?.twilioToken && startData?.twilioRoomName) {
        await connectTwilioRoom(startData.twilioToken, startData.twilioRoomName);
      }

      // Step 4: Join as viewer so astrologer can send chat messages
      try { await liveSessionService.joinSession(session.id); } catch { /* non-critical */ }

      setActiveSessionId(session.id);
      setLiveStartTime(startData?.startTime || new Date().toISOString());
      setIsLive(true);
      setShowStartModal(false);
      setViewerCount(0);
      setMessages([]);

      toast.success('You are now live!', 'Your session has started');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start session';
      const errorStr = String(err);

      // If create returned 409 (active session exists), prompt user to resolve it
      if (errorStr.includes('409') || errorStr.includes('ACTIVE_SESSION_EXISTS') || errorMessage.toLowerCase().includes('active session')) {
        toast.error(
          'Active session exists',
          'You already have a live or scheduled session. Please end it first before starting a new one.'
        );
      } else if (createdSessionId) {
        // Create succeeded but start failed — try to clean up the created session
        toast.error('Could not start live session', errorMessage);
        try {
          await cancelSession.mutateAsync(createdSessionId);
        } catch {
          // Silent cleanup failure — session left as scheduled, user can cancel manually
        }
      } else {
        toast.error('Could not start live session', errorMessage);
      }
    } finally {
      setIsStarting(false);
    }
  }, [sessionTitle, sessionDescription, sessionTopic, createSession, startSession, cancelSession, connectTwilioRoom, toast]);

  const handleEndLive = useCallback(async () => {
    if (!activeSessionId) return;
    setIsEnding(true);

    try {
      // Disconnect Twilio first
      disconnectTwilioRoom();

      const response = await endSession.mutateAsync(activeSessionId);
      const summary = response.data as EndLiveSessionResponse;

      setIsLive(false);
      setShowEndModal(false);
      setEndSummary(summary);
      setShowEndSummary(true);

      // Reset state
      setActiveSessionId(null);
      setLiveStartTime(null);
      setViewerCount(0);
      setMessages([]);
      setSessionTitle('');
      setSessionDescription('');
      setSessionTopic('general');

      toast.success('Session ended', 'Your live session has been saved');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to end session';
      toast.error('Could not end session', message);
    } finally {
      setIsEnding(false);
    }
  }, [activeSessionId, endSession, disconnectTwilioRoom, toast]);

  const handleCancelScheduled = useCallback(async (sessionId: string) => {
    try {
      await cancelSession.mutateAsync(sessionId);
      toast.success('Session cancelled');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to cancel';
      toast.error('Could not cancel session', message);
    }
  }, [cancelSession, toast]);

  const handleStartScheduled = useCallback(async (session: AstrologerScheduledSession) => {
    setIsStarting(true);
    try {
      const response = await startSession.mutateAsync(session.id);
      const startData = response.data as StartLiveSessionResponse;

      // Connect to Twilio room
      if (startData?.twilioToken && startData?.twilioRoomName) {
        await connectTwilioRoom(startData.twilioToken, startData.twilioRoomName);
      }

      // Join as viewer so astrologer can send chat messages
      try { await liveSessionService.joinSession(session.id); } catch { /* non-critical */ }

      setActiveSessionId(session.id);
      setSessionTitle(session.title);
      setLiveStartTime(startData?.startTime || new Date().toISOString());
      setIsLive(true);
      setStuckSession(null);
      setViewerCount(0);
      setMessages([]);

      toast.success('You are now live!', `"${session.title}" has started`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start';
      const errorStr = String(err);

      if (errorStr.includes('400') || errorMessage.toLowerCase().includes('already live')) {
        toast.error('Session already live', 'This session is already live. Try resuming it from the recovery banner above.');
      } else {
        toast.error('Could not start session', errorMessage);
      }
    } finally {
      setIsStarting(false);
    }
  }, [startSession, connectTwilioRoom, toast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectTwilioRoom();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const history = pastSessions ?? [];
  const scheduled = scheduledSessions ?? [];

  return (
    <div className="min-h-screen bg-background-offWhite">
      <PageContainer size="lg">
        <Breadcrumbs items={[
          { label: 'Dashboard', href: '/astrologer/dashboard' },
          { label: 'Go Live' },
        ]} />

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary font-lexend">Go Live</h1>
            <p className="text-text-secondary text-sm mt-1">
              {isLive ? 'You are currently live!' : 'Start a live session with your followers'}
            </p>
          </div>
          {isLive && (
            <Badge variant="error" className="animate-pulse">
              <Radio className="w-3 h-3 mr-1" />
              LIVE
            </Badge>
          )}
        </div>

        {/* Stuck/Active Session Recovery Banner */}
        {stuckSession && !isLive && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="p-4 border-2 border-status-warning/50 bg-status-warning/5 shadow-web-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-status-warning/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5 text-status-warning" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-primary font-lexend">
                    Active Session Detected
                  </p>
                  <p className="text-sm text-text-secondary mt-0.5">
                    Your session &quot;{stuckSession.title}&quot; is still live. You can resume streaming or end it to start a new one.
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <Button
                      size="sm"
                      onClick={() => handleResumeSession(stuckSession)}
                      disabled={isRecovering}
                    >
                      {isRecovering ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-1" />
                      ) : (
                        <RotateCcw className="w-4 h-4 mr-1" />
                      )}
                      Resume Session
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleForceEndSession(stuckSession.id)}
                      disabled={isRecovering}
                      className="text-status-error border-status-error/30 hover:bg-status-error/5"
                    >
                      {isRecovering ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-1" />
                      ) : (
                        <StopCircle className="w-4 h-4 mr-1" />
                      )}
                      End Session
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {isLive ? (
          /* 2-column layout when live */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Video + Chat */}
            <div className="lg:col-span-2 space-y-6">
              {/* Live Video Preview */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="aspect-video bg-gray-900 relative overflow-hidden shadow-web-md" padding="none">
                  {/* Video element for local camera feed */}
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ display: videoEnabled ? 'block' : 'none' }}
                  />

                  {/* Camera off placeholder */}
                  {!videoEnabled && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                      <VideoOff className="w-12 h-12 mb-2" />
                      <span className="font-lexend">Camera Off</span>
                    </div>
                  )}

                  {/* Live Stats Overlay */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                    <Badge variant="error" className="bg-red-500">
                      <Radio className="w-3 h-3 mr-1" />
                      LIVE
                    </Badge>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-black/50 text-white border-0">
                        <Users className="w-3 h-3 mr-1" />
                        {viewerCount}
                      </Badge>
                      <Badge variant="secondary" className="bg-black/50 text-white border-0">
                        <Clock className="w-3 h-3 mr-1" />
                        {elapsedTime}
                      </Badge>
                    </div>
                  </div>

                  {/* Controls Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-4 z-10">
                    <button
                      onClick={handleToggleAudio}
                      aria-label={audioEnabled ? 'Mute microphone' : 'Unmute microphone'}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                        audioEnabled ? 'bg-white/20 hover:bg-white/30' : 'bg-red-500 hover:bg-red-600'
                      }`}
                    >
                      {audioEnabled ? (
                        <Mic className="w-5 h-5 text-white" />
                      ) : (
                        <MicOff className="w-5 h-5 text-white" />
                      )}
                    </button>
                    <button
                      onClick={handleToggleVideo}
                      aria-label={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                        videoEnabled ? 'bg-white/20 hover:bg-white/30' : 'bg-red-500 hover:bg-red-600'
                      }`}
                    >
                      {videoEnabled ? (
                        <Video className="w-5 h-5 text-white" />
                      ) : (
                        <VideoOff className="w-5 h-5 text-white" />
                      )}
                    </button>
                    <button
                      onClick={() => setShowEndModal(true)}
                      aria-label="End live session"
                      className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
                    >
                      <StopCircle className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </Card>
              </motion.div>

              {/* Live Chat */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <SectionHeader icon={MessageSquare} title="Live Chat" />
                <Card className="shadow-web-sm">
                  <div ref={chatScrollRef} className="h-64 bg-background-offWhite rounded-t-lg p-3 overflow-y-auto space-y-2">
                    {messages.length === 0 ? (
                      <p className="text-text-muted text-sm text-center py-8">
                        Chat messages will appear here
                      </p>
                    ) : (
                      messages.map((msg) => (
                        <div key={msg.id} className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-semibold text-primary">
                              {(msg.userName || 'U')[0].toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-semibold text-primary mr-1.5">
                              {msg.userName || 'User'}
                            </span>
                            <span className="text-sm text-text-primary break-words">
                              {msg.message}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {/* Chat input */}
                  <div className="p-3 border-t border-gray-100 flex items-center gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Send a message..."
                      className="flex-1 bg-background-offWhite rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/30"
                      disabled={isSendingMessage}
                    />
                    <Button
                      size="sm"
                      onClick={handleSendMessage}
                      disabled={!chatInput.trim() || isSendingMessage}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar - Live Stats */}
            <div className="lg:col-span-1 space-y-4">
              {[
                { icon: Users, value: viewerCount, label: 'Viewers', color: 'text-primary', bg: 'bg-primary/10' },
                { icon: Clock, value: elapsedTime, label: 'Duration', color: 'text-status-warning', bg: 'bg-status-warning/10' },
                { icon: MessageSquare, value: messages.length, label: 'Messages', color: 'text-status-info', bg: 'bg-status-info/10' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <StatCard
                    icon={stat.icon}
                    value={stat.value}
                    label={stat.label}
                    color={stat.color}
                    bg={stat.bg}
                    layout="horizontal"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          /* 2-column layout when not live */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Start Live CTA */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <EmptyState
                  icon={Radio}
                  title="Start a Live Session"
                  description="Connect with your followers in real-time. Share insights, answer questions, and grow your audience."
                  action={
                    <Button size="lg" onClick={() => setShowStartModal(true)}>
                      <Play className="w-5 h-5 mr-2" />
                      Go Live Now
                    </Button>
                  }
                />
              </motion.div>

              {/* Scheduled Sessions */}
              {(scheduledLoading || scheduled.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <SectionHeader icon={Calendar} title="Scheduled Sessions" />
                  <div className="space-y-3">
                    {scheduledLoading ? (
                      Array.from({ length: 2 }).map((_, i) => (
                        <Card key={i} className="p-4 shadow-web-sm border border-gray-100">
                          <div className="flex items-center gap-3">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-40" />
                              <Skeleton className="h-3 w-28" />
                            </div>
                            <Skeleton className="h-8 w-20" />
                          </div>
                        </Card>
                      ))
                    ) : (
                      scheduled.map((session, i) => (
                        <motion.div
                          key={session.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + i * 0.05 }}
                        >
                          <Card className="p-4 shadow-web-sm hover:shadow-web-md transition-all border border-gray-100">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-status-info/10 flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-status-info" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-text-primary truncate">{session.title}</p>
                                <p className="text-xs text-text-muted">
                                  {session.category && <span className="capitalize">{session.category} &middot; </span>}
                                  {(session.scheduledStartTime || session.scheduledAt) ? new Date(session.scheduledStartTime || session.scheduledAt!).toLocaleString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  }) : 'Pending'}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleStartScheduled(session)}
                                  disabled={isStarting}
                                >
                                  {isStarting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <>
                                      <Play className="w-3 h-3 mr-1" />
                                      Start
                                    </>
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCancelScheduled(session.id)}
                                  disabled={cancelSession.isPending}
                                >
                                  <Trash2 className="w-4 h-4 text-status-error" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}

              {/* Past Sessions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <SectionHeader icon={History} title="Recent Live Sessions" />
                <div className="space-y-3">
                  {historyLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i} className="p-4 shadow-web-sm border border-gray-100">
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-10 h-10 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-3 w-28" />
                          </div>
                          <Skeleton className="h-5 w-16" />
                        </div>
                      </Card>
                    ))
                  ) : history.length === 0 ? (
                    <EmptyState
                      icon={Video}
                      title="No past live sessions"
                      description="Your live session history will appear here after you go live"
                    />
                  ) : (
                    history.map((session: AstrologerSessionHistory, i: number) => (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 + i * 0.05 }}
                      >
                        <Card className="p-4 shadow-web-sm hover:shadow-web-md transition-all border border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Video className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-text-primary truncate">{session.title}</p>
                              <p className="text-xs text-text-muted">
                                {session.peakViewers} viewers &middot;{' '}
                                {session.durationFormatted || formatDurationDisplay(session.duration)}
                                {' '}&middot;{' '}
                                {new Date(session.startTime).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                })}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-text-muted">
                                <Users className="w-3 h-3 inline mr-1" />
                                {session.totalViewers} total
                              </p>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            </div>

            {/* Sidebar - Tips */}
            <div className="lg:col-span-1 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <SectionHeader icon={Lightbulb} title="Tips" />
                <Card className="p-5 shadow-web-sm">
                  <ul className="space-y-4 text-sm text-text-secondary">
                    <li className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Video className="w-4 h-4 text-primary" />
                      </div>
                      <span>Good lighting and a quiet environment</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Mic className="w-4 h-4 text-primary" />
                      </div>
                      <span>Test your audio before going live</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <span>Engage with viewer questions</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Info className="w-4 h-4 text-primary" />
                      </div>
                      <span>Use a stable internet connection</span>
                    </li>
                  </ul>
                </Card>
              </motion.div>
            </div>
          </div>
        )}

        {/* Start Live Modal */}
        <Modal
          isOpen={showStartModal}
          onClose={() => setShowStartModal(false)}
          title="Start Live Session"
        >
          <div className="space-y-4">
            <Input
              label="Session Title"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              placeholder="e.g., Weekly Horoscope Discussion"
            />

            <Input
              label="Description (optional)"
              value={sessionDescription}
              onChange={(e) => setSessionDescription(e.target.value)}
              placeholder="What will you discuss in this session?"
            />

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Topic
              </label>
              <div className="flex flex-wrap gap-2">
                {TOPICS.map((topic) => (
                  <button
                    key={topic.value}
                    onClick={() => setSessionTopic(topic.value)}
                    className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                      sessionTopic === topic.value
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                    }`}
                  >
                    {topic.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-status-warning/10 p-3 rounded-lg">
              <p className="text-sm text-status-warning">
                Make sure you have a stable internet connection before starting your live session.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowStartModal(false)} disabled={isStarting}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleStartLive} disabled={!sessionTitle.trim() || isStarting}>
                {isStarting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Live
                  </>
                )}
              </Button>
            </div>
          </div>
        </Modal>

        {/* End Live Modal */}
        <Modal
          isOpen={showEndModal}
          onClose={() => setShowEndModal(false)}
          title="End Live Session?"
        >
          <div className="space-y-4">
            <p className="text-text-secondary">
              Are you sure you want to end this live session? All viewers will be disconnected.
            </p>

            <div className="bg-background-offWhite p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-text-secondary text-sm">Duration</span>
                <span className="font-medium text-sm">{elapsedTime}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-text-secondary text-sm">Current Viewers</span>
                <span className="font-medium text-sm">{viewerCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary text-sm">Messages</span>
                <span className="font-medium text-sm">{messages.length}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowEndModal(false)} disabled={isEnding}>
                Continue Live
              </Button>
              <Button variant="primary" className="flex-1 bg-status-error hover:bg-status-error/90" onClick={handleEndLive} disabled={isEnding}>
                {isEnding ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Ending...
                  </>
                ) : (
                  <>
                    <StopCircle className="w-4 h-4 mr-2" />
                    End Session
                  </>
                )}
              </Button>
            </div>
          </div>
        </Modal>

        {/* End Session Summary Modal */}
        <Modal
          isOpen={showEndSummary}
          onClose={() => setShowEndSummary(false)}
          title="Session Summary"
        >
          {endSummary && (
            <div className="space-y-4">
              <div className="bg-status-success/10 p-4 rounded-lg text-center">
                <p className="text-status-success font-semibold font-lexend">Session Completed!</p>
              </div>

              <div className="bg-background-offWhite p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-secondary text-sm">Duration</span>
                  <span className="font-medium text-sm">{formatDurationDisplay(endSummary.duration)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary text-sm">Peak Viewers</span>
                  <span className="font-medium text-sm">{endSummary.peakViewers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary text-sm">Total Unique Viewers</span>
                  <span className="font-medium text-sm">{endSummary.totalUniqueViewers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary text-sm">Messages</span>
                  <span className="font-medium text-sm">{endSummary.totalMessages}</span>
                </div>
              </div>

              <Button className="w-full" onClick={() => setShowEndSummary(false)}>
                Close
              </Button>
            </div>
          )}
        </Modal>
      </PageContainer>
    </div>
  );
}
