export class AudioManager {
  private context: AudioContext | null = null;
  private sounds = new Map<string, AudioBuffer>();
  private masterVolume: number = 1.0;

  async initialize(): Promise<void> {
    // Check if we're in a browser environment
    if (typeof window === "undefined" || typeof AudioContext === "undefined") {
      console.warn(
        "AudioManager: Running in non-browser environment, audio disabled"
      );
      return;
    }

    try {
      this.context = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn("Web Audio API not supported:", error);
    }
  }

  async loadSound(name: string, url: string): Promise<void> {
    if (!this.context) return;

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
      this.sounds.set(name, audioBuffer);
    } catch (error) {
      console.error(`Failed to load sound ${name}:`, error);
    }
  }

  playSound(name: string, volume: number = 1.0): void {
    if (!this.context) return;

    const sound = this.sounds.get(name);
    if (!sound) {
      console.warn(`Sound ${name} not found`);
      return;
    }

    const source = this.context.createBufferSource();
    const gainNode = this.context.createGain();

    source.buffer = sound;
    gainNode.gain.value = volume * this.masterVolume;

    source.connect(gainNode);
    gainNode.connect(this.context.destination);

    source.start();
  }

  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  getMasterVolume(): number {
    return this.masterVolume;
  }
}
