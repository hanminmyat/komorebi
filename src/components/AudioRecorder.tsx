"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface AudioRecorderProps {
  capsuleId: string;
  currentMediaCount: number;
}

export default function AudioRecorder({
  capsuleId,
  currentMediaCount,
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
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    setError(null);
    setAudioBlob(null);
    setAudioUrl(null);
    setElapsed(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);

      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } catch {
      setError("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const uploadAudio = async () => {
    if (!audioBlob) return;

    setUploading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      const fileName = `${user.id}/${capsuleId}/${Date.now()}.webm`;

      const { error: uploadError } = await supabase.storage
        .from("audio")
        .upload(fileName, audioBlob);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("audio").getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from("media_items")
        .insert({
          capsule_id: capsuleId,
          type: "audio",
          url: publicUrl,
          order_index: currentMediaCount,
        });

      if (insertError) throw insertError;

      setAudioBlob(null);
      setAudioUrl(null);
      setElapsed(0);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="rounded-lg border p-4">
      <h3 className="mb-3 font-semibold">Record Audio</h3>

      {error && (
        <div className="mb-3 rounded-md bg-red-50 p-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex flex-col items-center gap-4">
        {recording ? (
          <>
            <div className="text-3xl font-mono text-red-600">
              {formatTime(elapsed)}
            </div>
            <button
              onClick={stopRecording}
              className="rounded-full bg-red-600 p-4 text-white hover:bg-red-700"
            >
              <svg
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <rect x="6" y="6" width="12" height="12" />
              </svg>
            </button>
            <p className="text-sm text-gray-600">Recording...</p>
          </>
        ) : audioUrl ? (
          <>
            <audio controls src={audioUrl} className="w-full" />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setAudioBlob(null);
                  setAudioUrl(null);
                  setElapsed(0);
                }}
                className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
              >
                Discard
              </button>
              <button
                onClick={uploadAudio}
                disabled={uploading}
                className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Save Recording"}
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={startRecording}
            className="rounded-full bg-black p-4 text-white hover:bg-gray-800"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
