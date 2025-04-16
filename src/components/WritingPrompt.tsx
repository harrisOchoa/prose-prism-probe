
const handleSubmit = () => {
  if (wordCount < 50) {
    toast({
      title: "Response too short",
      description: "Please write at least 50 words to submit your assessment.",
      variant: "destructive",
    });
    return;
  }
  
  // Include anti-cheating metrics with the submission
  const metrics = getAssessmentMetrics();
  
  // Log suspicious activity
  if (metrics.suspiciousActivity || metrics.tabSwitches > 3) {
    console.warn("Suspicious activity detected:", metrics);
  }
  
  onSubmit(response, metrics);
};
