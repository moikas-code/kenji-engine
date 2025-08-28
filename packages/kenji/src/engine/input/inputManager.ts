import { EventEmitter } from 'events';

export class InputManager extends EventEmitter {
  private keys: Set<string> = new Set();
  private keyMappings: Map<string, string> = new Map();
  private stdin: NodeJS.ReadStream;

  constructor() {
    super();
    this.stdin = process.stdin;
    this.setupInput();
  }

  private setupInput(): void {
    if (!this.stdin.isTTY) return;

    this.stdin.setRawMode(true);
    this.stdin.resume();
    this.stdin.setEncoding('utf8');

    this.stdin.on('data', (key: string) => {
      const keyStr = key.toString();
      
      if (keyStr === '\u0003') {
        this.emit('quit');
        process.exit();
      }
      
      const mappedKey = this.keyMappings.get(keyStr) || keyStr;
      
      if (!this.keys.has(mappedKey)) {
        this.keys.add(mappedKey);
        this.emit('keydown', mappedKey);
      }
      
      setTimeout(() => {
        if (this.keys.has(mappedKey)) {
          this.keys.delete(mappedKey);
          this.emit('keyup', mappedKey);
        }
      }, 100);
    });
  }

  isKeyPressed(key: string): boolean {
    return this.keys.has(key);
  }

  mapKey(from: string, to: string): void {
    this.keyMappings.set(from, to);
  }

  clearMappings(): void {
    this.keyMappings.clear();
  }

  destroy(): void {
    if (this.stdin.isTTY) {
      this.stdin.setRawMode(false);
      this.stdin.pause();
    }
    this.removeAllListeners();
  }
}