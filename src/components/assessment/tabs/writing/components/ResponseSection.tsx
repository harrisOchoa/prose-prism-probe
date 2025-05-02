
import React from "react";

interface ResponseSectionProps {
  response: string;
}

const ResponseSection: React.FC<ResponseSectionProps> = ({ response }) => {
  return (
    <div>
      <h4 className="text-lg font-semibold mb-2">Response</h4>
      <p className="whitespace-pre-wrap text-gray-600">{response}</p>
    </div>
  );
};

export default ResponseSection;
