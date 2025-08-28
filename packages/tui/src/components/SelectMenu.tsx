import { memo, useCallback } from "react";

export interface SelectMenuProps {
  focused?: boolean;
  showScrollIndicator?: boolean;
  wrapSelection?: boolean;
  groupStyle?: {
    [key: string]: any;
  };
  menuStyle?: {
    width: number|`${number}%`;
    height: number|`${number}%`;
    maxHeight: number;
    backgroundColor: string;
    focusedBackgroundColor: string;
    selectedBackgroundColor: string;
    selectedTextColor: string;
    descriptionColor: string;
    marginTop?: number;
    [key: string]: any;
  };
  options: {
    name: string;
    description: string;
    value: string;
  }[];
  onSelect: (value: string) => void;
}

const SelectMenu = memo((props: SelectMenuProps) => {
  const handleSelect = useCallback((index: number) => {
    const option = props.options[index];
    if (option) {
      props.onSelect(option.value);
    }
  }, [props.options, props.onSelect]);

  return (
    <group style={props.groupStyle || {}}>
      <select
        focused={props.focused || false}
        onSelect={handleSelect}
        options={props.options || []}
        style={props.menuStyle || {}}
        showScrollIndicator
        wrapSelection
      />
    </group>
  );
});

SelectMenu.displayName = 'SelectMenu';

export default SelectMenu;
