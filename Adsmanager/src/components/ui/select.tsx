/* eslint-disable react/button-has-type */
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, disabled, onChange, value, defaultValue, name, ...props }, ref) => {
    const wrapperRef = React.useRef<HTMLDivElement | null>(null);
    const hiddenSelectRef = React.useRef<HTMLSelectElement | null>(null);

    // Keep a local value for the visual trigger when the field is uncontrolled (RHF register).
    const initialValue =
      value !== undefined
        ? String(value)
        : defaultValue !== undefined
          ? String(defaultValue)
          : "";

    const [open, setOpen] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState<string>(initialValue);

    const selectedValue = value !== undefined ? String(value) : internalValue;

    const selectedOption = options.find((o) => o.value === selectedValue);
    const triggerLabel = selectedValue === "" && placeholder ? placeholder : selectedOption?.label ?? "—";

    React.useEffect(() => {
      if (value !== undefined) setInternalValue(String(value));
    }, [value]);

    React.useEffect(() => {
      if (!open) return;
      const onPointerDown = (e: PointerEvent) => {
        const el = wrapperRef.current;
        if (!el) return;
        if (!el.contains(e.target as Node)) setOpen(false);
      };
      document.addEventListener("pointerdown", onPointerDown);
      return () => document.removeEventListener("pointerdown", onPointerDown);
    }, [open]);

    const setValueAndNotify = (nextValue: string) => {
      if (value === undefined) setInternalValue(nextValue);
      const nextEvent = {
        // Match the minimal shape RHF expects.
        target: { value: nextValue, name },
      } as unknown as React.ChangeEvent<HTMLSelectElement>;
      onChange?.(nextEvent);
      setOpen(false);
    };

    const listboxId = React.useId();

    return (
      <div ref={wrapperRef} className="relative">
        {/* Hidden native select keeps RHF integration working; the visible trigger is fully custom. */}
        <select
          ref={(node) => {
            hiddenSelectRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) (ref as React.MutableRefObject<HTMLSelectElement | null>).current = node;
          }}
          name={name}
          disabled={disabled}
          value={value !== undefined ? value : internalValue}
          onChange={onChange}
          className="sr-only"
          aria-hidden="true"
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          className={cn(
            "flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            disabled ? "cursor-not-allowed" : "cursor-pointer",
            className
          )}
          onClick={() => setOpen((v) => !v)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setOpen((v) => !v);
            }
          }}
        >
          <span className={cn("truncate", selectedValue === "" && placeholder ? "text-muted-foreground" : "text-foreground")}>
            {triggerLabel}
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="shrink-0 opacity-70"
          >
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {open && (
          <div
            id={listboxId}
            role="listbox"
            aria-label={placeholder ?? name ?? "Select"}
            className="absolute z-50 mt-1 w-full overflow-auto rounded-md border border-border/60 bg-card backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
          >
            {placeholder && (
              <button
                type="button"
                role="option"
                aria-selected={selectedValue === ""}
                className={cn(
                  "w-full px-3 py-2 text-left text-sm transition-colors",
                  selectedValue === "" ? "bg-accent/40 text-accent-foreground" : "hover:bg-accent/30"
                )}
                onClick={() => setValueAndNotify("")}
              >
                {placeholder}
              </button>
            )}
            {options.map((opt) => {
              const isSelected = opt.value === selectedValue;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm transition-colors",
                    isSelected ? "bg-accent/40 text-accent-foreground" : "hover:bg-accent/30"
                  )}
                  onClick={() => setValueAndNotify(opt.value)}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
