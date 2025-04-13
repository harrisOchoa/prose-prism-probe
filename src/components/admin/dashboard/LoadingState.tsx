
import React from "react";
import { Card } from "@/components/ui/card";

const LoadingState: React.FC = () => {
  return (
    <div className="flex justify-center my-10">
      <Card className="w-full p-8">
        <div className="flex flex-col items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-hirescribe-primary border-t-transparent animate-spin mb-4"></div>
          <p className="text-muted-foreground">Loading assessment data...</p>
        </div>
      </Card>
    </div>
  );
};

export default LoadingState;
