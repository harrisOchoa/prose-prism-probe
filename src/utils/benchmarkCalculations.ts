
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

export const calculateBenchmarks = (assessments: any[]): BenchmarkData => {
  if (!assessments || assessments.length === 0) {
    // Return default values if no assessments exist
    return {
      averageScore: 0,
      topScore: 0,
      averageAptitude: 0,
      topAptitude: 0,
      averageWriting: 0,
      topWriting: 0,
      averageWordCount: 0,
      topWordCount: 0
    };
  }

  // Calculate actual benchmarks from assessment data
  const scores = assessments.map(a => {
    const aptitudeScore = (a.aptitudeScore / a.aptitudeTotal) * 100;
    const writingScore = a.overallWritingScore ? (a.overallWritingScore / 5) * 100 : 0;
    const overallScore = (aptitudeScore + writingScore) / 2;
    return {
      overall: overallScore,
      aptitude: aptitudeScore,
      writing: writingScore,
      wordCount: a.wordCount || 0
    };
  });

  return {
    averageScore: Math.round(scores.reduce((sum, s) => sum + s.overall, 0) / scores.length),
    topScore: Math.round(Math.max(...scores.map(s => s.overall))),
    averageAptitude: Math.round(scores.reduce((sum, s) => sum + s.aptitude, 0) / scores.length),
    topAptitude: Math.round(Math.max(...scores.map(s => s.aptitude))),
    averageWriting: Math.round(scores.reduce((sum, s) => sum + s.writing, 0) / scores.length),
    topWriting: Math.round(Math.max(...scores.map(s => s.writing))),
    averageWordCount: Math.round(scores.reduce((sum, s) => sum + s.wordCount, 0) / scores.length),
    topWordCount: Math.max(...scores.map(s => s.wordCount))
  };
};

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

