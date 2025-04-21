
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Square, SquareCheck } from "lucide-react";

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
          : prev
    );
  };

  const handleProceed = () => {
    if (selected.length >= minSelect) {
      onSelection(selected);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-hirescribe-muted to-white/60 dark:from-hirescribe-dark/80 dark:to-background px-2 py-8 transition-all">
      <div className="w-full max-w-3xl bg-white/90 dark:bg-hirescribe-dark/80 glass-effect rounded-2xl shadow-elevation-2 p-0 md:p-7 animate-fade-in">
        {/* Header with Icon */}
        <div className="sticky top-0 z-10 bg-inherit rounded-t-2xl px-4 pt-6 md:pt-0 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-2">
            <Pen className="text-hirescribe-primary h-8 w-8 drop-shadow" strokeWidth={2.2} />
            <h1 className="assessment-title text-2xl md:text-3xl !font-semibold">Writing Prompts</h1>
          </div>
          <p className="assessment-subtitle text-center text-base text-gray-700 dark:text-gray-300 px-2 mb-1">
            Choose <span className="text-hirescribe-primary font-bold">{minSelect}</span> or more prompts below that you feel most confident answering.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Your selection is private and helps us tailor your assessment experience. </p>
        </div>

        {/* Prompts */}
        <div className="flex flex-col gap-7 py-4 pb-6 md:py-8">
          {availablePrompts.map(({ id, prompt }) => {
            const checked = selected.includes(id);
            return (
              <div
                key={id}
                className={`
                  cursor-pointer rounded-xl relative
                  border bg-white/80 dark:bg-hirescribe-dark/70 transition-all duration-200
                  hover:shadow-card-hover shadow-md
                  ${checked ? "border-hirescribe-primary ring-2 ring-hirescribe-primary bg-hirescribe-muted/70 dark:bg-hirescribe-accent/10" : "border-gray-200 dark:border-hirescribe-secondary"}
                  animate-fade-in
                  group
                `}
                onClick={() => handleToggle(id)}
                tabIndex={0}
                aria-pressed={checked}
                role="button"
                style={{ minHeight: 90 }}
              >
                <div className="flex items-start gap-2 p-5">
                  {/* Custom checkbox with icon */}
                  <span
                    className={`
                      mr-3 mt-1 transition-transform duration-100
                      ${checked ? "scale-110 text-hirescribe-primary" : "opacity-70 group-hover:text-hirescribe-primary"}
                    `}
                    onClick={e => {
                      e.stopPropagation();
                      handleToggle(id);
                    }}
                    aria-label={checked ? "Deselect" : "Select"}
                  >
                    {checked ? <SquareCheck size={22} strokeWidth={2.3} /> : <Square size={22} strokeWidth={2.1} />}
                  </span>
                  <label 
                    htmlFor={`prompt-${id}`} 
                    className="font-medium text-base leading-relaxed select-none cursor-pointer"
                  >
                    {prompt}
                  </label>
                </div>
                {checked && (
                  <span className="absolute top-3 right-4 rounded px-2 py-0.5 bg-hirescribe-primary text-white text-xs font-bold tracking-wide shadow-elevation-2 animate-scale-in">
                    Selected
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer with action button */}
        <div className="w-full flex flex-col items-center py-4">
          <Button
            onClick={handleProceed}
            disabled={selected.length < minSelect}
            className={`
              assessment-button px-8 py-3 text-lg font-semibold w-full max-w-sm
              transition-all duration-200
              ${selected.length >= minSelect 
                ? "bg-hirescribe-primary hover:bg-hirescribe-accent text-white shadow-elevation-1" 
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }
            `}
          >
            {selected.length >= minSelect ? "Start Writing" : "Select prompts to proceed"}
            <span className="ml-2 text-base font-medium">
              ({selected.length} {selected.length === 1 ? "selected" : "selected"})
            </span>
          </Button>
          {selected.length < minSelect && (
            <p className="mt-3 text-sm text-red-500 text-center animate-fade-in">
              Please select at least {minSelect} prompt{minSelect > 1 ? "s" : ""} to continue.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Lucide icon used above for header
function Pen(props: React.ComponentProps<"svg">) {
  return <PenIcon {...props} />;
}

// Minimal local copy for the pen icon from lucide-react
function PenIcon({ className = "", ...props }: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" 
      className={`lucide lucide-pen ${className}`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m16.2 6.3 1.5-1.6a2.1 2.1 0 1 1 3 3l-1.6 1.6"></path>
      <path d="M17.5 7.5 6.3 18.7c-.7.7-1.5 1.2-2.5 1.3l-2.4.2.2-2.4c.1-1 .6-1.8 1.3-2.5L16.5 6.5"></path>
    </svg>
  );
}

export default PromptSelection;

