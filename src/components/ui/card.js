import React from "react";
import clsx from "clsx";

export function Card({ children, className = "" }) {
  return (
    <div
      className={clsx(
        "bg-white dark:bg-zinc-900 rounded-2xl shadow-md p-6",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }) {
  return <div className={clsx("mt-4", className)}>{children}</div>;
}
