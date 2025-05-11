import React from "react";
import { cn } from "@/lib/utils";

export type StatusCardVariant = "primary" | "green" | "red";

interface StatusCardProps {
  title: string;
  value: number | string;
  icon: string;
  variant?: StatusCardVariant;
}

const StatusCard: React.FC<StatusCardProps> = ({
  title,
  value,
  icon,
  variant = "primary"
}) => {
  const variantStyles = {
    primary: {
      border: "border-l-4 border-primary-400",
      iconBg: "bg-primary-100",
      iconText: "text-primary-600"
    },
    green: {
      border: "border-l-4 border-green-400",
      iconBg: "bg-green-100",
      iconText: "text-green-600"
    },
    red: {
      border: "border-l-4 border-red-400",
      iconBg: "bg-red-100",
      iconText: "text-red-600"
    }
  };

  const styles = variantStyles[variant];

  return (
    <div className={cn("bg-white rounded-lg shadow p-5", styles.border)}>
      <div className="flex items-center">
        <div className={cn("p-3 rounded-full mr-4", styles.iconBg)}>
          <span className={cn("material-icons", styles.iconText)}>{icon}</span>
        </div>
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="text-xl font-semibold text-slate-800">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default StatusCard;
