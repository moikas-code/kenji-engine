// Global type declarations for Kenji Engine

declare module "*.json" {
  const value: any;
  export default value;
}

declare module "*/package.json" {
  interface PackageJson {
    name: string;
    version: string;
    description?: string;
    main?: string;
    module?: string;
    type?: "module" | "commonjs";
    scripts?: Record<string, string>;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
    keywords?: string[];
    author?: string;
    license?: string;
    bin?: Record<string, string> | string;
    private?: boolean;
  }
  
  const packageJson: PackageJson;
  export default packageJson;
}