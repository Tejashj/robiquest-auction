/**
 * ============================================================================
 * WEB AUDIO API SYNTHESIZER
 * Zero-Asset, Low-Latency Spatial Sound Cues for Real-Time Auction Events
 * ============================================================================
 */

class AuctionAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  /**
   * Ascending high-frequency harmonic chime for accepted winning bids
   */
  public playBidAccepted() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const freqs = [587.33, 880.0, 1174.66]; // D5, A5, D6 arpeggio

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0, now + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.06 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.45);
    });
  }

  /**
   * Crisp, high-tech electronic paddle raise confirmation click
   */
  public playPaddleRaise() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.19);
  }

  /**
   * Descending gentle alert chime when user gets outbid
   */
  public playOutbidAlert() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const freqs = [659.25, 493.88]; // E5 to B4

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.22, now + idx * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.4);
    });
  }

  /**
   * Resonant wooden gavel strike when lot is hammered SOLD
   */
  public playGavelStrike() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Transient thud
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.36);

    // Second bounce 180ms later
    setTimeout(() => {
      const bounceCtx = this.getContext();
      if (!bounceCtx) return;
      const bNow = bounceCtx.currentTime;
      const osc2 = bounceCtx.createOscillator();
      const gain2 = bounceCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(110, bNow);
      osc2.frequency.exponentialRampToValueAtTime(25, bNow + 0.12);

      gain2.gain.setValueAtTime(0.25, bNow);
      gain2.gain.exponentialRampToValueAtTime(0.001, bNow + 0.25);

      osc2.connect(gain2);
      gain2.connect(bounceCtx.destination);
      osc2.start(bNow);
      osc2.stop(bNow + 0.26);
    }, 140);
  }

  /**
   * Soft warning tick when clock enters anti-sniping window
   */
  public playClockWarningTick() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  /**
   * Heavy resonant gavel strike with woodblock impact & sub-bass reverb for SOLD!
   */
  public playGavelStrikeHeavy() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Sub-bass impact
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(180, now);
    subOsc.frequency.exponentialRampToValueAtTime(35, now + 0.25);
    subGain.gain.setValueAtTime(0.6, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.56);

    // Sharp wood block click
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(950, now);
    clickOsc.frequency.exponentialRampToValueAtTime(120, now + 0.08);
    clickGain.gain.setValueAtTime(0.4, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);
    clickOsc.start(now);
    clickOsc.stop(now + 0.11);

    // Double bounce
    setTimeout(() => {
      const bCtx = this.getContext();
      if (!bCtx) return;
      const bNow = bCtx.currentTime;
      const bOsc = bCtx.createOscillator();
      const bGain = bCtx.createGain();
      bOsc.type = 'sine';
      bOsc.frequency.setValueAtTime(130, bNow);
      bOsc.frequency.exponentialRampToValueAtTime(30, bNow + 0.2);
      bGain.gain.setValueAtTime(0.35, bNow);
      bGain.gain.exponentialRampToValueAtTime(0.001, bNow + 0.35);
      bOsc.connect(bGain);
      bGain.connect(bCtx.destination);
      bOsc.start(bNow);
      bOsc.stop(bNow + 0.36);
    }, 120);
  }

  /**
   * Sharp woodblock tap for warning gavel taps (Going Once, Going Twice)
   */
  public playWoodBlockStrike() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.14);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  /**
   * Dramatic hollow gong / minor chord resonance for UNSOLD / PASSED lots
   */
  public playUnsoldGong() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const freqs = [330.0, 261.63, 196.0]; // E4, C4, G3 (dark minor drop)

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.7);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.75);
    });
  }

  /**
   * Aerodynamic whoosh/spring sound when an auction paddle surges up
   */
  public playPaddleSwoosh() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.12);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  // ==========================================================================
  // REAL-TIME AUCTIONEER VOICE CHANT ENGINE (WEB SPEECH API)
  // Zero-Asset Broadcast Vocal Calls: Going Once, Going Twice, Against the Room, Sold!
  // ==========================================================================
  private isVoiceEnabled: boolean = true;

  public setVoiceEnabled(enabled: boolean) {
    this.isVoiceEnabled = enabled;
  }

  public toggleVoice(): boolean {
    this.isVoiceEnabled = !this.isVoiceEnabled;
    return this.isVoiceEnabled;
  }

  public speak(text: string, rate: number = 1.05, pitch: number = 1.0) {
    if (this.isMuted || !this.isVoiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    try {
      // Cancel previous utterances to avoid speech queue congestion
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = 1.0;

      // Select natural English voice if available in browser
      const voices = window.speechSynthesis.getVoices();
      const englishVoice =
        voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Natural') ||
              v.name.includes('David') ||
              v.name.includes('George') ||
              v.name.includes('Google') ||
              v.name.includes('Male'))
        ) || voices.find((v) => v.lang.startsWith('en'));

      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis callout warning:', e);
    }
  }

  public speakGoingOnce(priceStr?: string) {
    this.playWoodBlockStrike();
    const text = priceStr ? `Going once, at ${priceStr}!` : 'Going once!';
    setTimeout(() => {
      this.speak(text, 1.08, 1.05);
    }, 60);
  }

  public speakGoingTwice(leaderName?: string, priceStr?: string) {
    this.playWoodBlockStrike();
    const text = leaderName
      ? `Going twice! Against the room to ${leaderName} at ${priceStr || ''}!`
      : `Going twice! Against the room!`;
    setTimeout(() => {
      this.speak(text, 1.12, 1.08);
    }, 60);
  }

  public speakSold(winnerName: string, priceStr: string) {
    this.playGavelStrikeHeavy();
    const text = `The hammer falls! Sold to ${winnerName} for ${priceStr}!`;
    setTimeout(() => {
      this.speak(text, 1.1, 1.0);
    }, 250);
  }

  public speakPassed(lotTitle?: string) {
    this.playGavelStrikeHeavy();
    this.playUnsoldGong();
    const text = lotTitle ? `Passed. ${lotTitle} remains unsold.` : 'Passed! Lot is unsold.';
    setTimeout(() => {
      this.speak(text, 1.05, 0.95);
    }, 280);
  }

  public speakNewBid(teamName: string, priceStr: string) {
    this.playPaddleSwoosh();
    this.playBidAccepted();
    const phrases = [
      `${priceStr} with ${teamName}! Against the room!`,
      `Bid ${priceStr} to ${teamName}! Against the room!`,
      `${teamName} takes the floor at ${priceStr}!`,
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    setTimeout(() => {
      this.speak(phrase, 1.18, 1.06);
    }, 180);
  }
}

export const soundEffects = new AuctionAudioSynthesizer();


