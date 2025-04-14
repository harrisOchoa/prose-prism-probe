
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Target, CheckCircle, XCircle } from "lucide-react";
import { CandidateProfileMatch } from "@/services/geminiService";

interface ProfileMatchTabProps {
  profileMatch: CandidateProfileMatch | null;
  loading: boolean;
  handleGenerateAnalysis: () => void;
  getAnalysisButtonLabel: (analysisType: string) => string;
  getProgressColor: (value: number) => string;
}

const ProfileMatchTab: React.FC<ProfileMatchTabProps> = ({
  profileMatch,
  loading,
  handleGenerateAnalysis,
  getAnalysisButtonLabel,
  getProgressColor
}) => {
  return (
    <div className="space-y-4 profile-match-content">
      <div className="flex justify-end pdf-hide">
        <Button 
          onClick={() => handleGenerateAnalysis()}
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {getAnalysisButtonLabel("profile")}
        </Button>
      </div>

      {!profileMatch && !loading ? (
        <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed rounded-lg">
          <Target className="h-12 w-12 text-gray-300 mb-2" />
          <h3 className="text-lg font-medium text-gray-600">No Profile Comparison Available</h3>
          <p className="text-sm text-gray-500 max-w-md mt-1">
            Compare this candidate against an ideal profile for the position they're applying for.
          </p>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center p-6">
          <Loader2 className="h-12 w-12 animate-spin text-green-500 mb-3" />
          <p className="text-gray-600">Analyzing profile match...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col items-center p-4 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-medium">Match for: {profileMatch?.position}</h3>
            <div className="w-40 h-40 relative mt-4 mb-2">
              <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                <div 
                  className="absolute inset-2 rounded-full flex items-center justify-center"
                  style={{
                    background: `conic-gradient(${getProgressColor(profileMatch?.matchPercentage || 0).replace('text-', 'var(--')}500) ${profileMatch?.matchPercentage || 0}%, transparent 0)`
                  }}
                >
                  <div className="bg-white w-3/4 h-3/4 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold">{profileMatch?.matchPercentage || 0}%</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600">Overall Match Percentage</div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-green-700 mb-2">Key Matches</h3>
              <ul className="space-y-2">
                {profileMatch?.keyMatches.map((match, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>{match}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-red-700 mb-2">Key Gaps</h3>
              <ul className="space-y-2">
                {profileMatch?.keyGaps.map((gap, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMatchTab;
