"use client";

import { useState } from "react";
import { cn } from "../../lib/utils";

export function Dialog({ children, open, onOpenChange }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 bg-card rounded-xl shadow-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-auto">
        {children}
      </div>
    </div>
  );
}

export function DialogContent({ children, className, ...props }) {
  return (
    <div className={cn("p-6", className)} {...props}>
      {children}
    </div>
  );
}

export function DialogHeader({ children, className, ...props }) {
  return (
    <div className={cn("mb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function DialogTitle({ children, className, ...props }) {
  return (
    <h2 className={cn("text-xl font-semibold text-foreground", className)} {...props}>
      {children}
    </h2>
  );
}

export function DialogFooter({ children, className, ...props }) {
  return (
    <div className={cn("flex justify-end gap-2 mt-4", className)} {...props}>
      {children}
    </div>
  );
}

