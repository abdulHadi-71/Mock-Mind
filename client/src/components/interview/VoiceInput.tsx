'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, RotateCcw } from 'lucide-react';
import { clsx } from 'clsx';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export function VoiceInput({ onTranscript, disabled }: VoiceInputProps) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SR =
      typeof window !== 'undefined'
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;
    if (!SR) {
      setSupported(false);
      return;
    }
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let text = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setTranscript(text);
    };

    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
    return () => recognition.abort();
  }, []);

  function startListening() {
    if (!recognitionRef.current || disabled) return;
    setTranscript('');
    setListening(true);
    recognitionRef.current.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
    if (transcript.trim()) onTranscript(transcript.trim());
  }

  function retry() {
    setTranscript('');
    startListening();
  }

  if (!supported) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={listening ? stopListening : startListening}
          disabled={disabled}
          className={clsx(
            'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
            listening
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
          )}
        >
          {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          {listening ? 'Stop Recording' : 'Push to Talk'}
        </button>
        {transcript && !listening && (
          <button
            type="button"
            onClick={retry}
            className="flex items-center gap-1 rounded-full px-3 py-2 text-xs text-slate-600 hover:bg-slate-100"
          >
            <RotateCcw className="h-3 w-3" />
            Retry
          </button>
        )}
      </div>
      {transcript && (
        <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <span className="text-xs font-medium text-slate-500">Live transcript: </span>
          {transcript}
          {listening && <span className="animate-pulse">|</span>}
        </p>
      )}
    </div>
  );
}
