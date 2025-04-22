
import React from "react";
import { AlertTriangle, Clock, Keyboard, RefreshCw, SwitchCamera, Copy, Clipboard, ShieldAlert, AlertOctagon } from "lucide-react";
import { AntiCheatingMetrics as AntiCheatingMetricsType } from "@/firebase/assessmentService";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AntiCheatingMetricsProps {
  metrics: AntiCheatingMetricsType & {
    suspiciousActivityDetail?: string;
    copyAttempts?: number;
    pasteAttempts?: number;
    windowBlurs?: number;
    windowFocuses?: number;
  };
}

const AntiCheatingMetrics: React.FC<AntiCheatingMetricsProps> = ({ metrics }) => {
  // Safe access to properties with fallbacks
  const keystrokes = metrics?.keystrokes ?? 0;
  const pauses = metrics?.pauses ?? 0;
  const typingSpeed = metrics?.wordsPerMinute ?? 0;
  const tabSwitches = metrics?.tabSwitches ?? 0;
  const copyAttempts = metrics?.copyAttempts ?? 0;
  const pasteAttempts = metrics?.pasteAttempts ?? 0;
  const windowBlurs = metrics?.windowBlurs ?? 0;
  const windowFocuses = metrics?.windowFocuses ?? 0;
  const suspiciousActivity = metrics?.suspiciousActivity ?? false;
  const suspiciousDetail = metrics?.suspiciousActivityDetail ?? "No specific details available";

  // Calculate a risk score based on various metrics
  const calculateRiskScore = () => {
    let score = 0;
    if (tabSwitches > 3) score += 2;
    if (typingSpeed > 100) score += 2;
    if (copyAttempts > 0) score += 3;
    if (pasteAttempts > 0) score += 3;
    if (windowBlurs > 5) score += 1;
    if (suspiciousActivity) score += 5;
    
    return Math.min(10, score);
  };
  
  const riskScore = calculateRiskScore();
  
  // Determine risk level color
  const getRiskColor = (score: number) => {
    if (score <= 2) return "text-green-600 bg-green-50";
    if (score <= 5) return "text-amber-600 bg-amber-50";
    return "text-red-600 bg-red-50";
  };
  
  const riskClass = getRiskColor(riskScore);

  return (
    <div className="space-y-4">
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
            <p className={`font-medium ${typingSpeed > 100 ? 'text-amber-600' : ''}`}>
              {typingSpeed.toFixed(0)} WPM
              {typingSpeed > 100 && <span className="ml-2 text-xs">⚠️ High</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 border p-3 rounded-md">
          <SwitchCamera className="text-indigo-500" />
          <div>
            <p className="text-sm text-gray-600">Tab Switches</p>
            <p className={`font-medium ${tabSwitches > 2 ? 'text-amber-600' : ''}`}>
              {tabSwitches}
              {tabSwitches > 2 && <span className="ml-2 text-xs">⚠️ High</span>}
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 border p-3 rounded-md">
          <Copy className="text-blue-500" />
          <div>
            <p className="text-sm text-gray-600">Copy Attempts</p>
            <p className={`font-medium ${copyAttempts > 0 ? 'text-red-600' : ''}`}>
              {copyAttempts}
              {copyAttempts > 0 && <span className="ml-2 text-xs">⚠️ Suspicious</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 border p-3 rounded-md">
          <Clipboard className="text-teal-500" />
          <div>
            <p className="text-sm text-gray-600">Paste Attempts</p>
            <p className={`font-medium ${pasteAttempts > 0 ? 'text-red-600' : ''}`}>
              {pasteAttempts}
              {pasteAttempts > 0 && <span className="ml-2 text-xs">⚠️ Suspicious</span>}
            </p>
          </div>
        </div>
        <div className={`flex items-center gap-3 border p-3 rounded-md ${riskClass}`}>
          <ShieldAlert className={riskScore > 5 ? 'text-red-500' : riskScore > 2 ? 'text-amber-500' : 'text-green-500'} />
          <div>
            <p className="text-sm text-gray-600">Integrity Risk Score</p>
            <p className="font-medium">
              {riskScore}/10
              <span className="ml-2 text-xs">
                {riskScore <= 2 ? '✓ Low' : riskScore <= 5 ? '⚠️ Medium' : '⚠️ High'}
              </span>
            </p>
          </div>
        </div>
      </div>
      
      {suspiciousActivity && (
        <div className="mt-2 p-3 border border-red-200 bg-red-50 rounded-md">
          <div className="flex gap-2">
            <AlertOctagon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-700 mb-1">Suspicious Activity Details:</p>
              <p className="text-sm text-red-600">{suspiciousDetail}</p>
            </div>
          </div>
        </div>
      )}

      <TooltipProvider>
        <div className="text-xs text-gray-500 mt-2 flex items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="underline cursor-help">What is this data?</span>
            </TooltipTrigger>
            <TooltipContent className="max-w-md">
              <p>This data helps ensure assessment integrity. High typing speeds, multiple tab switches, or copy/paste attempts may indicate potential unauthorized assistance.</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default AntiCheatingMetrics;
