import { System, Entity, AudioManager } from "@kenji-engine/core";

export class PongAudioSystem extends System {
  public priority = 90; // Before UI rendering

  private audioContext: AudioContext | null = null;
  private isInitialized = false;

  constructor() {
    super();
    this.initializeAudio();
    this.setupEventListeners();
  }

  getRelevantEntities(entities: Entity[]): Entity[] {
    // Audio system doesn't need entities, it responds to events
    return [];
  }

  update(deltaTime: number, entities: Entity[]): void {
    // Audio system is event-driven, no continuous updates needed
  }

  private async initializeAudio(): Promise<void> {
    try {
      // Create audio context on first user interaction
      document.addEventListener("click", this.createAudioContext.bind(this), {
        once: true,
      });
      document.addEventListener("keydown", this.createAudioContext.bind(this), {
        once: true,
      });
    } catch (error) {
      console.warn("Audio initialization failed:", error);
    }
  }

  private createAudioContext(): void {
    if (!this.isInitialized) {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      this.isInitialized = true;
      console.log("🔊 Audio system initialized");
    }
  }

  private setupEventListeners(): void {
    // Listen for collision events
    window.addEventListener("pongCollision", (event: any) => {
      const { type } = event.detail;
      if (type === "paddle") {
        this.playPaddleHitSound();
      } else if (type === "wall") {
        this.playWallHitSound();
      }
    });

    // Listen for scoring events
    window.addEventListener("pongScore", (event: any) => {
      this.playScoreSound();
    });

    // Listen for game over events
    window.addEventListener("pongGameOver", (event: any) => {
      this.playGameOverSound();
    });
  }

  private playPaddleHitSound(): void {
    if (!this.audioContext) return;

    try {
      // Create a short, sharp beep for paddle hits
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Paddle hit: Higher pitch, short duration
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        400,
        this.audioContext.currentTime + 0.1
      );

      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + 0.1
      );

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.1);
    } catch (error) {
      console.warn("Failed to play paddle hit sound:", error);
    }
  }

  private playWallHitSound(): void {
    if (!this.audioContext) return;

    try {
      // Create a different sound for wall hits
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Wall hit: Lower pitch, slightly longer
      oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        150,
        this.audioContext.currentTime + 0.15
      );

      gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + 0.15
      );

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.15);
    } catch (error) {
      console.warn("Failed to play wall hit sound:", error);
    }
  }

  private playScoreSound(): void {
    if (!this.audioContext) return;

    try {
      // Create a celebratory sound for scoring
      const oscillator1 = this.audioContext.createOscillator();
      const oscillator2 = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Score: Two-tone ascending sound
      oscillator1.frequency.setValueAtTime(400, this.audioContext.currentTime);
      oscillator1.frequency.setValueAtTime(
        600,
        this.audioContext.currentTime + 0.1
      );

      oscillator2.frequency.setValueAtTime(500, this.audioContext.currentTime);
      oscillator2.frequency.setValueAtTime(
        800,
        this.audioContext.currentTime + 0.1
      );

      gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + 0.3
      );

      oscillator1.start(this.audioContext.currentTime);
      oscillator1.stop(this.audioContext.currentTime + 0.3);

      oscillator2.start(this.audioContext.currentTime + 0.05);
      oscillator2.stop(this.audioContext.currentTime + 0.35);
    } catch (error) {
      console.warn("Failed to play score sound:", error);
    }
  }

  private playGameOverSound(): void {
    if (!this.audioContext) return;

    try {
      // Create a game over sound sequence
      const playTone = (
        frequency: number,
        startTime: number,
        duration: number
      ) => {
        const oscillator = this.audioContext!.createOscillator();
        const gainNode = this.audioContext!.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext!.destination);

        oscillator.frequency.setValueAtTime(frequency, startTime);
        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      // Game over: Descending sequence
      const currentTime = this.audioContext.currentTime;
      playTone(600, currentTime, 0.2);
      playTone(500, currentTime + 0.15, 0.2);
      playTone(400, currentTime + 0.3, 0.2);
      playTone(300, currentTime + 0.45, 0.4);
    } catch (error) {
      console.warn("Failed to play game over sound:", error);
    }
  }

  // Public method to test audio
  public testAudio(): void {
    this.createAudioContext();
    this.playPaddleHitSound();
    setTimeout(() => this.playWallHitSound(), 200);
    setTimeout(() => this.playScoreSound(), 400);
    setTimeout(() => this.playGameOverSound(), 800);
  }
}
