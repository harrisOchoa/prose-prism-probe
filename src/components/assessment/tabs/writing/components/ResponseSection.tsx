
import React from "react";

interface ResponseSectionProps {
  response: string;
}

const ResponseSection: React.FC<ResponseSectionProps> = ({ response }) => {
  // Check if response is empty and display a placeholder message
  const displayContent = response.trim() ? (
    <p className="whitespace-pre-wrap text-gray-600">{response}</p>
  ) : (
    <p className="text-gray-400 italic">No response provided</p>
  );

  return (
    <div className="bg-white p-4 rounded-md border border-gray-100 shadow-sm">
      <h4 className="text-lg font-semibold mb-2 text-gray-800">Response</h4>
      <div className="min-h-[100px]">
        {displayContent}
      </div>
    </div>
  );
};

export default ResponseSection;
