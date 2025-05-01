
import { useState } from "react";

export const useSuspiciousActivity = () => {
  const [suspiciousActivity, setSuspiciousActivity] = useState(false);
  const [suspiciousActivityDetail, setSuspiciousActivityDetail] = useState<string | null>(null);
  const [suspiciousActivities, setSuspiciousActivities] = useState<string[]>([]);

  const flagSuspiciousActivity = (detail: string) => {
    setSuspiciousActivity(true);
    setSuspiciousActivityDetail(prev => {
      if (prev) {
        return `${prev}; ${detail}`;
      }
      return detail;
    });
    setSuspiciousActivities(prev => [...prev, detail]);
  };

  return {
    suspiciousActivity,
    suspiciousActivityDetail,
    suspiciousActivities,
    flagSuspiciousActivity,
  };
};
