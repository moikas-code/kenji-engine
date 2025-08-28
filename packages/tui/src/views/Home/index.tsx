import { memo, useCallback } from "react";
import Logo from "../../components/Logo";
import VersionNumber from "../../components/VersionNumber";
import SelectMenu from "../../components/SelectMenu";
import { themeColors } from "../../shared/colors";
import { useViewRouter } from "../../provider/ViewRouter";
import { useTerminalDimensionsContext } from "../../provider";
import { useKeybinds } from "../../keybinds";
const MENU_OPTIONS = [
  {
    name: "New",
    description: "New Project",
    value: "create",
  },
  {
    name: "Load",
    description: "Load Project",
    value: "load",
  },
];

const Home = () => {
  const router = useViewRouter();
  const { width, height } = useTerminalDimensionsContext();

  // Register home-specific keybinds
  useKeybinds(
    {
      "navigate:create": useCallback(() => {
        router.navigate("create");
      }, [router]),
      "navigate:load": useCallback(() => {
        router.navigate("load");
      }, [router]),
    },
    { context: "home" },
  );

  return (
    <box
      style={{
        position: "relative",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width,
        height,
        border: true,
        borderColor: themeColors.hex.accent,
      }}
    >
      {/*HEADER*/}
      <box
        style={{
          flexDirection: "column",
          // marginTop: -10,
          border: ["bottom"],
        }}
      >
        <Logo />
        <VersionNumber />
      </box>

      <SelectMenu
        focused
        onSelect={(value: string) => {
          router.navigate(value);
        }}
        options={MENU_OPTIONS}
        groupStyle={{
          minHeight: 5,
          marginTop: 0.5,
          marginBottom: 0.5,
        }}
        menuStyle={{
          width: 30,
          minHeight: 5,
          height: "100%",
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
          position: "absolute",
          bottom: 0,
          left: "auto",
          right: "auto",
          bg: themeColors.hex.selectedBg,
          fg: themeColors.hex.muted,
        }}
      >
        Use ↑/↓ arrows • Enter to select • Q to quit
      </text>
    </box>
  );
};

export default memo(Home);
