import { createContext, useContext, ReactNode } from "react";
import { useTerminalDimensions, useRenderer } from "@opentui/react";

interface TerminalLayerContextType {
  renderer: ReturnType<typeof useRenderer>;
  width: number;
  height: number;
  dimensions: { width: number; height: number };
}

const TerminalLayerContext = createContext<TerminalLayerContextType | null>(null);

export const useTerminalLayer = () => {
  const context = useContext(TerminalLayerContext);
  if (!context) {
    throw new Error("useTerminalLayer must be used within a TerminalLayerProvider");
  }
  return context;
};

export const useRendererContext = () => {
  const { renderer } = useTerminalLayer();
  return renderer;
};

export const useTerminalDimensionsContext = () => {
  const { width, height, dimensions } = useTerminalLayer();
  return { width, height, dimensions };
};

interface TerminalLayerProviderProps {
  children: ReactNode;
}

export const TerminalLayerProvider = ({ children }: TerminalLayerProviderProps) => {
  const renderer = useRenderer();
  const { width, height } = useTerminalDimensions();

  const value: TerminalLayerContextType = {
    renderer,
    width,
    height,
    dimensions: { width, height },
  };

  return (
    <TerminalLayerContext.Provider value={value}>
      {children}
    </TerminalLayerContext.Provider>
  );
};