"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { validateAudioBlob } from "@/lib/validate-file";

const MAX_AUDIO = 1;
const MIN_SECONDS = 30; // 30 seconds
const MAX_SECONDS = 180; // 3 minutes

interface AudioRecorderProps {
  capsuleId: string;
  audioCount: number;
}

export default function AudioRecorder({
  capsuleId,
  audioCount,
}: AudioRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Auto-stop when max time reached
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Watch elapsed time for auto-stop
  useEffect(() => {
    if (recording && elapsed >= MAX_SECONDS) {
      stopRecording();
    }
  }, [elapsed, recording, stopRecording]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Revoke object URL on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    setError(null);
    setAudioBlob(null);
    setAudioUrl(null);
    setElapsed(0);

    try {
      // Request audio with reasonable quality
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;

      // Prefer mp3/webm with decent bitrate for voice
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4";

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 96000, // 96kbps is good for voice, keeps files reasonable
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const mime = mediaRecorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mime });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start(1000); // 1-second timeslices
      setRecording(true);

      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } catch {
      setError("Microphone access denied. Please allow microphone permissions.");
    }
  };

  const handleUpload = async () => {
    if (!audioBlob) return;
    setUploading(true);
    setError(null);

    try {
      // Validate audio blob
      const validation = await validateAudioBlob(audioBlob);
      if (!validation.valid) {
        setError(validation.error || "Invalid audio file.");
        setUploading(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const ext = audioBlob.type.includes("mp4") ? "m4a" : "webm";
      const fileName = `${user.id}/${capsuleId}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("audio")
        .upload(fileName, audioBlob, {
          contentType: audioBlob.type || "audio/webm",
        });
      if (uploadError) throw uploadError;

      // Store the storage path (not a URL) — signed URLs are generated at display time
      const { error: insertError } = await supabase
        .from("media_items")
        .insert({
          capsule_id: capsuleId,
          type: "audio",
          url: fileName,
          order_index: audioCount,
        });
      if (insertError) throw insertError;

      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioBlob(null);
      setAudioUrl(null);
      setElapsed(0);
      router.refresh();
    } catch (err) {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDiscard = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setElapsed(0);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Already has an audio recording
  if (audioCount >= MAX_AUDIO) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-center">
        <div className="mb-2 flex justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" x2="12" y1="19" y2="22" />
          </svg>
        </div>
        <p className="text-sm text-muted">Recording already saved</p>
        <p className="mt-1 text-xs text-muted">Delete the existing recording to add a new one</p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-3 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {recording ? (
        <div className="rounded-xl border-2 border-red-300 bg-red-50/50 p-4 text-center sm:p-6">
          <div className="mb-2 flex justify-center sm:mb-3">
            <div className="h-3 w-3 animate-pulse rounded-full bg-red-600" />
          </div>
          <div className={`mb-2 font-mono font-medium text-2xl sm:mb-3 sm:text-3xl ${
            elapsed >= MAX_SECONDS - 10 ? "text-red-600 animate-pulse" : "text-red-600"
          }`}>
            {formatTime(elapsed)}
            <span className="ml-1 text-xs text-muted sm:text-sm">/ {formatTime(MAX_SECONDS)}</span>
          </div>
          {elapsed < MIN_SECONDS && (
            <p className="mb-2 text-xs text-muted sm:mb-3">
              Minimum {formatTime(MIN_SECONDS)} required
            </p>
          )}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={stopRecording}
              className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-red-200 transition-all hover:bg-red-700 sm:px-6 sm:py-3"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="1" />
              </svg>
              {elapsed < MIN_SECONDS ? "Cancel" : "Stop Recording"}
            </button>
          </div>
        </div>
      ) : audioUrl ? (
        <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/20 text-primary sm:h-10 sm:w-10">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-[18px] sm:h-[18px]">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">Preview</p>
              <p className="text-xs text-muted">
                {formatTime(elapsed)}
                {elapsed < MIN_SECONDS && (
                  <span className="ml-2 text-red-500">Too short (min {formatTime(MIN_SECONDS)})</span>
                )}
              </p>
            </div>
          </div>
          <audio controls src={audioUrl} className="mb-3 w-full" />
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={handleDiscard}
              className="flex-1 rounded-lg border border-border px-3 py-2.5 text-xs font-medium text-muted transition-colors hover:bg-surface hover:text-foreground sm:px-4 sm:text-sm"
            >
              Discard
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading || elapsed < MIN_SECONDS}
              className="flex-1 rounded-lg bg-primary px-3 py-2.5 text-xs font-medium text-white shadow-md shadow-primary/20 transition-all hover:bg-primary-hover disabled:opacity-50 sm:px-4 sm:text-sm"
            >
              {uploading ? "Saving..." : "Save to Album"}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={startRecording}
          className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border p-4 text-center transition-all hover:border-primary/40 hover:bg-surface sm:p-6"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary sm:h-12 sm:w-12">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-[22px] sm:h-[22px]">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">Record a voice memory</p>
            <p className="text-xs text-muted">
              1–3 min · 96kbps · 1 per capsule
            </p>
          </div>
        </button>
      )}
    </div>
  );
}
