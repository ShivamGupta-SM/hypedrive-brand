/**
 * React Select - Themed wrapper for react-select
 * Provides searchable, multi-select dropdowns with dark mode support
 */

import Select, {
  type Props as SelectProps,
  type GroupBase,
  type StylesConfig,
  type ClassNamesConfig,
} from "react-select";
import clsx from "clsx";

export type { Props as ReactSelectProps } from "react-select";
export type SelectOption = { value: string; label: string };

// Custom styles that integrate with Catalyst/Tailwind design system
function getSelectStyles<
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>
>(): StylesConfig<Option, IsMulti, Group> {
  return {
    control: (base, state) => ({
      ...base,
      backgroundColor: "transparent",
      borderColor: state.isFocused
        ? "rgb(59 130 246)" // blue-500
        : "rgb(228 228 231)", // zinc-200
      borderRadius: "0.5rem",
      boxShadow: state.isFocused ? "0 0 0 2px rgb(59 130 246 / 0.2)" : "none",
      minHeight: "38px",
      "&:hover": {
        borderColor: state.isFocused
          ? "rgb(59 130 246)"
          : "rgb(212 212 216)", // zinc-300
      },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "white",
      borderRadius: "0.75rem",
      border: "1px solid rgb(228 228 231)",
      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      zIndex: 50,
      overflow: "hidden",
    }),
    menuList: (base) => ({
      ...base,
      padding: "4px",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "rgb(59 130 246)"
        : state.isFocused
          ? "rgb(244 244 245)" // zinc-100
          : "transparent",
      color: state.isSelected ? "white" : "rgb(24 24 27)", // zinc-950
      borderRadius: "0.375rem",
      padding: "8px 12px",
      cursor: "pointer",
      "&:active": {
        backgroundColor: state.isSelected
          ? "rgb(59 130 246)"
          : "rgb(228 228 231)",
      },
    }),
    singleValue: (base) => ({
      ...base,
      color: "rgb(24 24 27)",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "rgb(244 244 245)",
      borderRadius: "0.375rem",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "rgb(24 24 27)",
      padding: "2px 6px",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "rgb(113 113 122)",
      "&:hover": {
        backgroundColor: "rgb(228 228 231)",
        color: "rgb(24 24 27)",
      },
    }),
    placeholder: (base) => ({
      ...base,
      color: "rgb(161 161 170)", // zinc-400
    }),
    input: (base) => ({
      ...base,
      color: "rgb(24 24 27)",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    dropdownIndicator: (base, state) => ({
      ...base,
      color: "rgb(161 161 170)",
      padding: "8px",
      transition: "transform 0.2s ease",
      transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : undefined,
      "&:hover": {
        color: "rgb(113 113 122)",
      },
    }),
    clearIndicator: (base) => ({
      ...base,
      color: "rgb(161 161 170)",
      padding: "8px",
      "&:hover": {
        color: "rgb(113 113 122)",
      },
    }),
    loadingIndicator: (base) => ({
      ...base,
      color: "rgb(161 161 170)",
    }),
    noOptionsMessage: (base) => ({
      ...base,
      color: "rgb(113 113 122)",
    }),
  };
}

// Dark mode styles
function getDarkSelectStyles<
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>
>(): StylesConfig<Option, IsMulti, Group> {
  return {
    control: (base, state) => ({
      ...base,
      backgroundColor: "rgb(255 255 255 / 0.05)",
      borderColor: state.isFocused
        ? "rgb(59 130 246)"
        : "rgb(255 255 255 / 0.1)",
      borderRadius: "0.5rem",
      boxShadow: state.isFocused ? "0 0 0 2px rgb(59 130 246 / 0.2)" : "none",
      minHeight: "38px",
      "&:hover": {
        borderColor: state.isFocused
          ? "rgb(59 130 246)"
          : "rgb(255 255 255 / 0.2)",
      },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "rgb(39 39 42)", // zinc-800
      borderRadius: "0.75rem",
      border: "1px solid rgb(63 63 70)", // zinc-700
      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.2)",
      zIndex: 50,
      overflow: "hidden",
    }),
    menuList: (base) => ({
      ...base,
      padding: "4px",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "rgb(59 130 246)"
        : state.isFocused
          ? "rgb(63 63 70)" // zinc-700
          : "transparent",
      color: state.isSelected ? "white" : "rgb(244 244 245)", // zinc-100
      borderRadius: "0.375rem",
      padding: "8px 12px",
      cursor: "pointer",
      "&:active": {
        backgroundColor: state.isSelected
          ? "rgb(59 130 246)"
          : "rgb(82 82 91)", // zinc-600
      },
    }),
    singleValue: (base) => ({
      ...base,
      color: "rgb(244 244 245)",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "rgb(63 63 70)",
      borderRadius: "0.375rem",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "rgb(244 244 245)",
      padding: "2px 6px",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "rgb(161 161 170)",
      "&:hover": {
        backgroundColor: "rgb(82 82 91)",
        color: "rgb(244 244 245)",
      },
    }),
    placeholder: (base) => ({
      ...base,
      color: "rgb(113 113 122)", // zinc-500
    }),
    input: (base) => ({
      ...base,
      color: "rgb(244 244 245)",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    dropdownIndicator: (base, state) => ({
      ...base,
      color: "rgb(113 113 122)",
      padding: "8px",
      transition: "transform 0.2s ease",
      transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : undefined,
      "&:hover": {
        color: "rgb(161 161 170)",
      },
    }),
    clearIndicator: (base) => ({
      ...base,
      color: "rgb(113 113 122)",
      padding: "8px",
      "&:hover": {
        color: "rgb(161 161 170)",
      },
    }),
    loadingIndicator: (base) => ({
      ...base,
      color: "rgb(113 113 122)",
    }),
    noOptionsMessage: (base) => ({
      ...base,
      color: "rgb(161 161 170)",
    }),
  };
}

interface ReactSelectComponentProps<
  Option = SelectOption,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
> extends Omit<SelectProps<Option, IsMulti, Group>, "styles"> {
  /** Container class name */
  containerClassName?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Error state */
  error?: boolean;
  /** Dark mode (auto-detected from document if not provided) */
  darkMode?: boolean;
}

export function ReactSelect<
  Option = SelectOption,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>({
  containerClassName,
  size = "md",
  error,
  darkMode,
  classNames,
  ...props
}: ReactSelectComponentProps<Option, IsMulti, Group>) {
  // Auto-detect dark mode if not provided
  const isDark = darkMode ?? (typeof document !== "undefined" && document.documentElement.classList.contains("dark"));

  const styles = isDark ? getDarkSelectStyles<Option, IsMulti, Group>() : getSelectStyles<Option, IsMulti, Group>();

  // Merge custom styles for size and error state
  const mergedStyles: StylesConfig<Option, IsMulti, Group> = {
    ...styles,
    control: (base, state) => ({
      ...styles.control?.(base, state),
      minHeight: size === "sm" ? "32px" : size === "lg" ? "44px" : "38px",
      borderColor: error
        ? "rgb(239 68 68)" // red-500
        : styles.control?.(base, state)?.borderColor,
    }),
    valueContainer: (base) => ({
      ...base,
      padding: size === "sm" ? "0 8px" : size === "lg" ? "2px 14px" : "2px 12px",
    }),
  };

  const mergedClassNames: ClassNamesConfig<Option, IsMulti, Group> = {
    ...classNames,
    container: (state) =>
      clsx(
        containerClassName,
        typeof classNames?.container === "function"
          ? classNames.container(state)
          : classNames?.container
      ),
  };

  return (
    <Select<Option, IsMulti, Group>
      styles={mergedStyles}
      classNames={mergedClassNames}
      {...props}
    />
  );
}

// Async select for loading options dynamically
export { default as AsyncSelect } from "react-select/async";
export { default as CreatableSelect } from "react-select/creatable";
export { default as AsyncCreatableSelect } from "react-select/async-creatable";
