
import React, { useState, useEffect } from "react";

const loadingMessages = [
  "Preparing your assessment\u2026",
  "Getting your assessment ready\u2026",
  "Loading your assessment\u2026"
];

const GeneratingPromptsStage: React.FC = () => {
  const [loadingIndex, setLoadingIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full min-h-[40vh] flex flex-col items-center justify-center">
      <div className="flex items-center gap-2">
        <span className="animate-spin rounded-full h-7 w-7 border-2 border-primary border-t-transparent mr-2"></span>
        <span className="text-lg font-medium">{loadingMessages[loadingIndex]}</span>
      </div>
    </div>
  );
};

export default GeneratingPromptsStage;
