import { useState, memo } from "react";
import { homedir } from "os";
import { join } from "path";
import { useViewRouter } from "../../provider/ViewRouter";
import Form from "../../components/Form";
import FormFields from "./FormFields";
import { useTerminalDimensionsContext, useProjectManager } from "../../provider";
const CreateProjectView = () => {
  const router = useViewRouter();
  const projectManager = useProjectManager();
  const [statusMessage, setStatusMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const { width, height } = useTerminalDimensionsContext()

  // Handle form submission
  const handleSubmit = async (formData: Record<string, string>) => {
    setStatusMessage("🔨 Creating project...");
    setIsCreating(true);

    try {
      await projectManager.createProject(
        formData.name || "My Game",
        formData.path || join(homedir(), "kenji-projects"),
      );

      // Update the created project with additional metadata
      projectManager.updateConfig({
        description: formData.description,
        author: formData.author,
        export: {
          platform: formData.platform as "itch.io" | "standalone" | "web",
          bundled: true,
          outputDir: "dist",
        },
      });

      await projectManager.saveProject();

      setStatusMessage(`✅ Project "${formData.name}" created successfully!`);
      setTimeout(() => {
        router.navigate("game");
      }, 2000);
    } catch (error) {
      setIsCreating(false);
      throw error; // Let Form component handle the error
    }
  };

  return (<group
    style={{
      flexDirection: "column",
      height,
      width
    }}
  >
    
    <Form

      title="Create Project"
      subtitle="Fill in the details to create a new Kenji project"
      fields={FormFields}
      onSubmit={handleSubmit}
      onCancel={() => router.goBack()}
      submitLabel="Create"
      submitShortcut="Ctrl+E"
      statusMessage={statusMessage}
      isSubmitting={isCreating}
      groupStyle={{

      }}
    />
  </group>

  );
};

export default memo(CreateProjectView);
