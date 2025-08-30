import React from "react";
import clsx from "clsx";

export const Card = ({ className = "", children, ...props }) => {
  return (
    <div
      className={clsx(
        "bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardContent = ({ className = "", children, ...props }) => {
  return (
    <div className={clsx("p-4", className)} {...props}>
      {children}
    </div>
  );
};
