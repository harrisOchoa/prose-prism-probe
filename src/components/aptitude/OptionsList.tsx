
import React from "react";

interface OptionsListProps {
  options: string[];
  selectedOption: number;
  onSelect: (optionIndex: number) => void;
}

const OptionsList = ({ options, selectedOption, onSelect }: OptionsListProps) => {
  return (
    <div className="space-y-3">
      {options.map((option, index) => (
        <div
          key={index}
          className={`p-3 rounded-md border cursor-pointer transition-colors ${
            selectedOption === index
              ? "bg-assessment-primary text-white border-assessment-primary"
              : "bg-white hover:bg-gray-50 border-gray-200"
          }`}
          onClick={() => onSelect(index)}
          style={{ userSelect: "none" }}
          tabIndex={-1}
          aria-label={`Option ${String.fromCharCode(65 + index)} (copying disabled)`}
        >
          <div className="flex items-center">
            <div
              className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center ${
                selectedOption === index
                  ? "bg-white text-assessment-primary"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {String.fromCharCode(65 + index)}
            </div>
            <span>{option}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OptionsList;
