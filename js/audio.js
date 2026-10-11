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
    this.bgmVolume = 0.25;
    this.bgmGain = null;
    this.bgmInterval = null;
    this.bgmOscillators = [];
    this.isPlayingBgm = false;
    
    // Support file audio bgm.m4a (or bgm.mp3) with loop
    this.bgmAudio = new Audio('bgm.m4a');
    this.bgmAudio.loop = true;
    this.bgmAudio.volume = this.bgmVolume;
    this.useAudioElement = true; // Use real audio file first, fallback to synth if not available
    
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

  // Alias for backward compatibility with SoundManager snippet
  ensureContext() {
    this.ensureContextRunning();
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
    this.sfxVolume = Math.max(0, Math.min(1, val));
    if (this.sfxEnabled && this.sfxMasterGain && this.audioCtx) {
      this.sfxMasterGain.gain.setTargetAtTime(this.sfxVolume, this.audioCtx.currentTime, 0.1);
    }
  }

  toggleBGM(state) {
    if (state !== undefined) {
      this.bgmEnabled = state;
    } else {
      this.bgmEnabled = !this.bgmEnabled;
    }
    
    if (this.bgmEnabled) {
      this.startBGM();
    } else {
      this.stopBGM();
    }
    return this.bgmEnabled;
  }

  toggleBgm(state) {
    return this.toggleBGM(state);
  }

  setBgmVolume(val) {
    this.bgmVolume = Math.max(0, Math.min(1, val));
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.bgmVolume;
    }
    if (this.bgmGain && this.audioCtx) {
      this.bgmGain.gain.setTargetAtTime(this.bgmVolume, this.audioCtx.currentTime, 0.1);
    }
  }

  startBGM() {
    this.ensureContextRunning();
    this.isPlayingBgm = true;

    // Try playing bgm.m4a first
    if (this.useAudioElement && this.bgmAudio) {
      this.bgmAudio.volume = this.bgmVolume;
      const playPromise = this.bgmAudio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          // Successfully playing bgm.m4a
          this.stopSynthBGM();
        }).catch(err => {
          console.log("bgm.m4a not found or autoplay restricted, falling back to playful chiptune synth:", err);
          this.startSynthBGM();
        });
        return;
      }
    }
    
    this.startSynthBGM();
  }

  startBgm() {
    this.startBGM();
  }

  stopBGM() {
    this.isPlayingBgm = false;
    if (this.bgmAudio) {
      this.bgmAudio.pause();
    }
    this.stopSynthBGM();
  }

  stopBgm() {
    this.stopBGM();
  }

  startSynthBGM() {
    if (this.bgmGain) return; // already playing synth
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

  stopSynthBGM() {
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
      if (type === 'click' || type === 'tile' || type === 'pop') this.playPop();
      else if (type === 'slice') this.playSlice();
      else if (type === 'success' || type === 'correct') this.playCorrect();
      else if (type === 'bonus') this.playBonusSound();
      else if (type === 'error' || type === 'invalid' || type === 'wrong') this.playWrong();
      else if (type === 'shuffle') this.playSlice();
      else if (type === 'gameover' || type === 'win' || type === 'fanfare') this.playFanfare();
      else this.playPop();
    } catch (e) {
      console.warn("Sound play error:", e);
    }
  }

  // Kid-Friendly Pop Sound (Tile placement / Button click)
  playPop() {
    if (!this.sfxEnabled) return;
    this.ensureContextRunning();
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const now = this.audioCtx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(850, now + 0.08);

    gain.gain.setValueAtTime(0.25 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01 * this.sfxVolume, now + 0.08);

    osc.connect(gain);
    if (this.sfxMasterGain) gain.connect(this.sfxMasterGain);
    else gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Backward-compatible alias for playPop
  playTileClick() {
    this.playPop();
  }

  // Kid-Friendly Slice / Swish Sound
  playSlice() {
    if (!this.sfxEnabled) return;
    this.ensureContextRunning();
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const now = this.audioCtx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.06);

    gain.gain.setValueAtTime(0.2 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01 * this.sfxVolume, now + 0.06);

    osc.connect(gain);
    if (this.sfxMasterGain) gain.connect(this.sfxMasterGain);
    else gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  playShuffleSound() {
    this.playSlice();
  }

  // Kid-Friendly Correct / Word Success Sound (Sparkly C5, E5, G5, C6 + Sparkle chime)
  playCorrect() {
    if (!this.sfxEnabled) return;
    this.ensureContextRunning();
    if (!this.audioCtx) return;

    // Harmonic Major Arpeggio + High Sparkles
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
    notes.forEach((freq, index) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = index === 4 ? 'sine' : 'triangle';
      osc.frequency.value = freq;

      const startTime = this.audioCtx.currentTime + index * 0.06;
      gain.gain.setValueAtTime(0.24 * this.sfxVolume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001 * this.sfxVolume, startTime + 0.28);

      osc.connect(gain);
      if (this.sfxMasterGain) gain.connect(this.sfxMasterGain);
      else gain.connect(this.audioCtx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.28);
    });
  }

  // Backward-compatible alias for word success
  playWordSuccess() {
    this.playCorrect();
  }

  playSuccess() {
    this.playCorrect();
  }

  // Kid-Friendly Wrong / Error Sound (240Hz down to 160Hz)
  playWrong() {
    if (!this.sfxEnabled) return;
    this.ensureContextRunning();
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const now = this.audioCtx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.linearRampToValueAtTime(160, now + 0.22);

    gain.gain.setValueAtTime(0.18 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01 * this.sfxVolume, now + 0.22);

    osc.connect(gain);
    if (this.sfxMasterGain) gain.connect(this.sfxMasterGain);
    else gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  // Backward-compatible alias for error sound
  playErrorSound() {
    this.playWrong();
  }

  // Kid-Friendly Fanfare (Melodic Victory Chime)
  playFanfare() {
    if (!this.sfxEnabled) return;
    this.ensureContextRunning();
    if (!this.audioCtx) return;

    const melody = [
      { f: 523.25, t: 0.0, d: 0.12 }, // C5
      { f: 659.25, t: 0.12, d: 0.12 }, // E5
      { f: 783.99, t: 0.24, d: 0.12 }, // G5
      { f: 1046.50, t: 0.36, d: 0.3 }, // C6
      { f: 880.00, t: 0.52, d: 0.15 }, // A5
      { f: 1046.50, t: 0.70, d: 0.45 } // C6
    ];

    melody.forEach(n => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = n.f;

      const st = this.audioCtx.currentTime + n.t;
      gain.gain.setValueAtTime(0.25 * this.sfxVolume, st);
      gain.gain.exponentialRampToValueAtTime(0.001 * this.sfxVolume, st + n.d);

      osc.connect(gain);
      if (this.sfxMasterGain) gain.connect(this.sfxMasterGain);
      else gain.connect(this.audioCtx.destination);

      osc.start(st);
      osc.stop(st + n.d);
    });
  }

  // Backward-compatible alias for victory fanfare
  playVictoryFanfare() {
    this.playFanfare();
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

      gain.gain.setValueAtTime(0.25 * this.sfxVolume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001 * this.sfxVolume, startTime + 0.25);

      osc.connect(gain);
      if (this.sfxMasterGain) gain.connect(this.sfxMasterGain);
      else gain.connect(this.audioCtx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.3);
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

// Global Sound Instance & Aliases
window.soundEngine = new SoundEngine();
window.soundManager = window.soundEngine;
