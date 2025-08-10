export class AssetManager {
  private images = new Map<string, HTMLImageElement>();
  private canvases = new Map<string, HTMLCanvasElement>();
  private loadingPromises = new Map<string, Promise<any>>();

  async initialize(): Promise<void> {
    // Base initialization
  }

  async loadImage(name: string, url: string): Promise<HTMLImageElement> {
    if (this.images.has(name)) {
      return this.images.get(name)!;
    }

    if (this.loadingPromises.has(name)) {
      return this.loadingPromises.get(name)!;
    }

    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.images.set(name, img);
        this.loadingPromises.delete(name);
        resolve(img);
      };
      img.onerror = () => {
        this.loadingPromises.delete(name);
        reject(new Error(`Failed to load image: ${url}`));
      };
      img.src = url;
    });

    this.loadingPromises.set(name, promise);
    return promise;
  }

  getImage(name: string): HTMLImageElement | undefined {
    return this.images.get(name);
  }

  storeCanvas(name: string, canvas: HTMLCanvasElement): void {
    this.canvases.set(name, canvas);
  }

  getCanvas(name: string): HTMLCanvasElement | undefined {
    return this.canvases.get(name);
  }

  async loadMultipleImages(assets: { name: string; url: string }[]): Promise<void> {
    const promises = assets.map(asset => this.loadImage(asset.name, asset.url));
    await Promise.all(promises);
  }

  isLoaded(name: string): boolean {
    return this.images.has(name) || this.canvases.has(name);
  }

  getAllAssetNames(): string[] {
    return [...this.images.keys(), ...this.canvases.keys()];
  }
}