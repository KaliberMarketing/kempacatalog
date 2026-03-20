"use client";

import { Label } from "@/components/ui/label";

interface FormFieldProps {
  label: string;
  /** RHF / Zod may pass a wider inferred type than `FieldError`; we only read `message`. */
  error?: { message?: string };
  children: React.ReactNode;
  required?: boolean;
}

export function FormField({ label, error, children, required }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-xs text-destructive">{error.message}</p>
      )}
    </div>
  );
}
