import type { ReactNode } from 'react';
import { themeColors } from '../shared/colors';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

// For now, we'll create a simple wrapper that just renders children
// Real error boundaries require class components which seem to have issues
const ErrorBoundary = ({ children, fallback }: ErrorBoundaryProps) => {
  try {
    return <>{children}</>;
  } catch (error) {
    console.error('🚨 TUI Error:', error);
    return fallback || (
      <box style={{
        height: '100%',
        width: '100%',
        backgroundColor: themeColors.hex.background,
        padding: 2,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <text style={{ fg: '#FF453A', marginBottom: 2 }}>
          ❌ Application Error
        </text>
        <text style={{ fg: themeColors.hex.foreground, marginBottom: 1 }}>
          An unexpected error occurred
        </text>
        <text style={{ fg: themeColors.hex.accent }}>
          Press Ctrl+C to exit
        </text>
      </box>
    );
  }
};

export default ErrorBoundary;