import { useState, useMemo, memo } from "react";
import type { ReactNode } from "react";
import { themeColors } from "../../shared/colors";
import { useTerminalDimensionsContext } from "../../provider";

export interface HeaderProps {
  title?: string;
  subtitle?: string;
}

const Header = memo(({ title = "Header", subtitle }: HeaderProps) => {
  const { width } = useTerminalDimensionsContext();

  return (
    <group
      style={{
        flexDirection: "column",
      }}
    >
      <text
        style={{
          fg: themeColors.hex.accent,
        }}
      >
        ┌─ {title} {"─".repeat(Math.max(0, width - title.length - 6))}┐
      </text>
      {subtitle && (
        <text
          style={{
            fg: themeColors.hex.muted,
            marginTop: 0,
          }}
        >
          │ {subtitle.padEnd(width - 5)} │
        </text>
      )}
      <text
        style={{
          fg: "#666666",
        }}
      >
        └{"─".repeat(width - 3)}┘
      </text>
    </group>
  );
});

Header.displayName = "Header";

export default Header;
