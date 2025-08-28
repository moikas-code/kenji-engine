import { useTerminalDimensionsContext } from "../provider";

/**
 * Hook to get terminal dimensions for loaded projects.
 * This is a wrapper around useTerminalDimensionsContext that provides
 * compatibility for projects that expect a useTerminalDimensions hook.
 */
export const useTerminalDimensions = () => {
  return useTerminalDimensionsContext();
};