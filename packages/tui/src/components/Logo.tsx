import { measureText, RGBA } from "@opentui/core";
import { memo } from "react";
import { themeColors } from "../shared/colors";

const Logo = () => {
  const titleText = "KENJI";
  const titleFont = "block" as const;
  const { width, height } = measureText({
    text: titleText,
    font: titleFont,
  });

  return (
    <group style={{ flexDirection: "row", alignItems: "center" }}>
      <ascii-font
        text={titleText}
        font={titleFont}
        style={{
          width,
          height,
          fg: RGBA.fromHex(themeColors.hex.accentBright),
        }}
      />
    </group>
  );
};

export default memo(Logo);
