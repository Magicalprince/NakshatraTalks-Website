'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, IndianRupee, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { chatService } from '@/lib/services/chat.service';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAuthStore } from '@/stores/auth-store';
import { ChatMessage, ChatSession } from '@/types/api.types';

interface SessionData {
  session: ChatSession;
  astrologer: { id: string; name: string; image: string; isOnline: boolean };
}

export default function ChatHistoryViewPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const { isReady } = useRequireAuth();
  const user = useAuthStore((state) => state.user);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sessionResp, messagesResp] = await Promise.all([
        chatService.getSession(sessionId),
        chatService.getMessages({ sessionId, limit: 200 }),
      ]);

      if (sessionResp.data) {
        setSessionData(sessionResp.data);
      }

      if (messagesResp.data?.messages) {
        setMessages(messagesResp.data.messages);
      } else if (Array.isArray(messagesResp.data)) {
        // Handle case where data is directly an array
        setMessages(messagesResp.data as unknown as ChatMessage[]);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
      setError('Failed to load chat history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isReady && sessionId) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, sessionId]);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const formatMessageTime = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatSessionDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const isCurrentUser = (msg: ChatMessage): boolean => {
    if (user?.id && msg.senderId === user.id) return true;
    return msg.senderType === 'user';
  };

  // --- Loading State ---
  if (!isReady || loading) {
    return (
      <div className="min-h-screen bg-background-offWhite">
        {/* Header skeleton */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
            <div className="flex-1">
              <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-24 h-3 bg-gray-200 rounded animate-pulse mt-1" />
            </div>
          </div>
        </div>
        {/* Messages skeleton */}
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`rounded-2xl px-4 py-3 animate-pulse ${
                  i % 2 === 0
                    ? 'bg-gray-200 rounded-tl-sm w-3/5'
                    : 'bg-blue-100 rounded-tr-sm w-2/5'
                }`}
              >
                <div className="h-4 bg-gray-300/50 rounded w-full" />
                {i % 3 === 0 && (
                  <div className="h-4 bg-gray-300/50 rounded w-2/3 mt-1" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="min-h-screen bg-background-offWhite flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">!</span>
          </div>
          <h2 className="text-lg font-semibold text-text-primary mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-text-secondary mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => router.push('/history/chat')}>
              Go Back
            </Button>
            <Button variant="primary" onClick={fetchData}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const session = sessionData?.session;
  const astrologer = sessionData?.astrologer;

  return (
    <div className="min-h-screen bg-background-offWhite flex flex-col">
      {/* --- Header --- */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/history/chat')}
            className="p-1.5 -ml-1.5"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          {/* Astrologer avatar */}
          {astrologer?.image ? (
            <img
              src={astrologer.image}
              alt={astrologer.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
              <span className="text-primary font-semibold text-sm">
                {astrologer?.name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-text-primary truncate">
              {astrologer?.name || 'Astrologer'}
            </h1>
            {session?.startTime && (
              <p className="text-xs text-text-secondary">
                {formatSessionDate(session.startTime)}
              </p>
            )}
          </div>

          {session?.status && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                session.status === 'completed'
                  ? 'bg-green-100 text-green-700'
                  : session.status === 'cancelled'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
            </span>
          )}
        </div>
      </div>

      {/* --- Messages --- */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-text-secondary">No messages in this session.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const fromUser = isCurrentUser(msg);
              const messageText = msg.message || msg.content || '';
              const isImage = msg.type === 'image';

              return (
                <div
                  key={msg.id}
                  className={`flex ${fromUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                      fromUser
                        ? 'bg-blue-500 text-white rounded-tr-sm'
                        : 'bg-gray-100 text-text-primary rounded-tl-sm'
                    }`}
                  >
                    {isImage ? (
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 opacity-70" />
                        <span className="text-sm italic opacity-80">Image</span>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {messageText}
                      </p>
                    )}
                    <p
                      className={`text-[10px] mt-1 ${
                        fromUser ? 'text-blue-100' : 'text-text-secondary'
                      }`}
                    >
                      {formatMessageTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* --- Session Summary Footer --- */}
      {session && (session.duration != null || session.totalCost != null) && (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3">
          <div className="max-w-3xl mx-auto flex items-center justify-center gap-6 text-sm text-text-secondary">
            {session.duration != null && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>Duration: {formatDuration(session.duration)}</span>
              </div>
            )}
            {session.totalCost != null && (
              <div className="flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4" />
                <span>Total: {session.totalCost.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
