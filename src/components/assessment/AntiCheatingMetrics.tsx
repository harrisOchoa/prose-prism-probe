
import React from "react";
import { Clock, Keyboard, RefreshCw, SwitchCamera, Copy, Clipboard } from "lucide-react";
import { AntiCheatingMetrics as AntiCheatingMetricsType } from "@/firebase/assessmentService";
import MetricDisplay from "./metrics/MetricDisplay";
import SuspiciousActivityAlert from "./metrics/SuspiciousActivityAlert";
import MetricsHelpTooltip from "./metrics/MetricsHelpTooltip";

interface AntiCheatingMetricsProps {
  metrics: AntiCheatingMetricsType & {
    suspiciousActivityDetail?: string;
    copyAttempts?: number;
    pasteAttempts?: number;
    windowBlurs?: number;
    windowFocuses?: number;
  };
  hideAdminMetrics?: boolean;
}

const AntiCheatingMetrics: React.FC<AntiCheatingMetricsProps> = ({ metrics, hideAdminMetrics = false }) => {
  const {
    keystrokes = 0,
    pauses = 0,
    wordsPerMinute = 0,
    tabSwitches = 0,
    copyAttempts = 0,
    pasteAttempts = 0,
    suspiciousActivity = false,
    suspiciousActivityDetail
  } = metrics;

  const metricsData = [
    {
      icon: Keyboard,
      iconColor: "text-blue-500",
      label: "Total Keystrokes",
      value: keystrokes,
    },
    {
      icon: Clock,
      iconColor: "text-green-500",
      label: "Typing Pauses",
      value: pauses,
    },
    {
      icon: RefreshCw,
      iconColor: "text-purple-500",
      label: "Typing Speed",
      value: `${wordsPerMinute.toFixed(0)} WPM`,
      progressValue: Math.min(100, (wordsPerMinute / 150) * 100),
      alert: wordsPerMinute > 100,
      alertText: "High"
    },
    ...(!hideAdminMetrics ? [
      {
        icon: SwitchCamera,
        iconColor: "text-indigo-500",
        label: "Tab Switches",
        value: tabSwitches,
        alert: tabSwitches > 2,
        alertText: "High"
      },
      {
        icon: Copy,
        iconColor: "text-teal-500",
        label: "Copy Attempts",
        value: copyAttempts,
        alert: copyAttempts > 0,
        alertText: "Suspicious"
      },
      {
        icon: Clipboard,
        iconColor: "text-blue-500",
        label: "Paste Attempts",
        value: pasteAttempts,
        alert: pasteAttempts > 0,
        alertText: "Suspicious"
      }
    ] : [])
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {metricsData.map((metric, index) => (
          <MetricDisplay key={index} {...metric} />
        ))}
      </div>

      {suspiciousActivity && suspiciousActivityDetail && (
        <SuspiciousActivityAlert detail={suspiciousActivityDetail} />
      )}

      <MetricsHelpTooltip />
    </div>
  );
};

export default AntiCheatingMetrics;

