
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
  const progressPercentage = Math.round((progress.current / progress.total) * 100);
  const sessionTitle = sessionType === 'aptitude' ? 'Aptitude Test' : 'Writing Assessment';
  
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Resume Previous Session?</AlertDialogTitle>
          <AlertDialogDescription>
            We detected that you have a previous {sessionTitle} session with {progressPercentage}% progress. 
            Would you like to resume where you left off? ({progress.current} of {progress.total} questions completed)
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onDecline}>Start Over</AlertDialogCancel>
          <AlertDialogAction onClick={onResume}>Resume Session</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ResumeSessionDialog;
