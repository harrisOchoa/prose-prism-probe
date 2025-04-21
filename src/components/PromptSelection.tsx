
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Square, SquareCheck } from "lucide-react";

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
        <div className="sticky top-0 z-10 bg-inherit rounded-t-2xl px-4 pt-7 pb-1 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-1.5">
            <Pen className="text-hirescribe-primary h-7 w-7 drop-shadow-sm" strokeWidth={2.2} />
            <h1 className="assessment-title text-2xl md:text-[1.8rem] font-semibold tracking-tight">
              Writing Questions
            </h1>
          </div>
          <p className="assessment-subtitle text-center max-w-xl mx-auto text-base md:text-[1.12rem] text-gray-800 dark:text-gray-200 px-2 mb-1 font-medium leading-snug">
            Choose as many questions as you can to showcase your experience.<br />
            <span className="text-hirescribe-primary font-bold">Answering all three will give us a better understanding of your expertise.</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 mt-0.5 italic">
            Don’t worry—pick the ones you feel you can answer best!
          </p>
        </div>

        {/* Questions */}
        <div className="flex flex-col gap-6 py-4 pb-6 md:py-8">
          {availablePrompts.map(({ id, prompt }) => {
            const checked = selected.includes(id);
            return (
              <div
                key={id}
                className={`
                  cursor-pointer group rounded-xl relative
                  border bg-white dark:bg-hirescribe-dark/70 transition-all duration-200
                  hover:shadow-card-hover shadow-md
                  ${checked 
                    ? "border-hirescribe-primary ring-2 ring-hirescribe-primary/60 bg-hirescribe-muted/60 dark:bg-hirescribe-accent/10 scale-[1.016]" 
                    : "border-gray-200 dark:border-hirescribe-secondary"}
                  animate-fade-in
                  outline-none focus-visible:ring-2 focus-visible:ring-hirescribe-primary/80
                `}
                onClick={() => handleToggle(id)}
                tabIndex={0}
                aria-pressed={checked}
                role="button"
                style={{ minHeight: 88 }}
              >
                <div className="flex items-start gap-3 p-5">
                  {/* Custom checkbox with icon */}
                  <span
                    className={`
                      mr-3 mt-1 transition-transform duration-100
                      ${checked 
                        ? "scale-110 text-hirescribe-primary" 
                        : "opacity-70 group-hover:text-hirescribe-primary"}
                    `}
                    onClick={e => {
                      e.stopPropagation();
                      handleToggle(id);
                    }}
                    aria-label={checked ? "Deselect question" : "Select question"}
                  >
                    {checked 
                      ? <SquareCheck size={23} strokeWidth={2.3} /> 
                      : <Square size={23} strokeWidth={2.1} />
                    }
                  </span>
                  <label 
                    htmlFor={`question-${id}`} 
                    className="font-medium text-[1.01rem] leading-relaxed select-none cursor-pointer"
                  >
                    {prompt}
                  </label>
                </div>
                {checked && (
                  <span className="absolute top-3 right-4 rounded px-2.5 py-0.5 bg-hirescribe-primary text-white text-xs font-semibold shadow-elevation-2 animate-scale-in">
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
            {selected.length >= minSelect ? "Start Writing" : "Select questions to proceed"}
            <span className="ml-2 text-base font-medium">
              ({selected.length} {selected.length === 1 ? "selected" : "selected"})
            </span>
          </Button>
          {selected.length < minSelect && (
            <p className="mt-3 text-sm text-red-500 text-center animate-fade-in">
              Please select at least {minSelect} question{minSelect > 1 ? "s" : ""} to continue.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Lucide icon used above for header
function Pen(props: React.ComponentProps<"svg">) {
  // Use "pencil" icon as per allowed icons and visual consistency
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" 
      className={`lucide lucide-pencil ${props.className || ""}`} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18.988 3.512c.656-.656 1.72-.183 1.72.736v0c0 .355-.147.696-.4.95l-1.808 1.809-2.252-2.252 1.81-1.81a1.06 1.06 0 0 1 1.93.577Z"/>
      <path d="m16.5 6 1.5-1.488m-7.347 12.347L4 20l3.141-6.653M19 7l-8.753 8.754m-.001.001c-.544.544-1.282.673-1.945.729l-2.425.201.202-2.426c.057-.663.185-1.401.73-1.945m0 0L17 5"/>
    </svg>
  );
}

export default PromptSelection;

