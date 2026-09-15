/**
 * useWebSpeech.js
 * Browser native speech synthesis voice coach with rate-limiting and deduplication.
 */

import { useRef, useCallback } from 'react';

export function useWebSpeech(enabled = true) {
  const lastSpokenTextRef = useRef('');
  const lastSpokenTimeRef = useRef(0);

  const speak = useCallback(
    (text, force = false) => {
      if (!enabled || !window.speechSynthesis) return;

      const now = Date.now();
      // Avoid repetition within 2.5 seconds unless forced (e.g. rep increment)
      if (!force && text === lastSpokenTextRef.current && now - lastSpokenTimeRef.current < 2500) {
        return;
      }

      // Avoid interrupting too rapidly
      if (!force && now - lastSpokenTimeRef.current < 1200) {
        return;
      }

      try {
        window.speechSynthesis.cancel(); // cancel previous unfinished queue
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.1; // energetic coaching tempo
        utterance.pitch = 1.0;
        utterance.volume = 0.85;

        lastSpokenTextRef.current = text;
        lastSpokenTimeRef.current = now;

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('Speech synthesis error:', err);
      }
    },
    [enabled]
  );

  return { speak };
}
