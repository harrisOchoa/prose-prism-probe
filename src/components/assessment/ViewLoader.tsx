
import React from "react";
import { Loader2 } from "lucide-react";

const ViewLoader: React.FC = () => {
  return (
    <div className="container mx-auto py-10 px-4 flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="h-10 w-10 animate-spin text-hirescribe-primary mb-4" />
      <p>Loading assessment data...</p>
    </div>
  );
};

export default ViewLoader;
