import { STATUS_MESSAGE_DURATION } from "../types";

// Centralized status message handler (DRY - eliminates repeated setTimeout calls)
export const createStatusMessageHandler = (
  setSaveStatus: (message: string) => void
) => {
  return (message: string, duration: number = STATUS_MESSAGE_DURATION) => {
    setSaveStatus(message);
    if (duration > 0) {
      setTimeout(() => setSaveStatus(''), duration);
    }
  };
};

// Status message handler type
export type StatusMessageHandler = (message: string, duration?: number) => void;