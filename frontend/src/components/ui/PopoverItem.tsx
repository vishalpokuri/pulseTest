import React from "react";

type PopoverItemProps = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  destructive?: boolean;
  icon?: React.ReactNode;
};

const PopoverItem: React.FC<PopoverItemProps> = ({
  children,
  onClick,
  className = "",
  destructive = false,
  icon,
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border-none cursor-pointer text-left transition-colors ${
        destructive
          ? "text-red-500 hover:bg-red-50"
          : "text-gray-700 hover:bg-gray-100"
      } ${className}`}
    >
      {icon && <span className="flex items-center">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

export default PopoverItem;
