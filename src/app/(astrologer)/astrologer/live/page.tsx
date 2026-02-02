'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  Radio,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Users,
  MessageSquare,
  Gift,
  Clock,
  Play,
  StopCircle,
  Settings,
  IndianRupee,
} from 'lucide-react';

export default function AstrologerLivePage() {
  const [isLive, setIsLive] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionTopic, setSessionTopic] = useState('general');

  // Mock data
  const viewerCount = 127;
  const duration = '45:32';
  const totalGifts = 2450;

  const topics = [
    { value: 'general', label: 'General Discussion' },
    { value: 'love', label: 'Love & Relationships' },
    { value: 'career', label: 'Career & Finance' },
    { value: 'health', label: 'Health & Wellness' },
    { value: 'spiritual', label: 'Spiritual Guidance' },
  ];

  const handleStartLive = () => {
    if (!sessionTitle.trim()) return;
    setIsLive(true);
    setShowStartModal(false);
  };

  const handleEndLive = () => {
    setIsLive(false);
    setShowEndModal(false);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Go Live</h1>
          <p className="text-text-secondary text-sm">
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

      {isLive ? (
        <>
          {/* Live Preview */}
          <Card className="aspect-video bg-gray-900 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              {videoEnabled ? (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                  <span className="text-white text-lg">Camera Preview</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <VideoOff className="w-12 h-12 mb-2" />
                  <span>Camera Off</span>
                </div>
              )}
            </div>

            {/* Live Stats Overlay */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <Badge variant="error" className="bg-red-500">
                <Radio className="w-3 h-3 mr-1" />
                LIVE
              </Badge>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-black/50 text-white">
                  <Users className="w-3 h-3 mr-1" />
                  {viewerCount}
                </Badge>
                <Badge variant="secondary" className="bg-black/50 text-white">
                  <Clock className="w-3 h-3 mr-1" />
                  {duration}
                </Badge>
              </div>
            </div>

            {/* Controls Overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-4">
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  audioEnabled ? 'bg-white/20' : 'bg-red-500'
                }`}
              >
                {audioEnabled ? (
                  <Mic className="w-5 h-5 text-white" />
                ) : (
                  <MicOff className="w-5 h-5 text-white" />
                )}
              </button>
              <button
                onClick={() => setVideoEnabled(!videoEnabled)}
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  videoEnabled ? 'bg-white/20' : 'bg-red-500'
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
                className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center"
              >
                <StopCircle className="w-5 h-5 text-white" />
              </button>
            </div>
          </Card>

          {/* Live Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 text-center">
              <Users className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-text-primary">{viewerCount}</p>
              <p className="text-xs text-text-muted">Viewers</p>
            </Card>
            <Card className="p-4 text-center">
              <Clock className="w-6 h-6 text-status-warning mx-auto mb-2" />
              <p className="text-2xl font-bold text-text-primary">{duration}</p>
              <p className="text-xs text-text-muted">Duration</p>
            </Card>
            <Card className="p-4 text-center">
              <Gift className="w-6 h-6 text-status-success mx-auto mb-2" />
              <p className="text-2xl font-bold text-text-primary flex items-center justify-center">
                <IndianRupee className="w-4 h-4" />
                {totalGifts}
              </p>
              <p className="text-xs text-text-muted">Gifts</p>
            </Card>
          </div>

          {/* Live Chat */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-text-primary">Live Chat</h3>
            </div>
            <div className="h-48 bg-gray-50 rounded-lg p-3 overflow-y-auto space-y-2">
              {[
                { user: 'Rahul', message: 'Hello ji! 🙏' },
                { user: 'Priya', message: 'What about Aries this month?' },
                { user: 'Amit', message: 'Please talk about career prospects' },
                { user: 'Sneha', message: 'Amazing session! ❤️' },
              ].map((chat, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-primary font-medium text-sm">{chat.user}:</span>
                  <span className="text-text-secondary text-sm">{chat.message}</span>
                </div>
              ))}
            </div>
          </Card>
        </>
      ) : (
        <>
          {/* Start Live CTA */}
          <Card className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Radio className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">Start a Live Session</h2>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              Connect with your followers in real-time. Share insights, answer questions, and earn through gifts.
            </p>
            <Button size="lg" onClick={() => setShowStartModal(true)}>
              <Play className="w-5 h-5 mr-2" />
              Go Live Now
            </Button>
          </Card>

          {/* Tips */}
          <Card className="p-6">
            <h3 className="font-semibold text-text-primary mb-4">Tips for a Great Live Session</h3>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li className="flex items-start gap-2">
                <Video className="w-4 h-4 mt-0.5 text-primary" />
                Ensure good lighting and a quiet environment
              </li>
              <li className="flex items-start gap-2">
                <Mic className="w-4 h-4 mt-0.5 text-primary" />
                Test your audio before going live
              </li>
              <li className="flex items-start gap-2">
                <Users className="w-4 h-4 mt-0.5 text-primary" />
                Engage with viewers by answering their questions
              </li>
              <li className="flex items-start gap-2">
                <Settings className="w-4 h-4 mt-0.5 text-primary" />
                Use a stable internet connection for best quality
              </li>
            </ul>
          </Card>

          {/* Past Sessions */}
          <Card className="p-4">
            <h3 className="font-semibold text-text-primary mb-4">Recent Live Sessions</h3>
            <div className="space-y-3">
              {[
                { title: 'Weekly Horoscope Discussion', viewers: 234, duration: '1:15:42', earnings: 3200 },
                { title: 'Career Guidance Q&A', viewers: 156, duration: '45:30', earnings: 1850 },
                { title: 'Love & Relationships', viewers: 189, duration: '58:15', earnings: 2100 },
              ].map((session, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Video className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary truncate">{session.title}</p>
                    <p className="text-xs text-text-muted">
                      {session.viewers} viewers • {session.duration}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-status-success flex items-center">
                      <IndianRupee className="w-3 h-3" />
                      {session.earnings}
                    </p>
                    <p className="text-xs text-text-muted">Earned</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
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

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Topic
            </label>
            <div className="flex flex-wrap gap-2">
              {topics.map((topic) => (
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
            <Button variant="outline" className="flex-1" onClick={() => setShowStartModal(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleStartLive} disabled={!sessionTitle.trim()}>
              <Play className="w-4 h-4 mr-2" />
              Start Live
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

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-text-secondary">Duration</span>
              <span className="font-medium">{duration}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-text-secondary">Peak Viewers</span>
              <span className="font-medium">{viewerCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Total Gifts</span>
              <span className="font-medium text-status-success flex items-center">
                <IndianRupee className="w-3 h-3" />
                {totalGifts}
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setShowEndModal(false)}>
              Continue Live
            </Button>
            <Button variant="primary" className="flex-1 bg-status-error hover:bg-status-error/90" onClick={handleEndLive}>
              <StopCircle className="w-4 h-4 mr-2" />
              End Session
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
