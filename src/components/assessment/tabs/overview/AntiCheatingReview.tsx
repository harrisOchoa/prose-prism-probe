
import React from "react";
import { AlertTriangle, Flag, ClipboardCheck, ShieldAlert, Clock, Keyboard, SwitchCamera, Copy, Clipboard } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { AntiCheatingMetrics } from "@/firebase/assessmentService";

interface Props {
  analysis: {
    risk: string;
    concerns: string[];
    recommendations: string[];
  };
  metrics: AntiCheatingMetrics & { 
    suspiciousActivityDetail?: string;
    copyAttempts?: number;
    pasteAttempts?: number;
    windowBlurs?: number;
    windowFocuses?: number;
    rightClickAttempts?: number;
    keyboardShortcuts?: number;
  };
}

const AntiCheatingReview: React.FC<Props> = ({ analysis, metrics }) => {
  const hasSpecificSuspiciousActivity = metrics.suspiciousActivity && metrics.suspiciousActivityDetail;
  
  // Calculate a basic integrity score based on metrics
  const calculateIntegrityScore = () => {
    let score = 100; // Start at 100%
    
    // Deduct for suspicious activities
    if (metrics.suspiciousActivity) score -= 30;
    
    // Deduct for each tab switch (up to a maximum of 30 points)
    score -= Math.min(30, metrics.tabSwitches * 5);
    
    // Deduct for copy/paste attempts
    if (metrics.copyAttempts) score -= metrics.copyAttempts * 10;
    if (metrics.pasteAttempts) score -= (metrics.pasteAttempts || 0) * 15;
    
    // Deduct for keyboard shortcuts and right-clicks
    if (metrics.keyboardShortcuts) score -= (metrics.keyboardShortcuts || 0) * 5;
    if (metrics.rightClickAttempts) score -= (metrics.rightClickAttempts || 0) * 5;
    
    // Ensure score is between 0-100
    return Math.max(0, Math.min(100, score));
  };
  
  const integrityScore = calculateIntegrityScore();
  
  // Determine risk level based on score
  const getRiskLevel = (score: number) => {
    if (score >= 85) return { level: "Low Risk", color: "bg-green-500", textColor: "text-green-600" };
    if (score >= 65) return { level: "Moderate Risk", color: "bg-amber-500", textColor: "text-amber-600" };
    return { level: "High Risk", color: "bg-red-500", textColor: "text-red-600" };
  };
  
  const riskLevel = getRiskLevel(integrityScore);

  return (
    <div className="mt-4 p-6 rounded-lg bg-red-50 border border-red-200">
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-3 mb-6">
        <div className="col-span-1 sm:col-span-2">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-500 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-red-900 text-lg mb-2">Assessment Integrity Review</h4>
              <p className="text-sm text-red-800 leading-relaxed">{analysis.risk}</p>
              {hasSpecificSuspiciousActivity && (
                <div className="mt-3 p-3 bg-red-100 rounded-md text-sm text-red-800">
                  <strong>Suspicious Activity Details:</strong> {metrics.suspiciousActivityDetail}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-red-100 flex flex-col items-center justify-center">
          <h5 className="text-sm font-medium text-red-900 mb-2">Assessment Integrity Score</h5>
          <div className="h-24 w-24 relative flex items-center justify-center mb-2">
            <svg viewBox="0 0 100 100" className="h-full w-full">
              <circle 
                cx="50" cy="50" r="45" 
                fill="none" 
                stroke="#f1f1f1" 
                strokeWidth="10"
              />
              <circle 
                cx="50" cy="50" r="45" 
                fill="none" 
                stroke={riskLevel.color} 
                strokeWidth="10"
                strokeDasharray={`${integrityScore * 2.83} 283`}
                strokeDashoffset="0"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-bold ${riskLevel.textColor}`}>{integrityScore}</span>
            </div>
          </div>
          <span className={`text-sm font-medium ${riskLevel.textColor}`}>
            {riskLevel.level}
          </span>
        </div>
      </div>

      <Separator className="my-4 bg-red-200" />
      
      <div className="grid gap-6 mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 bg-white rounded-md border border-red-100">
            <div className="flex items-center mb-2">
              <SwitchCamera className="h-4 w-4 text-red-500 mr-2" />
              <span className="text-xs font-medium text-red-900">Tab Switches</span>
            </div>
            <Progress value={Math.min(100, metrics.tabSwitches * 20)} className="h-2 mb-1" />
            <span className={`text-xs ${metrics.tabSwitches > 2 ? 'text-red-600' : 'text-gray-600'}`}>
              {metrics.tabSwitches} {metrics.tabSwitches > 2 ? '(High)' : '(Normal)'}
            </span>
          </div>
          
          <div className="p-3 bg-white rounded-md border border-red-100">
            <div className="flex items-center mb-2">
              <Keyboard className="h-4 w-4 text-red-500 mr-2" />
              <span className="text-xs font-medium text-red-900">WPM</span>
            </div>
            <Progress value={Math.min(100, (metrics.wordsPerMinute / 150) * 100)} className="h-2 mb-1" />
            <span className={`text-xs ${metrics.wordsPerMinute > 100 ? 'text-red-600' : 'text-gray-600'}`}>
              {Math.round(metrics.wordsPerMinute)} {metrics.wordsPerMinute > 100 ? '(Fast)' : '(Normal)'}
            </span>
          </div>
          
          <div className="p-3 bg-white rounded-md border border-red-100">
            <div className="flex items-center mb-2">
              <Copy className="h-4 w-4 text-red-500 mr-2" />
              <span className="text-xs font-medium text-red-900">Copy Attempts</span>
            </div>
            <Progress value={Math.min(100, (metrics.copyAttempts || 0) * 25)} className="h-2 mb-1" />
            <span className={`text-xs ${(metrics.copyAttempts || 0) > 0 ? 'text-red-600' : 'text-gray-600'}`}>
              {metrics.copyAttempts || 0} {(metrics.copyAttempts || 0) > 0 ? '(Suspicious)' : '(None)'}
            </span>
          </div>
          
          <div className="p-3 bg-white rounded-md border border-red-100">
            <div className="flex items-center mb-2">
              <Clipboard className="h-4 w-4 text-red-500 mr-2" />
              <span className="text-xs font-medium text-red-900">Paste Attempts</span>
            </div>
            <Progress value={Math.min(100, (metrics.pasteAttempts || 0) * 25)} className="h-2 mb-1" />
            <span className={`text-xs ${(metrics.pasteAttempts || 0) > 0 ? 'text-red-600' : 'text-gray-600'}`}>
              {metrics.pasteAttempts || 0} {(metrics.pasteAttempts || 0) > 0 ? '(Suspicious)' : '(None)'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-red-900">
            <Flag className="h-5 w-5" />
            <h5 className="font-medium">Key Concerns</h5>
          </div>
          <ul className="space-y-2">
            {analysis.concerns && analysis.concerns.length > 0 ? (
              analysis.concerns.map((concern, index) => (
                <li key={index} className="text-sm text-red-800 flex gap-2 items-start">
                  <span className="text-red-400 mt-1">•</span>
                  <span>{concern}</span>
                </li>
              ))
            ) : (
              <li className="text-sm text-red-800">No additional concerns identified beyond the suspicious activity flag.</li>
            )}
          </ul>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-red-900">
            <ClipboardCheck className="h-5 w-5" />
            <h5 className="font-medium">Recommendations</h5>
          </div>
          <ul className="space-y-2">
            {analysis.recommendations && analysis.recommendations.length > 0 ? (
              analysis.recommendations.map((recommendation, index) => (
                <li key={index} className="text-sm text-red-800 flex gap-2 items-start">
                  <span className="text-red-400 mt-1">•</span>
                  <span>{recommendation}</span>
                </li>
              ))
            ) : (
              <li className="text-sm text-red-800">No specific recommendations provided by AI.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AntiCheatingReview;
