import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, AlertCircle } from "lucide-react";
import AntiCheatingMetrics from "@/components/assessment/AntiCheatingMetrics";
import { AntiCheatingMetrics as AntiCheatingMetricsType } from "@/firebase/assessmentService";
import AntiCheatingAnalysis from "./AntiCheatingAnalysis";
import { useIsMobile } from "@/hooks/use-mobile";

interface AntiCheatingCardProps {
  metrics: AntiCheatingMetricsType | undefined;
}

const AntiCheatingCard: React.FC<AntiCheatingCardProps> = ({ metrics }) => {
  const isMobile = useIsMobile();
  
  return metrics ? (
    <Card className="border border-gray-200 shadow-sm pdf-hide">
      <CardHeader className="pb-2">
        <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'} flex items-center flex-wrap`}>
          <Shield className="mr-2 h-5 w-5 text-purple-500" />
          Assessment Integrity Data
        </CardTitle>
        <CardDescription className={`${isMobile ? 'text-xs' : 'text-sm'}`}>
          Monitoring metrics collected during the assessment
        </CardDescription>
      </CardHeader>
      <CardContent className={`${isMobile ? 'p-3' : 'p-6'}`}>
        <AntiCheatingMetrics 
          metrics={metrics} 
          hideAdminMetrics={true}  // Hide metrics for candidates
        />
        <AntiCheatingAnalysis metrics={metrics} />
      </CardContent>
    </Card>
  ) : (
    <Card className="border border-gray-200 shadow-sm bg-amber-50 pdf-hide">
      <CardHeader className="pb-2">
        <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'} flex items-center`}>
          <Shield className="mr-2 h-5 w-5 text-amber-500" />
          Assessment Integrity Data
        </CardTitle>
      </CardHeader>
      <CardContent className={`${isMobile ? 'p-3' : 'p-6'}`}>
        <div className="flex items-center justify-center p-4">
          <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
          <p className={`${isMobile ? 'text-sm' : 'text-base'} text-amber-700`}>
            No integrity monitoring data available for this assessment.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AntiCheatingCard;
