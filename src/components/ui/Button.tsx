import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "primary" | "ghost" | "danger";
};

export default function Button({
  className = "",
  variant = "default",
  type = "button",
  ...rest
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants: Record<string, string> = {
    default: "bg-gray-200 text-gray-900 hover:bg-gray-300",
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  const cls = `${base} ${variants[variant]} ${className}`;

  return <button type={type} className={cls} {...rest} />;
}
