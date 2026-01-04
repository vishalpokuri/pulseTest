import React from "react";

type AvatarProps = {
  src?: string;
  alt?: string;
  size?: number;
  fallback?: React.ReactNode;
  className?: string;
};

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "Avatar",
  size = 32,
  fallback,
  className = "",
}) => {
  return (
    <div
      className={`rounded-full overflow-hidden inline-block bg-gray-200 relative ${className}`}
      style={{
        width: size,
        height: size,
      }}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover block" />
      ) : (
        fallback || (
          <span
            className="w-full h-full flex items-center justify-center text-gray-500 font-bold"
            style={{
              fontSize: size / 2,
            }}
          >
            X
          </span>
        )
      )}
    </div>
  );
};

export default Avatar;
