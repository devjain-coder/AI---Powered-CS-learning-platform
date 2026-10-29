// Web Audio Context Singleton
class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Plays a pitch frequency proportional to the element value.
   * @param value Current array element value
   * @param minValue Minimum value in the array
   * @param maxValue Maximum value in the array
   * @param type Sound wave shape ('sine' | 'triangle' | 'square')
   */
  public playTone(
    value: number,
    minValue: number = 0,
    maxValue: number = 100,
    type: OscillatorType = 'sine'
  ) {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    // Map array value to 150 Hz -> 850 Hz frequency range
    const minFreq = 150;
    const maxFreq = 850;
    const norm = Math.max(0, Math.min(1, (value - minValue) / (maxValue - minValue || 1)));
    const freq = minFreq + norm * (maxFreq - minFreq);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    // Quick attack and decay (0.05 seconds duration)
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }
}

export const soundEngine = new SoundEngine();