
import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface Prompt {
  id: number;
  prompt: string;
}

interface PromptSelectionProps {
  availablePrompts: Prompt[];
  onSelection: (selectedPromptIds: number[]) => void;
  minSelect?: number;
  maxSelect?: number;
}

const PromptSelection: React.FC<PromptSelectionProps> = ({
  availablePrompts,
  onSelection,
  minSelect = 1,
  maxSelect = 3,
}) => {
  const [selected, setSelected] = useState<number[]>([]);

  const handleToggle = (id: number) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(pid => pid !== id)
        : prev.length < maxSelect
          ? [...prev, id]
          : prev // don't add more than allowed
    );
  };

  const handleProceed = () => {
    if (selected.length >= minSelect) {
      onSelection(selected);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-semibold mb-4 text-center">Writing Prompts</h1>
      <p className="mb-6 text-center">
        Choose at least <span className="text-primary font-bold">{minSelect}</span> of the following prompts to answer. 
        You may answer more if you like.
      </p>
      <div className="space-y-6">
        {availablePrompts.map(({ id, prompt }) => (
          <div
            key={id}
            className={`border rounded-md p-5 bg-white transition-all cursor-pointer 
              ${selected.includes(id) ? "border-primary ring-2 ring-primary" : "border-gray-200"}`
            }
            onClick={() => handleToggle(id)}
          >
            <div className="flex items-center gap-2">
              <input 
                type="checkbox"
                checked={selected.includes(id)}
                id={`prompt-${id}`}
                onChange={() => handleToggle(id)}
                className="accent-primary w-4 h-4"
              />
              <label htmlFor={`prompt-${id}`} className="font-medium text-base">{prompt}</label>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-8">
        <Button 
          onClick={handleProceed}
          disabled={selected.length < minSelect}
          className="px-6 py-3 text-lg"
        >
          Start Writing ({selected.length} selected)
        </Button>
      </div>
      {selected.length < minSelect && (
        <p className="mt-4 text-sm text-red-500 text-center">
          Please select at least {minSelect} prompt{minSelect > 1 ? "s" : ""} to continue.
        </p>
      )}
    </div>
  );
};

export default PromptSelection;
