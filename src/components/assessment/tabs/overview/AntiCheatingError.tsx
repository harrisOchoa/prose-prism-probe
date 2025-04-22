
import React from "react";
import { AlertTriangle, ShieldAlert, Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { AntiCheatingMetrics } from "@/firebase/assessmentService";

interface Props {
  error: string;
  metrics: AntiCheatingMetrics & { 
    suspiciousActivityDetail?: string;
    copyAttempts?: number; 
    pasteAttempts?: number;
    windowBlurs?: number;
    keyboardShortcuts?: number;
  };
}

const AntiCheatingError: React.FC<Props> = ({ error, metrics }) => {
  // Calculate basic risk score even when AI analysis fails
  const calculateRiskScore = () => {
    let score = 0;
    if (metrics.tabSwitches > 2) score += 2;
    if (metrics.wordsPerMinute > 100) score += 2;
    if (metrics.copyAttempts && metrics.copyAttempts > 0) score += 3;
    if (metrics.pasteAttempts && metrics.pasteAttempts > 0) score += 3;
    if (metrics.suspiciousActivity) score += 5;
    
    return Math.min(10, score);
  };
  
  const riskScore = calculateRiskScore();
  const hasHighRisk = riskScore > 5;

  return (
    <div className="mt-4 p-6 rounded-lg bg-amber-50 border border-amber-200">
      <div className="flex items-start gap-3 mb-2">
        <AlertTriangle className="h-6 w-6 text-amber-500 mt-1 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-amber-900 text-lg mb-2">Assessment Integrity Review Unavailable</h4>
          <p className="text-sm text-amber-800 leading-relaxed">{error}</p>
        </div>
      </div>
      <Separator className="my-4 bg-amber-200" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-md p-4 border border-amber-200">
          <div className="flex items-center mb-3 gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-500" />
            <h5 className="font-medium text-amber-900">Integrity Metrics Overview</h5>
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-amber-800 mb-1">
                <span>Tab Switches</span>
                <span className={metrics.tabSwitches > 2 ? 'text-amber-600 font-medium' : ''}>
                  {metrics.tabSwitches}
                </span>
              </div>
              <Progress value={Math.min(100, metrics.tabSwitches * 20)} className="h-1.5" />
            </div>
            
            <div>
              <div className="flex justify-between text-xs text-amber-800 mb-1">
                <span>Typing Speed (WPM)</span>
                <span className={metrics.wordsPerMinute > 100 ? 'text-amber-600 font-medium' : ''}>
                  {metrics.wordsPerMinute.toFixed(0)}
                </span>
              </div>
              <Progress value={Math.min(100, (metrics.wordsPerMinute / 150) * 100)} className="h-1.5" />
            </div>
            
            <div>
              <div className="flex justify-between text-xs text-amber-800 mb-1">
                <span>Copy/Paste Attempts</span>
                <span className={(metrics.copyAttempts || 0) + (metrics.pasteAttempts || 0) > 0 ? 'text-amber-600 font-medium' : ''}>
                  {(metrics.copyAttempts || 0) + (metrics.pasteAttempts || 0)}
                </span>
              </div>
              <Progress 
                value={Math.min(100, ((metrics.copyAttempts || 0) + (metrics.pasteAttempts || 0)) * 25)} 
                className="h-1.5" 
              />
            </div>
            
            <div>
              <div className="flex justify-between text-xs text-amber-800 mb-1">
                <span>Risk Score</span>
                <span className={riskScore > 5 ? 'text-amber-600 font-medium' : ''}>
                  {riskScore}/10
                </span>
              </div>
              <Progress 
                value={riskScore * 10} 
                className={`h-1.5 ${hasHighRisk ? 'bg-amber-500' : ''}`}
              />
            </div>
          </div>
        </div>
        
        <div className="text-sm text-amber-800 bg-white rounded-md p-4 border border-amber-200">
          <div className="flex items-center mb-3 gap-2">
            <Info className="h-5 w-5 text-amber-500" />
            <h5 className="font-medium text-amber-900">Manual Review Required</h5>
          </div>
          
          <p className="mb-3">
            Integrity metrics have been collected for this assessment.
            Please review raw data for signs of suspicious behavior.
          </p>
          
          {metrics.suspiciousActivity && (
            <>
              <div className="p-3 bg-amber-100 rounded-md mb-3">
                <strong className="text-amber-900 block mb-1">Suspicious Activity Flag: Enabled</strong>
                {metrics.suspiciousActivityDetail ? (
                  <span className="text-amber-800">{metrics.suspiciousActivityDetail}</span>
                ) : (
                  <span className="text-amber-800">No specific details available about the nature of the suspicious activity.</span>
                )}
              </div>
              
              {hasHighRisk && (
                <p className="text-amber-700 font-medium">
                  ⚠️ This assessment shows multiple indicators of potential integrity violations.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AntiCheatingError;
