/**
 * Audio Engine & Speech Synthesis for Descriptive Scrabble
 * Uses Web Audio API for zero-dependency sound effects
 * and Web Speech API for English native pronunciation.
 */

class SoundEngine {
  constructor() {
    this.audioCtx = null;
    this.sfxMasterGain = null;
    this.sfxEnabled = true;
    this.sfxVolume = 1.0;
    
    this.bgmEnabled = false;
    this.bgmVolume = 0.2;
    this.bgmGain = null;
    this.bgmInterval = null;
    this.bgmOscillators = [];
    
    this.speechEnabled = true;
    this.initAudioContext();
  }

  initAudioContext() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
        
        // Master gain for SFX
        this.sfxMasterGain = this.audioCtx.createGain();
        this.sfxMasterGain.gain.value = this.sfxVolume;
        this.sfxMasterGain.connect(this.audioCtx.destination);
      }
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  ensureContextRunning() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggleSound(state) {
    if (state !== undefined) {
      this.sfxEnabled = state;
    } else {
      this.sfxEnabled = !this.sfxEnabled;
    }
    if (!this.sfxEnabled && this.sfxMasterGain) {
       this.sfxMasterGain.gain.value = 0;
    } else if (this.sfxMasterGain) {
       this.sfxMasterGain.gain.value = this.sfxVolume;
    }
    return this.sfxEnabled;
  }
  
  setSfxVolume(val) {
    this.sfxVolume = val;
    if (this.sfxEnabled && this.sfxMasterGain) {
      this.sfxMasterGain.gain.setTargetAtTime(val, this.audioCtx.currentTime, 0.1);
    }
  }

  toggleBGM(state) {
    if (state !== undefined) {
      this.bgmEnabled = state;
    } else {
      this.bgmEnabled = !this.bgmEnabled;
    }
    
    if (this.bgmEnabled) {
      this.ensureContextRunning();
      this.startBGM();
    } else {
      this.stopBGM();
    }
    return this.bgmEnabled;
  }

  setBgmVolume(val) {
    this.bgmVolume = val;
    if (this.bgmGain && this.bgmEnabled) {
      this.bgmGain.gain.setTargetAtTime(val, this.audioCtx.currentTime, 0.1);
    }
  }

  startBGM() {
    if (this.bgmGain) return; // already playing
    if (!this.audioCtx) return;
    
    this.bgmGain = this.audioCtx.createGain();
    this.bgmGain.gain.value = this.bgmVolume;
    this.bgmGain.connect(this.audioCtx.destination);
    
    // Upbeat & cheerful frequencies (C Major scale)
    const notes = {
      C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, C5: 523.25,
      C3: 130.81, F3: 174.61, G3: 196.00
    };

    // Playful bouncy 16-step melody
    const melody = [
      notes.C4, notes.E4, notes.G4, notes.C5,
      notes.A4, notes.C5, notes.G4, null,
      notes.F4, notes.A4, notes.E4, notes.G4,
      notes.D4, notes.F4, notes.C4, null
    ];
    
    // Simple bouncy bassline
    const bass = [
      notes.C3, null, notes.G3, null,
      notes.F3, null, notes.C3, null,
      notes.F3, null, notes.C3, null,
      notes.G3, null, notes.C3, null
    ];
    
    let step = 0;
    const stepDuration = 0.22; // 220ms per step (~136 BPM)
    
    const playStep = () => {
      if (!this.bgmEnabled) return;
      const now = this.audioCtx.currentTime;
      
      // Melody (Triangle Wave)
      if (melody[step]) {
         const osc = this.audioCtx.createOscillator();
         const gain = this.audioCtx.createGain();
         osc.type = 'triangle';
         osc.frequency.value = melody[step];
         
         // Bouncy envelope
         gain.gain.setValueAtTime(0, now);
         gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
         gain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration - 0.02);
         
         osc.connect(gain);
         gain.connect(this.bgmGain);
         osc.start(now);
         osc.stop(now + stepDuration);
      }
      
      // Bass (Square Wave with Lowpass)
      if (bass[step]) {
         const osc = this.audioCtx.createOscillator();
         const gain = this.audioCtx.createGain();
         osc.type = 'square';
         osc.frequency.value = bass[step];
         
         gain.gain.setValueAtTime(0, now);
         gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
         gain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration - 0.02);
         
         const filter = this.audioCtx.createBiquadFilter();
         filter.type = 'lowpass';
         filter.frequency.value = 350; // smooth out the harsh square wave
         
         osc.connect(filter);
         filter.connect(gain);
         gain.connect(this.bgmGain);
         
         osc.start(now);
         osc.stop(now + stepDuration);
      }
      
      step = (step + 1) % 16;
    };
    
    playStep();
    this.bgmInterval = setInterval(playStep, stepDuration * 1000);
  }

  stopBGM() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    if (this.bgmGain) {
      this.bgmGain.disconnect();
      this.bgmGain = null;
    }
  }

  toggleSpeech() {
    this.speechEnabled = !this.speechEnabled;
    return this.speechEnabled;
  }

  // Generic play dispatcher
  play(type = 'click') {
    try {
      if (type === 'click' || type === 'tile') this.playTileClick();
      else if (type === 'success') this.playWordSuccess();
      else if (type === 'bonus') this.playBonusSound();
      else if (type === 'error' || type === 'invalid') this.playErrorSound();
      else if (type === 'shuffle') this.playShuffleSound();
      else if (type === 'gameover' || type === 'win' || type === 'fanfare') this.playVictoryFanfare();
      else this.playTileClick();
    } catch (e) {
      console.warn("Sound play error:", e);
    }
  }

  // Play tile place sound (soft wooden click)
  playTileClick() {
    if (!this.sfxEnabled || !this.audioCtx) return;
    this.ensureContextRunning();

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const now = this.audioCtx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.05);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    osc.connect(gain);
    if (this.sfxMasterGain) gain.connect(this.sfxMasterGain);
    else gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  // Play word success chime (uplifting harmonic chord)
  playWordSuccess() {
    if (!this.sfxEnabled || !this.audioCtx) return;
    this.ensureContextRunning();

    const now = this.audioCtx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Major chord)

    notes.forEach((freq, idx) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const startTime = now + (idx * 0.07);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

      osc.connect(gain);
      if (this.sfxMasterGain) gain.connect(this.sfxMasterGain);
    else gain.connect(this.audioCtx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.45);
    });
  }

  // Play bonus point sound (sparkling high pitch)
  playBonusSound() {
    if (!this.sfxEnabled || !this.audioCtx) return;
    this.ensureContextRunning();

    const now = this.audioCtx.currentTime;
    const freqs = [880, 1174.66, 1760];

    freqs.forEach((freq, idx) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const startTime = now + (idx * 0.06);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

      osc.connect(gain);
      if (this.sfxMasterGain) gain.connect(this.sfxMasterGain);
    else gain.connect(this.audioCtx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  }

  // Play error boop sound (gentle low pitch reminder)
  playErrorSound() {
    if (!this.sfxEnabled || !this.audioCtx) return;
    this.ensureContextRunning();

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const now = this.audioCtx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.2);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  // Play Victory / Quiz Complete Fanfare
  playVictoryFanfare() {
    if (!this.sfxEnabled || !this.audioCtx) return;
    this.ensureContextRunning();

    const now = this.audioCtx.currentTime;
    const melody = [
      { note: 523.25, duration: 0.15 }, // C5
      { note: 523.25, duration: 0.15 }, // C5
      { note: 523.25, duration: 0.15 }, // C5
      { note: 659.25, duration: 0.4 },  // E5
      { note: 587.33, duration: 0.2 },  // D5
      { note: 783.99, duration: 0.6 }   // G5
    ];

    let timeOffset = 0;
    melody.forEach((item) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const startTime = now + timeOffset;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(item.note, startTime);

      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + item.duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(startTime);
      osc.stop(startTime + item.duration + 0.05);

      timeOffset += item.duration;
    });
  }

  // Speak English word using Web Speech API
  speak(text, lang = 'en-US') {
    if (!this.speechEnabled || !('speechSynthesis' in window)) {
      console.warn("Speech Synthesis is not enabled or supported");
      return;
    }

    window.speechSynthesis.cancel(); // cancel any previous utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.7; // Much slower for better clarity for 7th graders
    utterance.pitch = 1.0;

    // Pick an English voice if available
    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('David') || v.name.includes('Zira')));
    if (enVoice) {
      utterance.voice = enVoice;
    }

    window.speechSynthesis.speak(utterance);
  }
}

// Global Sound Instance
window.soundEngine = new SoundEngine();
