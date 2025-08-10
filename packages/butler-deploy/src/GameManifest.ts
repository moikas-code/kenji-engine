export interface ItchManifest {
  actions: ItchAction[];
  prereqs?: ItchPrereq[];
}

export interface ItchAction {
  name: string;
  path: string;
  icon?: string;
  args?: string[];
  sandbox?: boolean;
  scope?: string;
}

export interface ItchPrereq {
  name: string;
  url?: string;
}

export interface GameMetadata {
  title: string;
  author: string;
  version: string;
  description?: string;
  tags?: string[];
  genre?: string;
  platforms?: string[];
  minPlayers?: number;
  maxPlayers?: number;
  controls?: string[];
  features?: string[];
}

export class ManifestGenerator {
  static generateItchManifest(metadata: GameMetadata): ItchManifest {
    const manifest: ItchManifest = {
      actions: [
        {
          name: "play",
          path: "index.html",
          scope: "profile:me",
        },
      ],
    };

    // Add prerequisites for web games
    if (metadata.platforms?.includes("web")) {
      manifest.prereqs = [
        {
          name: "html5",
        },
      ];
    }

    return manifest;
  }

  static generatePackageJson(metadata: GameMetadata): any {
    return {
      name: metadata.title.toLowerCase().replace(/\s+/g, "-"),
      version: metadata.version,
      description:
        metadata.description ||
        `${metadata.title} - A game built with Kuuzuki Game Engine`,
      author: metadata.author,
      license: "MIT",
      main: "index.html",
      scripts: {
        start: "serve .",
        build: "echo 'Already built'",
      },
      keywords: [
        "game",
        "html5",
        "canvas",
        "kenji-engine",
        ...(metadata.tags || []),
      ],
      engines: {
        node: ">=16.0.0",
      },
    };
  }

  static generateReadme(metadata: GameMetadata): string {
    return `# ${metadata.title}

${metadata.description || "A game built with Kuuzuki Game Engine"}

## Game Information

- **Author**: ${metadata.author}
- **Version**: ${metadata.version}
- **Genre**: ${metadata.genre || "Arcade"}
- **Players**: ${metadata.minPlayers || 1}${
      metadata.maxPlayers && metadata.maxPlayers > 1
        ? ` - ${metadata.maxPlayers}`
        : ""
    }

## Controls

${
  metadata.controls?.map((control) => `- ${control}`).join("\n") ||
  "- Use keyboard and mouse to play"
}

## Features

${
  metadata.features?.map((feature) => `- ${feature}`).join("\n") ||
  "- Classic arcade gameplay\n- Pixel-perfect graphics\n- Responsive controls"
}

## How to Play

Open index.html in a modern web browser to start playing.

## Technical Details

Built with:
- Kuuzuki Game Engine
- TypeScript
- HTML5 Canvas
- Web Audio API

## License

MIT License - see LICENSE file for details.
`;
  }

  static generateChangelog(version: string, changes: string[]): string {
    const date = new Date().toISOString().split("T")[0];

    return `# Changelog

## [${version}] - ${date}

### Added
${changes
  .filter((c) => c.startsWith("+"))
  .map((c) => `- ${c.slice(1).trim()}`)
  .join("\n")}

### Changed
${changes
  .filter((c) => c.startsWith("*"))
  .map((c) => `- ${c.slice(1).trim()}`)
  .join("\n")}

### Fixed
${changes
  .filter((c) => c.startsWith("-"))
  .map((c) => `- ${c.slice(1).trim()}`)
  .join("\n")}

### Removed
${changes
  .filter((c) => c.startsWith("!"))
  .map((c) => `- ${c.slice(1).trim()}`)
  .join("\n")}
`;
  }
}
