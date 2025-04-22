
import React from "react";
import { LucideIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface MetricDisplayProps {
  icon: LucideIcon;
  iconColor: string;
  label: string;
  value: number | string;
  progressValue?: number;
  alert?: boolean;
  alertText?: string;
}

const MetricDisplay: React.FC<MetricDisplayProps> = ({
  icon: Icon,
  iconColor,
  label,
  value,
  progressValue,
  alert,
  alertText
}) => {
  return (
    <div className="flex items-center gap-3 border p-3 rounded-md">
      <Icon className={iconColor} />
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className={`font-medium ${alert ? 'text-amber-600' : ''}`}>
          {value}
          {alert && alertText && <span className="ml-2 text-xs">⚠️ {alertText}</span>}
        </p>
        {progressValue !== undefined && (
          <Progress value={progressValue} className="h-1.5 mt-1" />
        )}
      </div>
    </div>
  );
};

export default MetricDisplay;

