import { memo } from "react";

interface ExportViewProps {
  onBack: () => void
}

const ExportView = (props: ExportViewProps) => {
  return (
    <group style={{ flexDirection: "column" }}>
      <text style={{ 
        fg: "#FF00FF",
        marginBottom: 2
      }}>
        📦 Export for Distribution
      </text>

      <box title="Package Games for Platforms" style={{ 
        width: 70,
        height: 15,
        marginBottom: 1
      }}>
        <text style={{ 
          fg: "#CCCCCC",
          padding: 2
        }}>
          Package games for platforms:
          {"\n"}
          {"\n"}• itch.io with metadata generation
          {"\n"}• Standalone executables
          {"\n"}• Web builds for browser gaming
          {"\n"}• Cross-platform distribution
          {"\n"}
          {"\n"}Export options will be configured based on
          {"\n"}your project settings and target platform.
        </text>
      </box>

      <text style={{ 
        fg: "#666666",
        marginTop: 2 
      }}>
        ESC to go back
      </text>
    </group>
  )
}

export default memo(ExportView)