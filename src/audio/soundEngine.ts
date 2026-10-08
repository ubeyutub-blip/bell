/**
 * Sound Engine for Automatic School Bell
 * Supports:
 * - Westminster Chimes (1, 2, 3, 4 chimes) via Web Audio API
 * - Classic Electric School Bell (Kring gong)
 * - Modern Electronic Chimes
 * - Beep Tone
 * - Indonesian / English TTS Speech Announcements
 * - Custom MP3/WAV Audio playback
 * - Real-time Frequency Analyser for Visualizer
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private currentSourceNode: MediaElementAudioSourceNode | null = null;
  private isPlaying: boolean = false;
  private currentSoundName: string = '';
  private onStateChangeCallbacks: Set<(playing: boolean, title: string) => void> = new Set();
  private abortController: AbortController | null = null;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  public init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public setMasterVolume(volume: number) {
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx?.currentTime || 0);
    }
    if (this.currentAudioElement) {
      this.currentAudioElement.volume = Math.max(0, Math.min(1, volume));
    }
  }

  public subscribe(cb: (playing: boolean, title: string) => void) {
    this.onStateChangeCallbacks.add(cb);
    return () => this.onStateChangeCallbacks.delete(cb);
  }

  private notify(playing: boolean, title: string) {
    this.isPlaying = playing;
    this.currentSoundName = title;
    this.onStateChangeCallbacks.forEach((cb) => cb(playing, title));
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentSoundName(): string {
    return this.currentSoundName;
  }

  public stopAll() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement.currentTime = 0;
      this.currentAudioElement = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.notify(false, '');
  }

  /**
   * Play a single bell chime note (Westminster tubular bell frequency)
   */
  private playBellNote(freq: number, startTime: number, duration: number = 1.4, volume: number = 0.8) {
    if (!this.ctx || !this.masterGain) return;

    // Bell overtones: fundamental + striking overtone harmonics
    const harmonics = [
      { ratio: 1.0, gain: 0.7, decay: duration },
      { ratio: 2.0, gain: 0.4, decay: duration * 0.7 },
      { ratio: 3.0, gain: 0.25, decay: duration * 0.5 },
      { ratio: 4.18, gain: 0.18, decay: duration * 0.35 },
      { ratio: 5.43, gain: 0.12, decay: duration * 0.25 }
    ];

    harmonics.forEach((h) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * h.ratio, startTime);

      // Strike envelope: instant attack then exponential decay
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(volume * h.gain, startTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + h.decay);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + h.decay + 0.05);
    });
  }

  /**
   * Play Westminster chime sequence
   * Quarter notes: G#4 (415.3), F#4 (370.0), E4 (329.6), B3 (246.9)
   */
  public async playWestminsterChime(quarters: number = 3, volume: number = 0.8, signal?: AbortSignal): Promise<void> {
    this.init();
    if (!this.ctx) return;

    const notes = {
      GS4: 415.3,
      FS4: 369.99,
      E4: 329.63,
      B3: 246.94
    };

    // Sequences for quarters
    const q1 = [notes.GS4, notes.FS4, notes.E4, notes.B3];
    const q2 = [notes.E4, notes.GS4, notes.FS4, notes.B3, notes.E4, notes.FS4, notes.GS4, notes.E4];
    const q3 = [
      notes.GS4, notes.E4, notes.FS4, notes.B3,
      notes.B3, notes.FS4, notes.GS4, notes.E4,
      notes.GS4, notes.FS4, notes.E4, notes.B3
    ];
    const q4 = [
      notes.GS4, notes.FS4, notes.E4, notes.B3,
      notes.E4, notes.GS4, notes.FS4, notes.B3,
      notes.B3, notes.FS4, notes.GS4, notes.E4,
      notes.E4, notes.FS4, notes.GS4, notes.E4
    ];

    let melody: number[] = q3;
    if (quarters === 1) melody = q1;
    else if (quarters === 2) melody = q2;
    else if (quarters === 3) melody = q3;
    else if (quarters >= 4) melody = q4;

    const noteDuration = 0.55;
    const totalDuration = melody.length * noteDuration + 1.2;

    const startAt = this.ctx.currentTime + 0.05;
    melody.forEach((freq, idx) => {
      this.playBellNote(freq, startAt + idx * noteDuration, 1.3, volume);
    });

    await new Promise<void>((resolve) => {
      const timeout = setTimeout(() => resolve(), totalDuration * 1000);
      if (signal) {
        signal.addEventListener('abort', () => {
          clearTimeout(timeout);
          resolve();
        });
      }
    });
  }

  /**
   * Play Beep indicator (e.g. 2 short clear pings)
   */
  public async playBeep(volume: number = 0.7, signal?: AbortSignal): Promise<void> {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const pings = [0, 0.15];
    pings.forEach((t) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1046.5, now + t); // C6 ping

      gain.gain.setValueAtTime(0, now + t);
      gain.gain.linearRampToValueAtTime(volume, now + t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.1);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + t);
      osc.stop(now + t + 0.12);
    });

    await new Promise<void>((resolve) => {
      const timeout = setTimeout(() => resolve(), 350);
      if (signal) {
        signal.addEventListener('abort', () => {
          clearTimeout(timeout);
          resolve();
        });
      }
    });
  }

  /**
   * Play Traditional Electric Ringing Gong Bell
   */
  public async playElectricBell(durationSeconds: number = 2.5, volume: number = 0.8, signal?: AbortSignal): Promise<void> {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    // Clapper modulation
    const modOsc = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();
    modOsc.frequency.setValueAtTime(26, now); // 26 clapper hits per second
    modGain.gain.setValueAtTime(0.5, now);

    const carrierOsc1 = this.ctx.createOscillator();
    const carrierOsc2 = this.ctx.createOscillator();
    carrierOsc1.type = 'sawtooth';
    carrierOsc1.frequency.setValueAtTime(587.33, now); // D5
    carrierOsc2.type = 'square';
    carrierOsc2.frequency.setValueAtTime(1174.66, now); // D6

    const masterBellGain = this.ctx.createGain();
    masterBellGain.gain.setValueAtTime(0, now);
    masterBellGain.gain.linearRampToValueAtTime(volume * 0.7, now + 0.05);
    masterBellGain.gain.setValueAtTime(volume * 0.7, now + durationSeconds - 0.1);
    masterBellGain.gain.exponentialRampToValueAtTime(0.001, now + durationSeconds + 0.8);

    modOsc.connect(modGain);
    modGain.connect(masterBellGain.gain);

    carrierOsc1.connect(masterBellGain);
    carrierOsc2.connect(masterBellGain);
    masterBellGain.connect(this.masterGain);

    modOsc.start(now);
    carrierOsc1.start(now);
    carrierOsc2.start(now);

    const stopTime = now + durationSeconds + 0.9;
    modOsc.stop(stopTime);
    carrierOsc1.stop(stopTime);
    carrierOsc2.stop(stopTime);

    await new Promise<void>((resolve) => {
      const timeout = setTimeout(() => resolve(), (durationSeconds + 1) * 1000);
      if (signal) {
        signal.addEventListener('abort', () => {
          clearTimeout(timeout);
          try {
            modOsc.stop();
            carrierOsc1.stop();
            carrierOsc2.stop();
          } catch {
            // ignore
          }
          resolve();
        });
      }
    });
  }

  /**
   * Speak announcement using Web Speech Synthesis API
   */
  public async speakText(
    text: string,
    options: { lang?: string; rate?: number; pitch?: number; volume?: number } = {},
    signal?: AbortSignal
  ): Promise<void> {
    if (!('speechSynthesis' in window)) return;
    if (signal?.aborted) return;

    return new Promise((resolve) => {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options.lang || 'id-ID';
      utterance.rate = options.rate || 1.0;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume !== undefined ? options.volume : 1.0;

      // Select Indonesian voice if available
      const voices = window.speechSynthesis.getVoices();
      const idVoice = voices.find((v) => v.lang.startsWith('id') || v.lang.includes('ID') || v.name.toLowerCase().includes('indonesia'));
      if (idVoice) {
        utterance.voice = idVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      if (signal) {
        signal.addEventListener('abort', () => {
          window.speechSynthesis.cancel();
          resolve();
        });
      }

      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Play Custom uploaded sound or Data URL audio
   */
  public async playAudioUrl(url: string, volume: number = 1.0, signal?: AbortSignal): Promise<void> {
    this.init();
    if (signal?.aborted) return;

    return new Promise((resolve, reject) => {
      const audio = new Audio();
      this.currentAudioElement = audio;
      audio.src = url;
      audio.volume = volume;

      if (this.ctx && this.analyser) {
        try {
          // Connect to analyzer for waveform rendering
          const source = this.ctx.createMediaElementSource(audio);
          this.currentSourceNode = source;
          source.connect(this.analyser);
        } catch {
          // May already be connected or CORS restricted
        }
      }

      audio.onended = () => {
        this.currentAudioElement = null;
        resolve();
      };
      audio.onerror = (e) => {
        this.currentAudioElement = null;
        reject(e);
      };

      if (signal) {
        signal.addEventListener('abort', () => {
          audio.pause();
          this.currentAudioElement = null;
          resolve();
        });
      }

      audio.play().catch((err) => {
        console.warn('Audio play error:', err);
        resolve(); // resolve so flow does not crash
      });
    });
  }

  /**
   * Complete Bell Execution Sequence:
   * 1. (Optional) Beep ping
   * 2. Westminster Chime / Electric Bell based on chimeType (e.g. 1, 2, 3, 4 chimes)
   * 3. Announcement Voice / MP3
   * 4. Repeat according to repeatCount
   */
  public async triggerBellSequence(
    item: {
      title: string;
      soundPath?: string;
      chimeType?: number;
      repeatCount?: number;
      voiceText?: string;
      customAudioData?: string;
    },
    options: {
      beepEnabled?: boolean;
      volume?: number;
      voiceVolume?: number;
      chimeVolume?: number;
      rate?: number;
    } = {}
  ): Promise<void> {
    this.stopAll();
    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    const title = item.title || 'Bel Sekolah';
    this.notify(true, title);

    const repeat = Math.max(1, item.repeatCount || 1);
    const chimeNumber = item.chimeType !== undefined ? item.chimeType : 3;

    try {
      for (let r = 0; r < repeat; r++) {
        if (signal.aborted) break;

        // 1. Optional Beep
        if (options.beepEnabled) {
          await this.playBeep((options.volume || 0.8) * 0.9, signal);
          await new Promise((res) => setTimeout(res, 200));
        }

        if (signal.aborted) break;

        // 2. Play Chime
        if (chimeNumber > 0) {
          await this.playWestminsterChime(chimeNumber, (options.chimeVolume || 0.8) * (options.volume || 1), signal);
          await new Promise((res) => setTimeout(res, 300));
        }

        if (signal.aborted) break;

        // 3. Play Speech Voice or Custom Audio
        if (item.customAudioData) {
          await this.playAudioUrl(item.customAudioData, (options.voiceVolume || 0.9) * (options.volume || 1), signal);
        } else {
          // Speak default or custom text in Indonesian
          const textToSpeak = item.voiceText || `Perhatian, ${item.title}.`;
          await this.speakText(
            textToSpeak,
            {
              lang: 'id-ID',
              rate: options.rate || 0.95,
              volume: (options.voiceVolume || 0.9) * (options.volume || 1)
            },
            signal
          );
        }

        if (r < repeat - 1) {
          await new Promise((res) => setTimeout(res, 800));
        }
      }
    } catch (err) {
      console.warn('Bell sequence error:', err);
    } finally {
      if (!signal.aborted) {
        this.notify(false, '');
      }
    }
  }
}

export const soundEngine = new SoundEngine();
