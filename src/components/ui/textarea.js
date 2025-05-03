import React from "react";
import clsx from "clsx";

export function Textarea({
  value,
  onChange,
  placeholder,
  className = "",
  rows = 5,
  id,
  ...props
}) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={clsx(
        "w-full p-3 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 transition",
        className
      )}
      {...props}
    />
  );
}
