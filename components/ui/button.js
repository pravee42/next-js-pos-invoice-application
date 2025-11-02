"use client";

import { cn } from "../../lib/utils";

export function Button({
  children,
  className,
  variant = "default",
  size = "default",
  ...props
}) {
  const variants = {
    default: "bg-primary hover:bg-primary-hover text-white",
    outline: "border border-border bg-transparent hover:bg-accent/10",
    ghost: "hover:bg-accent/10",
    danger: "bg-error hover:bg-red-600 text-white",
  };

  const sizes = {
    default: "px-4 py-2 text-sm",
    sm: "px-3 py-1.5 text-xs",
    lg: "px-6 py-3 text-base",
    icon: "p-2",
  };

  return (
    <button
      className={cn(
        "rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
