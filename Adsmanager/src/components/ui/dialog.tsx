"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="relative z-50 w-full max-w-lg">{children}</div>
      </div>
    </div>
  );
}

function DialogContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border/40 bg-card text-card-foreground backdrop-blur-md p-6 shadow-[0_10px_30px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.55)] animate-in fade-in",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 mb-4", className)}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
}

function DialogClose({ onClose }: { onClose: () => void }) {
  return (
    <button
      onClick={onClose}
      className="absolute right-4 top-4 rounded-md p-1.5 opacity-80 cursor-pointer hover:opacity-100 transform-gpu transition-[transform,box-shadow,opacity,background-color] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.12),_inset_-1px_-1px_2px_rgba(255,255,255,0.28)] hover:translate-x-px hover:translate-y-px hover:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.18),_inset_-6px_-6px_12px_rgba(255,255,255,0.08)] hover:bg-accent/50 active:translate-x-px active:translate-y-px"
    >
      <X className="h-4 w-4" />
    </button>
  );
}

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose };
