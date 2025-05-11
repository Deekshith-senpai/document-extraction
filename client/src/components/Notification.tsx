import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastTitle } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface NotificationProps {
  notification: {
    id: string;
    title: string;
    description?: string;
    variant?: "default" | "destructive";
  };
}

const Notification: React.FC<NotificationProps> = ({ notification }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { toast } = useToast();

  // Animate in on mount
  useEffect(() => {
    // Small delay to ensure the component is mounted before animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  // Dismiss toast
  const handleDismiss = () => {
    setIsVisible(false);
    // Allow time for animation
    setTimeout(() => {
      toast.dismiss(notification.id);
    }, 300);
  };

  return (
    <Toast
      className={cn(
        "transform transition-all duration-300",
        isVisible ? "translate-x-0" : "translate-x-full"
      )}
      variant={notification.variant}
    >
      <div className="flex">
        <span className={cn(
          "material-icons mr-3",
          notification.variant === "destructive" ? "text-red-500" : "text-green-500"
        )}>
          {notification.variant === "destructive" ? "error" : "check_circle"}
        </span>
        <div>
          <ToastTitle>{notification.title}</ToastTitle>
          {notification.description && (
            <ToastDescription>{notification.description}</ToastDescription>
          )}
        </div>
      </div>
      <ToastClose onClick={handleDismiss} />
    </Toast>
  );
};

export default Notification;
