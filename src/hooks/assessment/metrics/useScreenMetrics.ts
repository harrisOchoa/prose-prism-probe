
import { useState, useEffect } from "react";

interface ScreenMetrics {
  screenResolution: string;
  multipleDisplays: boolean;
  browserResizes: number;
  fullscreenExits: number;
}

export const useScreenMetrics = () => {
  const [screenResolution, setScreenResolution] = useState("");
  const [multipleDisplays, setMultipleDisplays] = useState(false);
  const [browserResizes, setBrowserResizes] = useState(0);
  const [fullscreenExits, setFullscreenExits] = useState(0);

  useEffect(() => {
    const handleScreenChange = () => {
      if (window.screen && window.screen.availWidth) {
        setScreenResolution(`${window.screen.availWidth}x${window.screen.availHeight}`);
        
        if (window.screen.availWidth > window.innerWidth + 100) {
          setMultipleDisplays(true);
        }
      }
      setBrowserResizes(prev => prev + 1);
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setFullscreenExits(prev => prev + 1);
      }
    };

    window.addEventListener('resize', handleScreenChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    handleScreenChange(); // Initial check

    return () => {
      window.removeEventListener('resize', handleScreenChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return {
    screenResolution,
    multipleDisplays,
    browserResizes,
    fullscreenExits,
  };
};
