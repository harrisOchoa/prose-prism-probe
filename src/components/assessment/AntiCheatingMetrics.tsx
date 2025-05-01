
import React from "react";
import { Clock, Keyboard, RefreshCw, SwitchCamera, Copy, Clipboard, Eye, EyeOff } from "lucide-react";
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
    focusLossEvents?: Array<{timestamp: number, duration: number}>;
    longestFocusLossDuration?: number;
    averageFocusLossDuration?: number;
    suspiciousFocusLoss?: boolean;
    totalInactivityTime?: number;
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
    windowBlurs = 0,
    windowFocuses = 0,
    suspiciousActivity = false,
    suspiciousActivityDetail,
    focusLossEvents = [],
    longestFocusLossDuration = 0,
    averageFocusLossDuration = 0,
    suspiciousFocusLoss = false,
    totalInactivityTime = 0
  } = metrics;
  
  // Format durations for display
  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

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
    {
      icon: EyeOff,
      iconColor: "text-red-500",
      label: "Focus Loss Events",
      value: windowBlurs,
      alert: windowBlurs > 2,
      alertText: "Suspicious"
    },
    {
      icon: Eye,
      iconColor: "text-emerald-500",
      label: "Out of Focus Time",
      value: formatDuration(totalInactivityTime),
      alert: totalInactivityTime > 30000, // 30 seconds
      alertText: "Excessive"
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
      },
      {
        icon: Clock,
        iconColor: "text-amber-500",
        label: "Longest Focus Loss",
        value: formatDuration(longestFocusLossDuration),
        alert: longestFocusLossDuration > 20000, // 20 seconds
        alertText: "Suspicious"
      }
    ] : [])
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metricsData.map((metric, index) => (
          <MetricDisplay key={index} {...metric} />
        ))}
      </div>

      {(suspiciousActivity || suspiciousFocusLoss) && suspiciousActivityDetail && (
        <SuspiciousActivityAlert detail={suspiciousActivityDetail} />
      )}

      {focusLossEvents && focusLossEvents.length > 0 && !hideAdminMetrics && (
        <div className="mt-4 p-3 border rounded-md bg-slate-50">
          <h3 className="text-sm font-medium mb-2">Focus Loss Timeline:</h3>
          <div className="max-h-40 overflow-y-auto text-xs space-y-1">
            {focusLossEvents.map((event, i) => (
              <div key={i} className="flex justify-between py-1 px-2 border-b">
                <span>
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
                <span className={event.duration > 10000 ? "text-amber-600 font-medium" : ""}>
                  {formatDuration(event.duration)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <MetricsHelpTooltip />
    </div>
  );
};

export default AntiCheatingMetrics;
