"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

interface SpeechRecognitionWindow extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

interface UseSpeechRecognitionOptions {
  onTranscript: (transcript: string) => void;
}

export function useSpeechRecognition({ onTranscript }: UseSpeechRecognitionOptions) {
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const speechWindow = window as SpeechRecognitionWindow;
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;

    if (!Recognition) {
      return;
    }

    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => {
      setIsListening(false);
      toast.error(event.error === "not-allowed" ? "Microphone permission was blocked." : "Voice input could not start.");
    };
    recognition.onresult = (event) => {
      let finalTranscript = "";

      for (let index = 0; index < event.results.length; index += 1) {
        const result = event.results.item(index);
        if (result.isFinal && result.length > 0) {
          finalTranscript += result.item(0).transcript;
        }
      }

      if (finalTranscript.trim()) {
        onTranscript(finalTranscript.trim());
      }
    };

    recognitionRef.current = recognition;
    setIsSupported(true);

    return () => {
      recognition.onend = null;
      recognition.onerror = null;
      recognition.onresult = null;
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [onTranscript]);

  const toggleListening = useCallback(() => {
    const recognition = recognitionRef.current;

    if (!recognition) {
      toast.warning("Speech-to-text is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      return;
    }

    try {
      recognition.start();
      setIsListening(true);
    } catch {
      toast.warning("Voice input is already starting.");
    }
  }, [isListening]);

  return useMemo(
    () => ({
      isListening,
      isSupported,
      toggleListening,
    }),
    [isListening, isSupported, toggleListening],
  );
}
