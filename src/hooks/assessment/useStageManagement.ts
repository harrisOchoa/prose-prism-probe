
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Stage } from "@/types/assessment";

// Map stages to URL paths for routing
export const stageToPath = {
  [Stage.LANDING]: "/",
  [Stage.INFO]: "/info",
  [Stage.INTRO]: "/intro",
  [Stage.GENERATING_PROMPTS]: "/generating-prompts",
  [Stage.SELECT_PROMPTS]: "/select-prompts",
  [Stage.APTITUDE]: "/aptitude",
  [Stage.WRITING]: "/writing",
  [Stage.COMPLETE]: "/complete"
};

// Map URL paths back to stages
export const pathToStage = {
  "/": Stage.LANDING,
  "/info": Stage.INFO,
  "/intro": Stage.INTRO,
  "/generating-prompts": Stage.GENERATING_PROMPTS,
  "/select-prompts": Stage.SELECT_PROMPTS,
  "/aptitude": Stage.APTITUDE,
  "/writing": Stage.WRITING,
  "/complete": Stage.COMPLETE
};

export const useStageManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>(Stage.LANDING);

  // Sync URL with stage
  useEffect(() => {
    if (location.pathname !== stageToPath[stage]) {
      navigate(stageToPath[stage], { replace: true });
    }
  }, [stage, navigate, location.pathname]);

  // Sync stage with URL on initial load or URL change
  useEffect(() => {
    const pathname = location.pathname;
    if (pathname in pathToStage) {
      const newStage = pathToStage[pathname as keyof typeof pathToStage];
      setStage(newStage);
    } else if (pathname !== '/' && pathname !== '/admin' && pathname !== '/view') {
      navigate('/', { replace: true });
    }
  }, [location.pathname, navigate]);

  return { stage, setStage };
};
