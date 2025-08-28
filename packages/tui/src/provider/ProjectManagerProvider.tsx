import React, { createContext, useContext, useRef } from "react";
import { ProjectManager } from "../../../kenji";

interface ProjectManagerContextType {
  projectManager: ProjectManager;
}

const ProjectManagerContext = createContext<ProjectManagerContextType | null>(null);

export const ProjectManagerProvider = ({ children }: { children: React.ReactNode }) => {
  const projectManager = useRef(new ProjectManager()).current;

  return (
    <ProjectManagerContext.Provider value={{ projectManager }}>
      {children}
    </ProjectManagerContext.Provider>
  );
};

export const useProjectManager = () => {
  const context = useContext(ProjectManagerContext);
  if (!context) {
    throw new Error("useProjectManager must be used within a ProjectManagerProvider");
  }
  return context.projectManager;
};