import { memo } from "react";
import { themeColors } from "../shared/colors";
import packageJson from "../../package.json";

function VersionNumber(props: any) {
  return (
    <box
      style={
        props.boxStyle
          ? props.boxStyle
          : {
              flexDirection: "row",
              justifyContent: "flex-end",
              width: "100%",
            }
      }
    >
      <text
        style={
          props.textStyle
            ? props.textStyle
            : {
                flexDirection: "row",
                justifyContent: "flex-end",
                width: "100%",
                fg: themeColors.hex.muted,
              }
        }
      >
        v{packageJson.version}
      </text>
    </box>
  );
}

export default memo(VersionNumber);
