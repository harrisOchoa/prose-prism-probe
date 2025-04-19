
interface BenchmarkData {
  averageScore: number;
  topScore: number;
  averageAptitude: number;
  topAptitude: number;
  averageWriting: number;
  topWriting: number;
  averageWordCount: number;
  topWordCount: number;
}

export const getBenchmarkData = (): BenchmarkData => ({
  averageScore: 72,
  topScore: 94,
  averageAptitude: 68,
  topAptitude: 85, // Reduced from 92 to a more realistic top score
  averageWriting: 76,
  topWriting: 90, // Reduced from 96 to a more realistic top score
  averageWordCount: 450,
  topWordCount: 750
});

export const calculatePercentile = (candidateScore: number, avgScore: number): number => {
  const percentile = Math.round((candidateScore / avgScore) * 50);
  return Math.min(Math.max(percentile, 1), 50);
};

export const generateComparisonData = (
  getOverallScore: () => number,
  getWritingScorePercentage: () => number,
  getAptitudeScorePercentage: () => number,
  benchmarkData: BenchmarkData
) => [
  {
    name: "Overall Score",
    Candidate: getOverallScore(),
    Average: benchmarkData.averageScore,
    Top: benchmarkData.topScore
  },
  {
    name: "Writing",
    Candidate: Math.min(getWritingScorePercentage(), 100),
    Average: benchmarkData.averageWriting,
    Top: benchmarkData.topWriting
  },
  {
    name: "Aptitude",
    Candidate: Math.min(getAptitudeScorePercentage(), 100),
    Average: benchmarkData.averageAptitude,
    Top: benchmarkData.topAptitude
  }
];
