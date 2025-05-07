
import React from "react";

const AnalyticsLoading: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
  );
};

export default AnalyticsLoading;
