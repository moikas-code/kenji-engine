import { useState, useCallback, useMemo, memo, useEffect } from "react";
import type { ReactNode } from "react";
import { useKeyboard } from "@opentui/react";
import { themeColors } from "../../shared/colors";
import { useTerminalDimensionsContext, useViewRouter } from "../../provider";
import Header from "../Header";

export interface FormField {
  id: string;
  label: string;
  placeholder: string;
  defaultValue?: string;
  required?: boolean;
  type?: "text" | "number" | "select";
  options?: string[];
  validation?: (value: string) => string | null;
}

export interface FormProps {
  title?: string;
  subtitle?: string;
  fields: FormField[];
  onSubmit: (formData: Record<string, string>) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
  submitShortcut?: string;
  statusMessage?: string;
  isSubmitting?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  footerContent?: ReactNode;
  groupStyle?: {
    [key: string]: any;
  };
}

const Form = memo(
  ({
    title = "Form",
    subtitle,
    fields,
    onSubmit,
    onCancel,
    submitLabel = "Submit",
    submitShortcut = "Ctrl+E",
    statusMessage: externalStatusMessage,
    isSubmitting: externalIsSubmitting,
    showHeader = true,
    showFooter = true,
    footerContent,
    groupStyle = {},
  }: FormProps) => {
    const memoizedFields = useMemo(() => fields, [fields]);
    const { width, height } = useTerminalDimensionsContext();
    const { setInputFocused } = useViewRouter();
    const [formData, setFormData] = useState<Record<string, string>>(
      memoizedFields.reduce(
        (acc, field) => ({
          ...acc,
          [field.id]: field.defaultValue || "",
        }),
        {},
      ),
    );

    const [focusedFieldIndex, setFocusedFieldIndex] = useState(0);
    const [internalIsSubmitting, setInternalIsSubmitting] = useState(false);
    const [internalStatusMessage, setInternalStatusMessage] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    // Track whether any field is focused
    useEffect(() => {
      setInputFocused(
        focusedFieldIndex >= 0 && focusedFieldIndex < memoizedFields.length,
      );

      // Clean up on unmount
      return () => {
        setInputFocused(false);
      };
    }, [focusedFieldIndex, memoizedFields.length, setInputFocused]);

    const isSubmitting = externalIsSubmitting ?? internalIsSubmitting;
    const statusMessage = externalStatusMessage ?? internalStatusMessage;

    const updateField = useCallback(
      (id: string, value: string) => {
        setFormData((prev) => ({
          ...prev,
          [id]: value,
        }));

        const field = memoizedFields.find((f) => f.id === id);
        if (field?.validation) {
          const error = field.validation(value);
          setFieldErrors((prev) => ({
            ...prev,
            [id]: error || "",
          }));
        }
      },
      [memoizedFields],
    );

    const validateForm = useCallback(() => {
      const errors: Record<string, string> = {};
      let isValid = true;

      for (const field of memoizedFields) {
        const value = formData[field.id];

        if (field.required && !value?.trim()) {
          errors[field.id] = `${field.label} is required`;
          isValid = false;
        } else if (field.validation && value) {
          const error = field.validation(value);
          if (error) {
            errors[field.id] = error;
            isValid = false;
          }
        }
      }

      setFieldErrors(errors);
      return isValid;
    }, [memoizedFields, formData]);

    const handleSubmit = useCallback(async () => {
      if (!validateForm()) {
        setInternalStatusMessage("⚠️ Please fix the errors in the form");
        setTimeout(() => setInternalStatusMessage(""), 3000);
        return;
      }

      setInternalIsSubmitting(true);
      setInternalStatusMessage("🔄 Processing...");

      try {
        await onSubmit(formData);
        setInternalStatusMessage("✅ Success!");
        setTimeout(() => setInternalStatusMessage(""), 3000);
      } catch (error) {
        setInternalStatusMessage(
          `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
        setTimeout(() => setInternalStatusMessage(""), 5000);
      } finally {
        setInternalIsSubmitting(false);
      }
    }, [validateForm, formData, onSubmit]);

    useKeyboard((key) => {
      if (isSubmitting) return;

      if (key.name === "tab") {
        if (key.shift) {
          setFocusedFieldIndex((prev) =>
            prev > 0 ? prev - 1 : memoizedFields.length - 1,
          );
        } else {
          setFocusedFieldIndex((prev) => (prev + 1) % memoizedFields.length);
        }
      } else if (key.name === "escape" && onCancel) {
        onCancel();
      } else if (key.name === "e" && key.ctrl) {
        // Use Ctrl+E for submit as specified in submitShortcut
        handleSubmit();
      }
    });

    const renderStatusIcon = (message: string) => {
      if (message.startsWith("✅")) return "✓";
      if (message.startsWith("❌")) return "✗";
      if (message.startsWith("⚠️")) return "⚠";
      if (message.startsWith("🔄")) return "⟳";
      return "ℹ";
    };

    const getStatusColor = (message: string) => {
      if (message.startsWith("✅")) return themeColors.hex.success;
      if (message.startsWith("❌")) return "#FF453A";
      if (message.startsWith("⚠️")) return "#FF9F0A";
      return themeColors.hex.accent;
    };

    return (
      <group
        style={
          groupStyle
            ? groupStyle
            : {
                flexDirection: "column",
                height: "100%",
                width: "100%",
              }
        }
      >
        {showHeader && <Header title={title} subtitle={subtitle} />}

        <group
          style={{
            flexDirection: "column",
          }}
        >
          <text
            style={{
              fg: themeColors.hex.muted,
            }}
          >
            * Required fields • Tab/Shift+Tab Navigate
          </text>
        </group>
        <group
          style={{
            flexDirection: "column",
            padding: 1,
            width: "100%",
          }}
        >
          {statusMessage && (
            <group
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 1,
                marginBottom: 1,
              }}
            >
              <text
                style={{
                  fg: getStatusColor(statusMessage),
                }}
              >
                {renderStatusIcon(statusMessage)}
              </text>
              <text
                style={{
                  fg: "#FFFFFF",
                  marginLeft: 1,
                }}
              >
                {statusMessage.substring(statusMessage.indexOf(" ") + 1)}
              </text>
            </group>
          )}

          <group
            style={{
              flexDirection: "column",
            }}
          >
            {memoizedFields.map((field, index) => (
              <group
                key={field.id}
                style={{
                  flexDirection: "column",
                  marginBottom: 0,
                }}
              >
                <group
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <text
                    style={{
                      fg: fieldErrors[field.id]
                        ? "#FF453A"
                        : themeColors.hex.accent,
                    }}
                  >
                    {field.label}
                    {field.required ? " *" : ""}
                  </text>
                  {fieldErrors[field.id] && (
                    <text
                      style={{
                        fg: "#FF453A",
                        marginLeft: 2,
                      }}
                    >
                      ({fieldErrors[field.id]})
                    </text>
                  )}
                </group>
                <box
                  style={{
                    width: 70,
                    height: 1,
                    borderColor: fieldErrors[field.id]
                      ? "#FF453A"
                      : focusedFieldIndex === index
                        ? themeColors.hex.accent
                        : "#666666",
                  }}
                >
                  {field.type === "select" ? (
                    <select
                      options={
                        field.options?.map((opt) => ({
                          name: opt,
                          description: "",
                          value: opt,
                          selected: opt === formData[field.id],
                        })) || []
                      }
                      focused={focusedFieldIndex === index}
                      onSelect={(_index: number, option: any) =>
                        updateField(field.id, option.value || option)
                      }
                    />
                  ) : (
                    <input
                      placeholder={field.placeholder}
                      value={formData[field.id]}
                      focused={focusedFieldIndex === index}
                      onInput={(value: any) => updateField(field.id, value)}
                      onSubmit={() => {
                        if (index < memoizedFields.length - 1) {
                          setFocusedFieldIndex(index + 1);
                        } else {
                          handleSubmit();
                        }
                      }}
                    />
                  )}
                </box>
              </group>
            ))}
          </group>
        </group>
        <group
          style={{
            flexDirection: "column",
          }}
        >
          <text>
            • Enter Next • {submitShortcut} {submitLabel}{" "}
            {onCancel ? "• ESC Cancel" : ""}
          </text>
        </group>
      </group>
    );
  },
);

Form.displayName = "Form";

export default Form;
