
import { useState } from "react";

export const useSuspiciousActivity = () => {
  const [suspiciousActivity, setSuspiciousActivity] = useState(false);
  const [suspiciousActivityDetail, setSuspiciousActivityDetail] = useState<string | null>(null);

  const flagSuspiciousActivity = (detail: string) => {
    setSuspiciousActivity(true);
    setSuspiciousActivityDetail(detail);
  };

  return {
    suspiciousActivity,
    suspiciousActivityDetail,
    flagSuspiciousActivity,
  };
};
