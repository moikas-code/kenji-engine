import { useState, useEffect, useCallback, memo } from "react";
import { useKeyboard } from "@opentui/react";
import { homedir } from "os";
import { join } from "path";
import { existsSync, readdirSync } from "fs";
import { themeColors } from "../shared/colors";
import { useViewRouter } from "../provider/ViewRouter";
import { useProjectManager } from "../provider";

interface LoadProjectViewProps {
  onBack?: () => void;
}

interface ProjectInfo {
  name: string;
  path: string;
  description?: string;
}

const LoadProjectView = (props: LoadProjectViewProps) => {
  const router = useViewRouter();
  const projectManager = useProjectManager();

  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Scan for existing projects
  const scanProjects = useCallback(async () => {
    const projectsDir = join(homedir(), "kenji-projects");
    setStatusMessage("🔄 Scanning for projects...");

    try {
      if (!existsSync(projectsDir)) {
        setStatusMessage("⚠️ No projects directory found. Create a project first.");
        setTimeout(() => setStatusMessage(""), 3000);
        return;
      }

      const items = readdirSync(projectsDir, { withFileTypes: true });
      const foundProjects: ProjectInfo[] = [];

      for (const item of items) {
        if (item.isDirectory()) {
          const projectPath = join(projectsDir, item.name);
          const configPath = join(projectPath, "kenji.config.json");

          if (existsSync(configPath)) {
            // Try to read and validate the config
            try {
              const configFile = Bun.file(configPath);
              const configText = await configFile.text();
              const config = JSON.parse(configText);
              
              // Validate the project before adding it
              if (config.name) {
                foundProjects.push({
                  name: config.name,
                  path: projectPath,
                  description: config.description || "Kenji TUI Project",
                });
              } else {
                console.warn(`Invalid project config in ${projectPath}`);
                foundProjects.push({
                  name: item.name,
                  path: projectPath,
                  description: "⚠️ Invalid configuration",
                });
              }
            } catch (error) {
              console.warn(`Error reading project config in ${projectPath}:`, error);
              // Still add the project but mark it as having issues
              foundProjects.push({
                name: item.name,
                path: projectPath,
                description: "⚠️ Config read error",
              });
            }
          }
        }
      }

      setProjects(foundProjects);

      if (foundProjects.length === 0) {
        setStatusMessage("⚠️ No valid projects found in ~/kenji-projects");
        setTimeout(() => setStatusMessage(""), 3000);
      } else {
        setStatusMessage(`✅ Found ${foundProjects.length} project(s)`);
        setTimeout(() => setStatusMessage(""), 2000);
      }
    } catch (error) {
      setStatusMessage(`⚠️ Could not scan projects: ${error instanceof Error ? error.message : "Unknown error"}`);
      setTimeout(() => setStatusMessage(""), 3000);
    }
  }, []);

  // Load the selected project
  const handleLoad = useCallback(async () => {
    const selectedProject = projects[selectedIndex];
    if (!selectedProject) {
      setStatusMessage("⚠️ No project selected");
      setTimeout(() => setStatusMessage(""), 3000);
      return;
    }

    if (selectedProject.description?.startsWith("⚠️")) {
      setStatusMessage("❌ Cannot load project with configuration errors");
      setTimeout(() => setStatusMessage(""), 3000);
      return;
    }

    setIsLoading(true);
    setStatusMessage(`🔄 Loading "${selectedProject.name}"...`);

    try {
      const config = await projectManager.loadProject(selectedProject.path);
      
      if (!config) {
        throw new Error("Failed to load project configuration");
      }

      console.log("Debug - Project loaded successfully:", { 
        name: config.name, 
        path: selectedProject.path,
        currentProject: projectManager.getCurrentProject()?.name 
      });

      setStatusMessage(
        `✅ Project "${selectedProject.name}" loaded successfully!`,
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
  }, [projects, selectedIndex, projectManager, router]);

  useEffect(() => {
    scanProjects();
  }, [scanProjects]);

  // Keyboard handling
  useKeyboard((key) => {
    if (isLoading) return;

    if (key.name === "escape") {
      if (props.onBack) {
        props.onBack();
      } else {
        router.goBack();
      }
    } else if (key.name === "e" && key.ctrl) {
      handleLoad();
    } else if (key.name === "upArrow") {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : projects.length - 1));
    } else if (key.name === "downArrow") {
      setSelectedIndex((prev) => (prev < projects.length - 1 ? prev + 1 : 0));
    } else if (key.name === "return") {
      handleLoad();
    } else if (key.name === "r" && !key.ctrl) {
      scanProjects();
    }
  });

  return (
    <group
      style={{
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Header */}
      <group
        style={{
          flexDirection: "column",
          padding: 1,
        }}
      >
        <text
          style={{
            fg: themeColors.hex.accent,
          }}
        >
          ┌─ 📂 Load Project ──────────────────────────────────────┐
        </text>
        <text
          style={{
            fg: themeColors.hex.muted,
            marginTop: 0,
          }}
        >
          │ Select a Kenji project to load from ~/kenji-projects │
        </text>
        <text
          style={{
            fg: "#666666",
          }}
        >
          └───────────────────────────────────────────────────────┘
        </text>
      </group>

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

        {/* Projects List */}
        <box
          title="Available Projects"
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
            {projects.map((project, index) => (
              <group
                key={project.path}
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
                  }}
                >
                  {project.name}
                </text>
                {project.description &&
                  project.description !== "No description" && (
                    <text
                      style={{
                        fg:
                          selectedIndex === index
                            ? "#CCCCCC"
                            : themeColors.hex.muted,
                        marginLeft: 2,
                      }}
                    >
                      • {project.description}
                    </text>
                  )}
              </group>
            ))}
            {projects.length === 0 && (
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
                  📁 No projects found
                </text>
                <text
                  style={{
                    fg: themeColors.hex.muted,
                    marginTop: 0,
                  }}
                >
                  Create your first project to get started
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
          ↑↓ Navigate • Enter/Ctrl+E Load • R Refresh • ESC Cancel
        </text>
      </group>
    </group>
  );
};

export default memo(LoadProjectView);
