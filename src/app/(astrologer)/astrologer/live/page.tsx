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
  IndianRupee,
  History,
  Lightbulb,
  Info,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PageContainer } from '@/components/layout/PageContainer';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { SectionHeader, EmptyState, StatCard } from '@/components/shared';

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

        {isLive ? (
          /* 2-column layout when live */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Video + Controls */}
            <div className="lg:col-span-2 space-y-6">
              {/* Live Preview */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="aspect-video bg-gray-900 relative overflow-hidden shadow-web-md" padding="none">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {videoEnabled ? (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                        <span className="text-white text-lg font-lexend">Camera Preview</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-gray-400">
                        <VideoOff className="w-12 h-12 mb-2" />
                        <span className="font-lexend">Camera Off</span>
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
                      <Badge variant="secondary" className="bg-black/50 text-white border-0">
                        <Users className="w-3 h-3 mr-1" />
                        {viewerCount}
                      </Badge>
                      <Badge variant="secondary" className="bg-black/50 text-white border-0">
                        <Clock className="w-3 h-3 mr-1" />
                        {duration}
                      </Badge>
                    </div>
                  </div>

                  {/* Controls Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-4">
                    <button
                      onClick={() => setAudioEnabled(!audioEnabled)}
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
                      onClick={() => setVideoEnabled(!videoEnabled)}
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
                <Card className="p-4 shadow-web-sm">
                  <div className="h-48 bg-background-offWhite rounded-lg p-3 overflow-y-auto space-y-2">
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
              </motion.div>
            </div>

            {/* Sidebar - Live Stats */}
            <div className="lg:col-span-1 space-y-4">
              {[
                { icon: Users, value: viewerCount, label: 'Viewers', color: 'text-primary', bg: 'bg-primary/10' },
                { icon: Clock, value: duration, label: 'Duration', color: 'text-status-warning', bg: 'bg-status-warning/10' },
                { icon: Gift, value: `₹${totalGifts}`, label: 'Gifts', color: 'text-status-success', bg: 'bg-status-success/10' },
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
                  description="Connect with your followers in real-time. Share insights, answer questions, and earn through gifts."
                  action={
                    <Button size="lg" onClick={() => setShowStartModal(true)}>
                      <Play className="w-5 h-5 mr-2" />
                      Go Live Now
                    </Button>
                  }
                />
              </motion.div>

              {/* Past Sessions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <SectionHeader icon={History} title="Recent Live Sessions" />
                <div className="space-y-3">
                  {[
                    { title: 'Weekly Horoscope Discussion', viewers: 234, duration: '1:15:42', earnings: 3200 },
                    { title: 'Career Guidance Q&A', viewers: 156, duration: '45:30', earnings: 1850 },
                    { title: 'Love & Relationships', viewers: 189, duration: '58:15', earnings: 2100 },
                  ].map((session, i) => (
                    <motion.div
                      key={i}
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
                              {session.viewers} viewers &middot; {session.duration}
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
                      </Card>
                    </motion.div>
                  ))}
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

            <div className="bg-background-offWhite p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-text-secondary text-sm">Duration</span>
                <span className="font-medium text-sm">{duration}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-text-secondary text-sm">Peak Viewers</span>
                <span className="font-medium text-sm">{viewerCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary text-sm">Total Gifts</span>
                <span className="font-medium text-status-success text-sm flex items-center">
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
      </PageContainer>
    </div>
  );
}
