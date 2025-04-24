
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ClipboardCheck, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Stage, stageToPath } from "../AssessmentManager";

interface ResumeSessionDialogProps {
  open: boolean;
  onResume: () => void;
  onDecline: () => void;
  sessionType: 'aptitude' | 'writing';
  progress: {
    current: number;
    total: number;
  };
}

const ResumeSessionDialog = ({
  open,
  onResume,
  onDecline,
  sessionType,
  progress
}: ResumeSessionDialogProps) => {
  const navigate = useNavigate();
  const progressPercentage = Math.round((progress.current / progress.total) * 100);
  const sessionTitle = sessionType === 'aptitude' ? 'Aptitude Test' : 'Writing Assessment';
  
  // Handle the resume action - prevent default to avoid form submission behavior
  const handleResumeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Navigate to the appropriate page based on session type
    if (sessionType === 'aptitude') {
      navigate(stageToPath[Stage.APTITUDE], { replace: true });
    } else {
      navigate(stageToPath[Stage.WRITING], { replace: true });
    }
    
    onResume();
  };
  
  // Handle the decline action
  const handleDeclineClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDecline();
  };
  
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <ClipboardCheck className="h-5 w-5" />
            <AlertDialogTitle>Resume Previous Session</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-4 pt-2">
            <div className="border rounded-md p-4 bg-muted/30">
              <p className="font-medium text-sm mb-2">We found your previous {sessionTitle} session:</p>
              <div className="flex justify-between items-center text-sm mb-1">
                <span>Progress:</span>
                <span className="font-medium">{progressPercentage}% complete</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Questions completed:</span>
                <span className="font-medium">{progress.current} of {progress.total}</span>
              </div>
              <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" /> 
                <span>Session saved within the last 24 hours</span>
              </div>
            </div>
            <p>Would you like to resume where you left off or start a new assessment?</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel onClick={handleDeclineClick} className="w-full sm:w-auto">Start Over</AlertDialogCancel>
          <AlertDialogAction onClick={handleResumeClick} className="w-full sm:w-auto">Resume Session</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ResumeSessionDialog;
