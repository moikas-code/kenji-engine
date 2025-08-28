import type { FormField } from "../types";

// Unified validation system (DRY - eliminates duplication between validateField and validateAllFields)
export const validateFieldValue = (field: FormField, value: any): string | null => {
  if (field.required && (!value || value.toString().trim() === "")) {
    return `${field.label} is required`;
  }

  if (field.type === "number") {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return `${field.label} must be a number`;
    }
    if (field.min !== undefined && numValue < field.min) {
      return `${field.label} must be at least ${field.min}`;
    }
    if (field.max !== undefined && numValue > field.max) {
      return `${field.label} must be at most ${field.max}`;
    }
  }

  return null; // Valid
};

export const validateFields = (
  fields: FormField[],
  getFieldValue: (fieldId: string) => string,
  fieldId?: string
): Record<string, string> => {
  const errors: Record<string, string> = {};

  fields.forEach(field => {
    // If fieldId is provided, only validate that specific field
    if (fieldId && field.id !== fieldId) return;

    const value = getFieldValue(field.id);
    const error = validateFieldValue(field, value);

    if (error) {
      errors[field.id] = error;
    } else {
      delete errors[field.id]; // Remove any existing error
    }
  });

  return errors;
};

// Validate all fields and return whether validation passed
export const validateAllFields = (
  fields: FormField[],
  getFieldValue: (fieldId: string) => string
): boolean => {
  const errors = validateFields(fields, getFieldValue);
  return Object.keys(errors).length === 0;
};

// Validate single field
export const validateSingleField = (
  fields: FormField[],
  getFieldValue: (fieldId: string) => string,
  fieldId: string
): Record<string, string> => {
  return validateFields(fields, getFieldValue, fieldId);
};