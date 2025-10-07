import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  fallbackText?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showFallbackIcon?: boolean;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  alt = "User avatar",
  fallbackText,
  size = "md",
  className,
  showFallbackIcon = true,
}) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8", 
    lg: "h-10 w-10",
    xl: "h-12 w-12",
  };

  const iconSizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5", 
    xl: "h-6 w-6",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  };

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {src && (
        <AvatarImage 
          src={src} 
          alt={alt}
          className="object-cover"
        />
      )}
      <AvatarFallback className={cn("bg-muted", textSizeClasses[size])}>
        {fallbackText ? (
          <span className="font-medium">{fallbackText}</span>
        ) : (
          showFallbackIcon && <User className={iconSizeClasses[size]} />
        )}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;