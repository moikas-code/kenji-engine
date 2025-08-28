import { useState, useEffect, useCallback, memo } from "react";
import { homedir } from "os";
import { join } from "path";
import { existsSync, readdirSync } from "fs";
import { themeColors } from "../shared/colors";
import { useViewRouter } from "../provider/ViewRouter";
import { useProjectManager } from "../provider";
import { useKeybinds } from "../keybinds";
import Header from "../components/Header";
interface LoadProjectViewProps {
  onBack?: () => void;
}

interface DirectoryItem {
  name: string;
  path: string;
  type: "directory" | "project" | "file";
  description?: string;
}

const LoadProjectView = (props: LoadProjectViewProps) => {
  const router = useViewRouter();
  const projectManager = useProjectManager();

  const [directoryItems, setDirectoryItems] = useState<DirectoryItem[]>([]);
  const [currentPath, setCurrentPath] = useState(
    join(homedir(), "kenji-projects"),
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Scan directory contents
  const scanDirectory = useCallback(async () => {
    setStatusMessage("🔄 Scanning directory...");

    try {
      if (!existsSync(currentPath)) {
        setStatusMessage("⚠️ Directory not found.");
        setTimeout(() => setStatusMessage(""), 3000);
        return;
      }

      const items = readdirSync(currentPath, { withFileTypes: true });
      const foundItems: DirectoryItem[] = [];

      // Add parent directory option if not at root
      if (currentPath !== homedir()) {
        foundItems.push({
          name: "..",
          path: join(currentPath, ".."),
          type: "directory",
          description: "Go up one level",
        });
      }

      for (const item of items) {
        const itemPath = join(currentPath, item.name);

        if (item.isDirectory()) {
          const configPath = join(itemPath, "kenji.config.json");

          if (existsSync(configPath)) {
            // This is a Kenji project
            try {
              const configFile = Bun.file(configPath);
              const configText = await configFile.text();
              const config = JSON.parse(configText);

              if (config.name) {
                foundItems.push({
                  name: item.name,
                  path: itemPath,
                  type: "project",
                  description: config.description || "Kenji TUI Project",
                });
              } else {
                foundItems.push({
                  name: item.name,
                  path: itemPath,
                  type: "project",
                  description: "⚠️ Invalid configuration",
                });
              }
            } catch (error) {
              foundItems.push({
                name: item.name,
                path: itemPath,
                type: "project",
                description: "⚠️ Config read error",
              });
            }
          } else {
            // Regular directory
            foundItems.push({
              name: item.name,
              path: itemPath,
              type: "directory",
            });
          }
        } else if (item.isFile() && item.name.endsWith(".json")) {
          // Show config files
          foundItems.push({
            name: item.name,
            path: itemPath,
            type: "file",
          });
        }
      }

      setDirectoryItems(foundItems);

      if (foundItems.length === 0) {
        setStatusMessage("⚠️ Directory is empty");
        setTimeout(() => setStatusMessage(""), 3000);
      } else {
        setStatusMessage(`✅ Found ${foundItems.length} item(s)`);
        setTimeout(() => setStatusMessage(""), 2000);
      }
    } catch (error) {
      setStatusMessage(
        `⚠️ Could not scan directory: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      setTimeout(() => setStatusMessage(""), 3000);
    }
  }, [currentPath]);

  // Handle selection of directory item
  const handleSelect = useCallback(async () => {
    const selectedItem = directoryItems[selectedIndex];
    if (!selectedItem) {
      setStatusMessage("⚠️ No item selected");
      setTimeout(() => setStatusMessage(""), 3000);
      return;
    }

    if (selectedItem.type === "directory") {
      // Navigate to directory
      setCurrentPath(selectedItem.path);
      setSelectedIndex(0);
      return;
    }

    if (selectedItem.type === "project") {
      // Load project
      if (selectedItem.description?.startsWith("⚠️")) {
        setStatusMessage("❌ Cannot load project with configuration errors");
        setTimeout(() => setStatusMessage(""), 3000);
        return;
      }

      setIsLoading(true);
      setStatusMessage(`🔄 Loading "${selectedItem.name}"...`);

      try {
        const config = await projectManager.loadProject(selectedItem.path);

        if (!config) {
          throw new Error("Failed to load project configuration");
        }

        setStatusMessage(
          `✅ Project "${selectedItem.name}" loaded successfully!`,
        );

        // Navigate to Canvas after a short delay
        setTimeout(() => {
          setIsLoading(false);
          router.navigate("game");
        }, 1500);
      } catch (error) {
        console.error("Project load error:", error);
        setStatusMessage(
          `❌ Loading failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
        setIsLoading(false);
        setTimeout(() => setStatusMessage(""), 5000);
      }
    }
  }, [directoryItems, selectedIndex, projectManager, router]);

  useEffect(() => {
    scanDirectory();
  }, [scanDirectory]);

  // Set up keybind handlers using the new system
  useKeybinds(
    {
      "list:moveUp": useCallback(() => {
        if (directoryItems.length === 0) return;
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : directoryItems.length - 1,
        );
      }, [directoryItems]),

      "list:moveDown": useCallback(() => {
        if (directoryItems.length === 0) return;
        setSelectedIndex((prev) =>
          prev < directoryItems.length - 1 ? prev + 1 : 0,
        );
      }, [directoryItems]),

      "directory:navigateUp": useCallback(() => {
        const parentPath = join(currentPath, "..");
        if (parentPath !== currentPath) {
          setCurrentPath(parentPath);
          setSelectedIndex(0);
        }
      }, [currentPath]),

      "directory:navigateInto": useCallback(() => {
        const selectedItem = directoryItems[selectedIndex];
        if (selectedItem && selectedItem.type === "directory") {
          setCurrentPath(selectedItem.path);
          setSelectedIndex(0);
        }
      }, [directoryItems, selectedIndex]),

      "item:select": useCallback(() => {
        handleSelect();
      }, [handleSelect]),

      "directory:refresh": useCallback(() => {
        scanDirectory();
      }, [scanDirectory]),

      "navigate:back": useCallback(() => {
        if (props.onBack) {
          props.onBack();
        } else {
          router.goBack();
        }
      }, [props.onBack, router]),
    },
    {
      context: "load",
      enabled: !isLoading,
    },
  );

  return (
    <group
      style={{
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Header */}
      <Header
        title="Load Project"
        subtitle="Navigate directories and select a Kenji project to load"
      />

      {/* Main Content */}
      <group
        style={{
          flexDirection: "column",
          padding: 1,
        }}
      >
        {/* Status Message */}
        {statusMessage && (
          <group
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 1,
              marginBottom: 1,
            }}
          >
            <text
              style={{
                fg: statusMessage.startsWith("✅")
                  ? themeColors.hex.success
                  : statusMessage.startsWith("❌")
                    ? "#FF453A"
                    : statusMessage.startsWith("⚠️")
                      ? "#FF9F0A"
                      : themeColors.hex.accent,
              }}
            >
              {statusMessage.startsWith("✅")
                ? "✓"
                : statusMessage.startsWith("❌")
                  ? "✗"
                  : statusMessage.startsWith("⚠️")
                    ? "⚠"
                    : statusMessage.startsWith("🔄")
                      ? "⟳"
                      : "ℹ"}
            </text>
            <text
              style={{
                fg: "#FFFFFF",
                marginLeft: 1,
              }}
            >
              {statusMessage.substring(2)}
            </text>
          </group>
        )}

        {/* Directory Contents */}
        <box
          title="Directory Contents"
          style={{
            width: 70,
            height: 8,
            borderColor: themeColors.hex.accent,
          }}
        >
          <group
            style={{
              flexDirection: "column",
            }}
          >
            {directoryItems.map((item, index) => (
              <group
                key={item.path}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 1,
                  marginBottom: 0,
                }}
              >
                <text
                  style={{
                    fg:
                      selectedIndex === index
                        ? "#FFFFFF"
                        : themeColors.hex.accent,
                    bg:
                      selectedIndex === index
                        ? themeColors.hex.accent
                        : undefined,
                    marginRight: 1,
                  }}
                >
                  {selectedIndex === index ? "▶" : " "}
                </text>
                <text
                  style={{
                    fg: selectedIndex === index ? "#FFFFFF" : "#E0E0E0",
                    marginRight: 1,
                  }}
                >
                  {item.type === "directory"
                    ? "📁"
                    : item.type === "project"
                      ? "🎮"
                      : "📄"}
                </text>
                <text
                  style={{
                    fg: selectedIndex === index ? "#FFFFFF" : "#E0E0E0",
                  }}
                >
                  {item.name}
                </text>
                {item.description && (
                  <text
                    style={{
                      fg:
                        selectedIndex === index
                          ? "#CCCCCC"
                          : themeColors.hex.muted,
                      marginLeft: 2,
                    }}
                  >
                    • {item.description}
                  </text>
                )}
              </group>
            ))}
            {directoryItems.length === 0 && (
              <group
                style={{
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 6,
                }}
              >
                <text
                  style={{
                    fg: themeColors.hex.muted,
                  }}
                >
                  📁 Directory is empty
                </text>
                <text
                  style={{
                    fg: themeColors.hex.muted,
                    marginTop: 0,
                  }}
                >
                  Navigate to a different directory or create a project
                </text>
              </group>
            )}
          </group>
        </box>
      </group>

      {/* Footer - Fixed at bottom */}
      <group
        style={{
          flexDirection: "column",
          padding: 1,
        }}
      >
        <text
          style={{
            fg: themeColors.hex.muted,
          }}
        >
          ↑↓ Navigate • ←→/Backspace Up Dir • Enter Load/Enter Dir • R Refresh •
          ESC Cancel
        </text>
      </group>
    </group>
  );
};

export default memo(LoadProjectView);
