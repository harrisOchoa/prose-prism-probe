
import React from "react";
import { AlertTriangle, Clock, Keyboard, RefreshCw, SwitchCamera } from "lucide-react";

interface AntiCheatingMetricsProps {
  metrics: {
    keystrokes: number;
    pauses: number;
    wordsPerMinute: number;
    tabSwitches: number;
    suspiciousActivity: boolean;
  };
}

const AntiCheatingMetrics: React.FC<AntiCheatingMetricsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div className="flex items-center gap-3 border p-3 rounded-md">
        <Keyboard className="text-blue-500" />
        <div>
          <p className="text-sm text-gray-600">Total Keystrokes</p>
          <p className="font-medium">{metrics.keystrokes}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 border p-3 rounded-md">
        <Clock className="text-green-500" />
        <div>
          <p className="text-sm text-gray-600">Typing Pauses</p>
          <p className="font-medium">{metrics.pauses}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 border p-3 rounded-md">
        <RefreshCw className="text-purple-500" />
        <div>
          <p className="text-sm text-gray-600">Typing Speed</p>
          <p className="font-medium">{metrics.wordsPerMinute.toFixed(0)} WPM</p>
        </div>
      </div>
      <div className="flex items-center gap-3 border p-3 rounded-md">
        <SwitchCamera className="text-indigo-500" />
        <div>
          <p className="text-sm text-gray-600">Tab Switches</p>
          <p className={`font-medium ${metrics.tabSwitches > 2 ? 'text-amber-600' : ''}`}>
            {metrics.tabSwitches}
          </p>
        </div>
      </div>
      <div className={`flex items-center gap-3 border p-3 rounded-md ${metrics.suspiciousActivity ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
        <AlertTriangle className={metrics.suspiciousActivity ? 'text-red-500' : 'text-green-500'} />
        <div>
          <p className="text-sm text-gray-600">Suspicious Activity</p>
          <p className={`font-medium ${metrics.suspiciousActivity ? 'text-red-600' : 'text-green-600'}`}>
            {metrics.suspiciousActivity ? 'Detected' : 'None Detected'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AntiCheatingMetrics;
