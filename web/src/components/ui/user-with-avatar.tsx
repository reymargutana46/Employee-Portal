import React from "react";
import UserAvatar from "@/components/ui/user-avatar";
import { cn } from "@/lib/utils";

interface UserWithAvatarProps {
  user?: {
    fname?: string;
    lname?: string;
    mname?: string;
    extname?: string;
    profile_picture?: string;
    // Alternative naming for different interfaces
    firstname?: string;
    lastname?: string;
    middlename?: string;
    extension?: string;
  };
  size?: "sm" | "md" | "lg" | "xl";
  showFullName?: boolean;
  className?: string;
  avatarClassName?: string;
  nameClassName?: string;
  layout?: "horizontal" | "vertical";
}

const UserWithAvatar: React.FC<UserWithAvatarProps> = ({
  user,
  size = "md",
  showFullName = true,
  className,
  avatarClassName,
  nameClassName,
  layout = "horizontal",
}) => {
  if (!user) return null;

  // Handle different naming conventions
  const firstName = user.fname || user.firstname || "";
  const lastName = user.lname || user.lastname || "";
  const middleName = user.mname || user.middlename || "";
  const extensionName = user.extname || user.extension || "";

  // Generate display name
  const getDisplayName = () => {
    if (showFullName) {
      const parts = [firstName];
      if (middleName) {
        parts.push(middleName.charAt(0) + ".");
      }
      parts.push(lastName);
      if (extensionName) {
        parts.push(extensionName);
      }
      return parts.filter(Boolean).join(" ");
    } else {
      return `${firstName} ${lastName}`.trim();
    }
  };

  // Generate fallback initials
  const getFallbackText = () => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase();
  };

  const displayName = getDisplayName();
  const fallbackText = getFallbackText();

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  };

  if (layout === "vertical") {
    return (
      <div className={cn("flex flex-col items-center gap-2", className)}>
        <UserAvatar
          src={user.profile_picture}
          alt={`${displayName} avatar`}
          fallbackText={fallbackText}
          size={size}
          className={avatarClassName}
        />
        {displayName && (
          <span className={cn("font-medium text-center", textSizeClasses[size], nameClassName)}>
            {displayName}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <UserAvatar
        src={user.profile_picture}
        alt={`${displayName} avatar`}
        fallbackText={fallbackText}
        size={size}
        className={avatarClassName}
      />
      {displayName && (
        <span className={cn("font-medium", textSizeClasses[size], nameClassName)}>
          {displayName}
        </span>
      )}
    </div>
  );
};

export default UserWithAvatar;