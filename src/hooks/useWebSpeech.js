/**
 * useWebSpeech.js
 * Browser native speech synthesis voice coach with auto-resume, voice selection, and deduplication.
 */

import { useRef, useCallback, useEffect } from 'react';

export function useWebSpeech(enabled = true) {
  const lastSpokenTextRef = useRef('');
  const lastSpokenTimeRef = useRef(0);
  const voicesRef = useRef([]);

  // Load available voices
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const loadVoices = () => {
      try {
        const avail = window.speechSynthesis.getVoices();
        if (avail && avail.length > 0) {
          voicesRef.current = avail;
        }
      } catch (e) {
        console.warn('Failed to load speech voices:', e);
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Unlock audio context & speech synthesis on user gesture
    const unlockSpeech = () => {
      if (window.speechSynthesis) {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }
    };

    window.addEventListener('click', unlockSpeech, { passive: true });
    window.addEventListener('touchstart', unlockSpeech, { passive: true });

    return () => {
      window.removeEventListener('click', unlockSpeech);
      window.removeEventListener('touchstart', unlockSpeech);
    };
  }, []);

  const speak = useCallback(
    (text, force = false) => {
      if (!enabled || typeof window === 'undefined' || !window.speechSynthesis) return;

      const now = Date.now();
      // Avoid identical repetition within 1.8 seconds unless forced
      if (!force && text === lastSpokenTextRef.current && now - lastSpokenTimeRef.current < 1800) {
        return;
      }

      // Avoid rapid chatter within 700ms
      if (!force && now - lastSpokenTimeRef.current < 700) {
        return;
      }

      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        const doSpeak = () => {
          try {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 1.05; // Energetic coaching tempo
            utterance.pitch = 1.0;
            utterance.volume = 1.0;

            // Only set voice if it's explicitly a local service voice to prevent network synthesis-failed errors
            const voices = voicesRef.current.length > 0 ? voicesRef.current : window.speechSynthesis.getVoices();
            const localVoice = voices.find(
              (v) => (v.lang.startsWith('en') || v.lang.startsWith('en-US')) && v.localService === true
            );
            if (localVoice) {
              utterance.voice = localVoice;
            }

            // Error recovery fallback: if custom voice fails, retry with clean default utterance
            utterance.onerror = (event) => {
              console.warn('SpeechSynthesisUtterance error event:', event.error);
              try {
                const plainUtterance = new SpeechSynthesisUtterance(text);
                plainUtterance.lang = 'en-US';
                plainUtterance.volume = 1.0;
                window.speechSynthesis.speak(plainUtterance);
              } catch (retryErr) {
                console.warn('Plain utterance retry failed:', retryErr);
              }
            };

            lastSpokenTextRef.current = text;
            lastSpokenTimeRef.current = Date.now();

            window.speechSynthesis.speak(utterance);
          } catch (e) {
            console.warn('Utterance speak failed:', e);
          }
        };

        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
          window.speechSynthesis.cancel();
          setTimeout(doSpeak, 40);
        } else {
          doSpeak();
        }
      } catch (err) {
        console.warn('Speech synthesis exception:', err);
      }
    },
    [enabled]
  );

  return { speak };
}


