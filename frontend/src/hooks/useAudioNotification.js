import { useCallback } from 'react';

/**
 * useAudioNotification
 *
 * Returns a `playBeep()` function that plays a subtle sine-wave beep
 * using the Web Audio API (no external audio files required).
 *
 * Silently no-ops in environments where AudioContext is unavailable.
 */
export function useAudioNotification() {
  const playBeep = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // AudioContext not supported — fail silently
    }
  }, []);

  return { playBeep };
}
