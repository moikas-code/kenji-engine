import { memo } from "react";
import Logo from "../components/Logo";
import VersionNumber from "../components/VersionNumber";
import SelectMenu from "../components/SelectMenu";
import { themeColors } from "../shared/colors";
import { useViewRouter } from "../provider/ViewRouter";
import { useTerminalDimensionsContext } from "../provider";
const MENU_OPTIONS = [
  {
    name: "Create New Project",
    description: "Start a new TUI project from scratch",
    value: "create",
  },
  {
    name: "Load Existing Project",
    description: "Open an existing project",
    value: "load",
  }
];

const Home = () => {
  const router = useViewRouter();
  const { width, height } = useTerminalDimensionsContext();
  return (
    <group
      style={{
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width,
        height,
        
      }}
    >
      <group
        style={{
          flexDirection: "column",
          marginTop:-10
        }}
      >
        <Logo />
        <VersionNumber />
      </group>

      <SelectMenu
        focused
        onSelect={(value: string) => {
          router.navigate(value);
        }}
        options={MENU_OPTIONS}
        groupStyle={{
          minHeight:5,
          marginTop: 0.5,
          marginBottom:0.5
        }}
        menuStyle={{
          width: 55,
          minHeight:5,
          height:'100%',
          maxHeight: 10,
          backgroundColor: "transparent",
          focusedBackgroundColor: "transparent",
          selectedBackgroundColor: themeColors.hex.selectedBg,
          selectedTextColor: themeColors.hex.accentBright,
          descriptionColor: themeColors.hex.muted,
          
        }}
        showScrollIndicator
        wrapSelection
      />

      <text
        style={{
          fg: themeColors.hex.muted,
        }}
      >
        Use ↑/↓ arrows • Enter to select • Q to quit
      </text>
    </group>
  );
};

export default memo(Home);
