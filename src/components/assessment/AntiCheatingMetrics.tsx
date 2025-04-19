
import React from "react";
import { AlertTriangle, Clock, Keyboard, RefreshCw, SwitchCamera } from "lucide-react";
import { AntiCheatingMetrics as AntiCheatingMetricsType } from "@/firebase/assessmentService";

interface AntiCheatingMetricsProps {
  metrics: AntiCheatingMetricsType;
}

const AntiCheatingMetrics: React.FC<AntiCheatingMetricsProps> = ({ metrics }) => {
  // Safe access to properties with fallbacks
  const keystrokes = metrics?.keystrokes ?? 0;
  const pauses = metrics?.pauses ?? 0;
  const typingSpeed = metrics?.wordsPerMinute ?? 0;
  const tabSwitches = metrics?.tabSwitches ?? 0;
  const suspiciousActivity = metrics?.suspiciousActivity ?? false;

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div className="flex items-center gap-3 border p-3 rounded-md">
        <Keyboard className="text-blue-500" />
        <div>
          <p className="text-sm text-gray-600">Total Keystrokes</p>
          <p className="font-medium">{keystrokes}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 border p-3 rounded-md">
        <Clock className="text-green-500" />
        <div>
          <p className="text-sm text-gray-600">Typing Pauses</p>
          <p className="font-medium">{pauses}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 border p-3 rounded-md">
        <RefreshCw className="text-purple-500" />
        <div>
          <p className="text-sm text-gray-600">Typing Speed</p>
          <p className="font-medium">{typingSpeed.toFixed(0)} WPM</p>
        </div>
      </div>
      <div className="flex items-center gap-3 border p-3 rounded-md">
        <SwitchCamera className="text-indigo-500" />
        <div>
          <p className="text-sm text-gray-600">Tab Switches</p>
          <p className={`font-medium ${tabSwitches > 2 ? 'text-amber-600' : ''}`}>
            {tabSwitches}
          </p>
        </div>
      </div>
      <div className={`flex items-center gap-3 border p-3 rounded-md ${suspiciousActivity ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
        <AlertTriangle className={suspiciousActivity ? 'text-red-500' : 'text-green-500'} />
        <div>
          <p className="text-sm text-gray-600">Suspicious Activity</p>
          <p className={`font-medium ${suspiciousActivity ? 'text-red-600' : 'text-green-600'}`}>
            {suspiciousActivity ? 'Detected' : 'None Detected'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AntiCheatingMetrics;
