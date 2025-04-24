
import React from "react";
import LandingPage from "@/components/LandingPage";

interface LandingProps {
  onStart: () => void;
}

const Landing: React.FC<LandingProps> = ({ onStart }) => {
  return <LandingPage onStart={onStart} />;
};

export default Landing;
