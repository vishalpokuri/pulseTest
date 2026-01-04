import React, { useEffect, useRef, useState } from "react";

type PopoverPosition = "bottom" | "top" | "left" | "right";

type PopoverProps = {
  trigger: React.ReactNode;
  children: React.ReactNode;
  position?: PopoverPosition;
  align?: "start" | "center" | "end";
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const Popover: React.FC<PopoverProps> = ({
  trigger,
  children,
  position = "bottom",
  align = "end",
  className = "",
  open: controlledOpen,
  onOpenChange,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    const newOpen = !isOpen;
    if (isControlled) {
      onOpenChange?.(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };

  const handleClose = () => {
    if (isControlled) {
      onOpenChange?.(false);
    } else {
      setInternalOpen(false);
    }
  };

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const getPositionStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: "absolute",
      zIndex: 50,
    };

    switch (position) {
      case "bottom":
        baseStyles.top = "calc(100% + 8px)";
        if (align === "start") baseStyles.left = 0;
        if (align === "center") baseStyles.left = "50%";
        if (align === "end") baseStyles.right = 0;
        if (align === "center") baseStyles.transform = "translateX(-50%)";
        break;
      case "top":
        baseStyles.bottom = "calc(100% + 8px)";
        if (align === "start") baseStyles.left = 0;
        if (align === "center") baseStyles.left = "50%";
        if (align === "end") baseStyles.right = 0;
        if (align === "center") baseStyles.transform = "translateX(-50%)";
        break;
      case "left":
        baseStyles.right = "calc(100% + 8px)";
        if (align === "start") baseStyles.top = 0;
        if (align === "center") baseStyles.top = "50%";
        if (align === "end") baseStyles.bottom = 0;
        if (align === "center") baseStyles.transform = "translateY(-50%)";
        break;
      case "right":
        baseStyles.left = "calc(100% + 8px)";
        if (align === "start") baseStyles.top = 0;
        if (align === "center") baseStyles.top = "50%";
        if (align === "end") baseStyles.bottom = 0;
        if (align === "center") baseStyles.transform = "translateY(-50%)";
        break;
    }

    return baseStyles;
  };

  return (
    <div className="relative inline-block">
      <div ref={triggerRef} onClick={handleToggle} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          ref={popoverRef}
          className={`absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-1 min-w-[160px] animate-[popoverFadeIn_0.15s_ease-out] ${className}`}
          style={getPositionStyles()}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default Popover;
