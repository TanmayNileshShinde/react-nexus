/**
 * Retro Web Audio Synthesizer Engine for React Nexus
 * Zero-dependency procedural 8-bit chiptune sound effects using Web Audio API
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = typeof window !== 'undefined' ? localStorage.getItem('react-nexus-muted') === 'true' : false;
    this.volume = typeof window !== 'undefined' ? parseFloat(localStorage.getItem('react-nexus-volume') || '0.35') : 0.35;
    this.listeners = new Set();
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach((fn) => fn({ muted: this.muted, volume: this.volume }));
  }

  setMuted(isMuted) {
    this.muted = isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('react-nexus-muted', String(isMuted));
    }
    this.notify();
  }

  toggleMute() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (typeof window !== 'undefined') {
      localStorage.setItem('react-nexus-volume', String(this.volume));
    }
    if (this.volume > 0 && this.muted) {
      this.setMuted(false);
    }
    this.notify();
  }

  /**
   * Core procedural oscillator node with ADSR-like envelope
   */
  tone(frequency, type = 'square', duration = 0.1, startFreq = null, endFreq = null, gainMult = 0.4) {
    if (this.muted || this.volume <= 0) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      const initialFreq = startFreq || frequency;
      osc.frequency.setValueAtTime(initialFreq, now);

      if (endFreq && endFreq !== initialFreq) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), now + duration);
      }

      // Gain envelope
      const maxGain = this.volume * gainMult;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(maxGain, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.05);
    } catch (_err) {
      // Audio context might be restricted before interaction
    }
  }

  /**
   * Procedural white-noise synthesizer with lowpass filter
   * Used for retro explosions, crashes, and collision hits.
   */
  playNoise(duration = 0.15, maxGain = 0.25) {
    if (this.muted || this.volume <= 0) return;
    try {
      this.init();
      if (!this.ctx) return;

      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + duration);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(this.volume * maxGain, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start();
    } catch (_err) {
      // Audio context might be restricted
    }
  }

  // --- Sound Effects Palette ---

  /** Soft UI click / tap */
  playClick() {
    this.tone(600, 'triangle', 0.04, 800, 400);
  }

  /** Move cursor, change direction, place tile */
  playMove() {
    this.tone(340, 'square', 0.06, 280, 420);
  }

  /** Retro Laser / Ray sound */
  playLaser() {
    this.tone(880, 'sawtooth', 0.12, 900, 120);
  }

  /** Power up ascending chime */
  playPowerUp() {
    if (this.muted || this.volume <= 0) return;
    const notes = [330, 392, 494, 659];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.tone(freq, 'square', 0.08), idx * 60);
    });
  }

  /** Eat food, score points, collect item */
  playScore() {
    if (this.muted || this.volume <= 0) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [
        { f: 523.25, t: 0 },
        { f: 659.25, t: 0.08 },
        { f: 783.99, t: 0.16 },
      ].forEach(({ f, t }) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + t);
        gain.gain.setValueAtTime(this.volume * 0.35, now + t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + t);
        osc.stop(now + t + 0.13);
      });
    } catch (_err) {
      // Audio unlock error ignored
    }
  }

  /** Tile merge / combo effect */
  playMerge() {
    this.tone(440, 'sine', 0.14, 300, 680);
  }

  /** Reaction test traffic light tick */
  playTick() {
    this.tone(880, 'sine', 0.05);
  }

  /** Reaction test green light "GO!" signal */
  playGo() {
    this.tone(1320, 'triangle', 0.22, 1000, 1600);
  }

  /** Foul buzzer / invalid move */
  playFoul() {
    this.tone(140, 'sawtooth', 0.28, 160, 110);
  }

  /** Classic 8-bit collision / crash effect */
  playCollision() {
    this.playNoise(0.2, 0.3);
  }

  /** Classic game over sweep */
  playGameOver() {
    if (this.muted || this.volume <= 0) return;
    this.playNoise(0.18, 0.25);
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [
        { f: 440, t: 0 },
        { f: 392, t: 0.12 },
        { f: 349.23, t: 0.24 },
        { f: 261.63, t: 0.38 },
      ].forEach(({ f, t }) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now + t);
        gain.gain.setValueAtTime(this.volume * 0.3, now + t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + t);
        osc.stop(now + t + 0.19);
      });
    } catch (_err) {
      // Audio unlock error ignored
    }
  }

  /** Grand victory fanfare */
  playVictory() {
    if (this.muted || this.volume <= 0) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [
        { f: 523.25, t: 0 },
        { f: 659.25, t: 0.1 },
        { f: 783.99, t: 0.2 },
        { f: 1046.5, t: 0.32, d: 0.35 },
      ].forEach(({ f, t, d = 0.15 }) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + t);
        gain.gain.setValueAtTime(this.volume * 0.4, now + t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + d);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + t);
        osc.stop(now + t + d + 0.05);
      });
    } catch (_err) {
      // Audio unlock error ignored
    }
  }
}

export const sound = new SoundEngine();
export default sound;
