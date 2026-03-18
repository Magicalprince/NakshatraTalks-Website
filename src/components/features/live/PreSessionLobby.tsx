import { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, CameraOff, Mic, MicOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PreSessionLobbyProps {
  sessionTitle?: string;
  onGoLive: (stream: MediaStream) => void;
  onCancel: () => void;
}

type PermissionState = 'pending' | 'granted' | 'denied';

export default function PreSessionLobby({
  sessionTitle = '',
  onGoLive,
  onCancel,
}: PreSessionLobbyProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [title, setTitle] = useState(sessionTitle);
  const [permissionState, setPermissionState] = useState<PermissionState>('pending');
  const [errorMessage, setErrorMessage] = useState('');

  const startMedia = useCallback(async (facing: 'user' | 'environment' = 'user') => {
    try {
      setPermissionState('pending');
      setErrorMessage('');

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing },
        audio: true,
      });

      setStream(mediaStream);
      setPermissionState('granted');

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: unknown) {
      setPermissionState('denied');
      const message =
        err instanceof DOMException && err.name === 'NotAllowedError'
          ? 'Camera and microphone permissions are required to go live. Please allow access in your browser settings.'
          : 'Could not access camera or microphone. Please check your device and try again.';
      setErrorMessage(message);
    }
  }, []);

  // Start media on mount
  useEffect(() => {
    startMedia(facingMode);

    return () => {
      // Cleanup: stop all tracks on unmount
      setStream((prev) => {
        if (prev) {
          prev.getTracks().forEach((track) => track.stop());
        }
        return null;
      });
    };
    // Only run on mount/unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep video element in sync with stream
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const toggleCamera = useCallback(() => {
    if (!stream) return;
    const videoTracks = stream.getVideoTracks();
    videoTracks.forEach((track) => {
      track.enabled = !track.enabled;
    });
    setIsCameraOn((prev) => !prev);
  }, [stream]);

  const toggleMic = useCallback(() => {
    if (!stream) return;
    const audioTracks = stream.getAudioTracks();
    audioTracks.forEach((track) => {
      track.enabled = !track.enabled;
    });
    setIsMicOn((prev) => !prev);
  }, [stream]);

  const flipCamera = useCallback(async () => {
    // Stop current stream
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    const newFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacing);
    await startMedia(newFacing);
  }, [stream, facingMode, startMedia]);

  const handleGoLive = () => {
    if (stream) {
      onGoLive(stream);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background-dark px-4 py-8">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <h1 className="text-center text-2xl font-semibold text-white font-lexend">
          Preview
        </h1>

        {/* Video Preview */}
        <div className="relative mx-auto aspect-video w-full overflow-hidden rounded-2xl bg-black/50">
          {permissionState === 'granted' && isCameraOn ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />
          ) : permissionState === 'granted' && !isCameraOn ? (
            <div className="flex h-full w-full items-center justify-center">
              <CameraOff className="h-16 w-16 text-white/40" />
              <p className="absolute bottom-4 text-sm text-white/60">Camera is off</p>
            </div>
          ) : permissionState === 'pending' ? (
            <div className="flex h-full w-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            </div>
          ) : null}

          {/* Permission denied overlay */}
          {permissionState === 'denied' && (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-6 text-center">
              <CameraOff className="h-12 w-12 text-red-400" />
              <p className="text-sm text-white/80">{errorMessage}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => startMedia(facingMode)}
                className="border-white/30 text-white hover:bg-white/10 hover:text-white"
              >
                Retry
              </Button>
            </div>
          )}

          {/* Hidden video element for when camera is off (keeps stream alive) */}
          {permissionState === 'granted' && !isCameraOn && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="hidden"
            />
          )}
        </div>

        {/* Media Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={toggleCamera}
            disabled={permissionState !== 'granted'}
            className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
              isCameraOn
                ? 'bg-white/10 text-white hover:bg-white/20'
                : 'bg-red-500/80 text-white hover:bg-red-500'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            aria-label={isCameraOn ? 'Turn camera off' : 'Turn camera on'}
          >
            {isCameraOn ? <Camera className="h-5 w-5" /> : <CameraOff className="h-5 w-5" />}
          </button>

          <button
            type="button"
            onClick={toggleMic}
            disabled={permissionState !== 'granted'}
            className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
              isMicOn
                ? 'bg-white/10 text-white hover:bg-white/20'
                : 'bg-red-500/80 text-white hover:bg-red-500'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            aria-label={isMicOn ? 'Turn microphone off' : 'Turn microphone on'}
          >
            {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </button>

          <button
            type="button"
            onClick={flipCamera}
            disabled={permissionState !== 'granted'}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Flip camera"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>

        {/* Session Title */}
        <div className="space-y-2">
          <label htmlFor="session-title" className="block text-sm font-medium text-white/70">
            Session Title
          </label>
          <input
            id="session-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter session title..."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="ghost"
            size="lg"
            onClick={onCancel}
            className="flex-1 text-white/70 hover:bg-white/10 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={handleGoLive}
            disabled={permissionState !== 'granted' || !stream}
            className="flex-1"
          >
            Go Live
          </Button>
        </div>
      </div>
    </div>
  );
}
