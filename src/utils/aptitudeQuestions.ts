
export interface AptitudeQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // Index of the correct option
  category?: string; // Adding the category property as optional
}

export const aptitudeQuestions: AptitudeQuestion[] = [
  {
    id: 1,
    question: "What is 25% of 80?",
    options: ["15", "20", "25", "30"],
    correctAnswer: 1
  },
  {
    id: 2,
    question: "If a book costs $10, what is the cost for 3 books?",
    options: ["$20", "$30", "$25", "$40"],
    correctAnswer: 1
  },
  {
    id: 3,
    question: "Find the missing number in the sequence: 2, 4, 6, __, 10",
    options: ["7", "8", "9", "10"],
    correctAnswer: 1
  },
  {
    id: 4,
    question: "Which number is the largest?",
    options: ["1/4", "1/3", "1/2", "1/5"],
    correctAnswer: 2
  },
  {
    id: 5,
    question: "What is the next number in the series: 1, 1, 2, 3, 5, ?",
    options: ["5", "6", "7", "8"],
    correctAnswer: 3
  },
  {
    id: 6,
    question: "Select the word that is opposite in meaning to \"ancient\":",
    options: ["Old", "Modern", "Historic", "Obsolete"],
    correctAnswer: 1
  },
  {
    id: 7,
    question: "If \"cat\" is to \"kitten\", then \"dog\" is to:",
    options: ["Pup", "Puppy", "Cub", "Calf"],
    correctAnswer: 1
  },
  {
    id: 8,
    question: "Which of the following figures has 4 equal sides?",
    options: ["Rectangle", "Square", "Trapezoid", "Parallelogram"],
    correctAnswer: 1
  },
  {
    id: 9,
    question: "Which of the following is a prime number?",
    options: ["21", "33", "29", "15"],
    correctAnswer: 2
  },
  {
    id: 10,
    question: "What is the square root of 64?",
    options: ["6", "7", "8", "9"],
    correctAnswer: 2
  },
  {
    id: 11,
    question: "If 5x = 20, what is the value of x?",
    options: ["4", "5", "3", "6"],
    correctAnswer: 0
  },
  {
    id: 12,
    question: "How many months in a year have 31 days?",
    options: ["5", "6", "7", "8"],
    correctAnswer: 2
  },
  {
    id: 13,
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: 1
  },
  {
    id: 14,
    question: "What is the capital of France?",
    options: ["Madrid", "Berlin", "Rome", "Paris"],
    correctAnswer: 3
  },
  {
    id: 15,
    question: "If 3 people take 2 hours to complete a task, how long would 6 people take to complete the same task (assuming equal work distribution)?",
    options: ["1 hour", "2 hours", "3 hours", "0.5 hour"],
    correctAnswer: 0
  },
  {
    id: 16,
    question: "What is the chemical symbol for water?",
    options: ["HO", "H₂O", "O₂", "CO₂"],
    correctAnswer: 1
  },
  {
    id: 17,
    question: "Which gas do plants absorb from the atmosphere?",
    options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
    correctAnswer: 2
  },
  {
    id: 18,
    question: "When you mix red and blue, what color do you get?",
    options: ["Green", "Purple", "Orange", "Brown"],
    correctAnswer: 1
  },
  {
    id: 19,
    question: "Which is the largest continent by area?",
    options: ["Africa", "Europe", "Asia", "Antarctica"],
    correctAnswer: 2
  },
  {
    id: 20,
    question: "What do you call an angle that is more than 90° and less than 180°?",
    options: ["Acute", "Right", "Obtuse", "Straight"],
    correctAnswer: 2
  },
  {
    id: 21,
    question: "Which instrument has 88 keys?",
    options: ["Guitar", "Drum", "Piano", "Violin"],
    correctAnswer: 2
  },
  {
    id: 22,
    question: "If you travel north from the equator, which direction are you going?",
    options: ["East", "West", "North", "South"],
    correctAnswer: 2
  },
  {
    id: 23,
    question: "What is the hardest natural substance on Earth?",
    options: ["Gold", "Iron", "Diamond", "Silver"],
    correctAnswer: 2
  },
  {
    id: 24,
    question: "Which number is both a perfect square and a perfect cube?",
    options: ["64", "36", "16", "81"],
    correctAnswer: 0
  },
  {
    id: 25,
    question: "The cat is to whiskers as the bird is to _____?",
    options: ["Beak", "Wing", "Feather", "Claw"],
    correctAnswer: 0
  },
  {
    id: 26,
    question: "A store sells notebooks at $2 each and pens at $1 each. If a customer buys a total of 10 items and spends $15, how many notebooks did the customer buy?",
    options: ["3", "4", "5", "6"],
    correctAnswer: 2
  },
  {
    id: 27,
    question: "A car's fuel efficiency is 25 miles per gallon. How many gallons of fuel are needed to drive 200 miles?",
    options: ["6", "8", "9", "10"],
    correctAnswer: 1
  },
  {
    id: 28,
    question: "If five machines take 5 minutes to produce 5 widgets, how long would 100 machines take to produce 100 widgets?",
    options: ["5 minutes", "50 minutes", "100 minutes", "10 minutes"],
    correctAnswer: 0
  },
  {
    id: 29,
    question: "A cyclist travels from city A to city B at an average speed of 12 mph and returns by the same route at an average speed of 8 mph. What is the average speed for the round trip?",
    options: ["10 mph", "11 mph", "9.6 mph", "8 mph"],
    correctAnswer: 2
  },
  {
    id: 30,
    question: "Sarah can paint a wall in 45 minutes and John can paint the same wall in 30 minutes. If they paint together, how long will it take them to paint the wall?",
    options: ["15 minutes", "18 minutes", "20 minutes", "25 minutes"],
    correctAnswer: 1
  }
];

export const getRandomAptitudeQuestions = (count: number): AptitudeQuestion[] => {
  // Make a copy of the aptitude questions to avoid modifying the original
  const shuffledQuestions = [...aptitudeQuestions];
  
  // Fisher-Yates shuffle algorithm
  for (let i = shuffledQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledQuestions[i], shuffledQuestions[j]] = [shuffledQuestions[j], shuffledQuestions[i]];
  }
  
  // Return the first 'count' questions or all if count > aptitudeQuestions.length
  return shuffledQuestions.slice(0, Math.min(count, shuffledQuestions.length));
};
