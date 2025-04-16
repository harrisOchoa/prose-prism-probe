
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Clock, Keyboard, RefreshCw } from "lucide-react";

interface AntiCheatingMetricsProps {
  metrics: {
    keystrokes: number;
    pauses: number;
    averageTypingSpeed: number;
    tabSwitches: number;
    suspiciousActivity: boolean;
  };
}

const AntiCheatingMetrics: React.FC<AntiCheatingMetricsProps> = ({ metrics }) => {
  return (
    <Card className="border shadow-subtle">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="text-yellow-500" />
          Anti-Cheating Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-4">
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
            <p className="text-sm text-gray-600">Average Typing Speed</p>
            <p className="font-medium">{metrics.averageTypingSpeed.toFixed(2)} chars/sec</p>
          </div>
        </div>
        <div className={`flex items-center gap-3 border p-3 rounded-md ${metrics.suspiciousActivity ? 'bg-yellow-50 border-yellow-200' : ''}`}>
          <AlertTriangle className={metrics.suspiciousActivity ? 'text-red-500' : 'text-gray-400'} />
          <div>
            <p className="text-sm text-gray-600">Suspicious Activity</p>
            <p className={`font-medium ${metrics.suspiciousActivity ? 'text-red-600' : 'text-gray-600'}`}>
              {metrics.suspiciousActivity ? 'Detected' : 'None'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AntiCheatingMetrics;
