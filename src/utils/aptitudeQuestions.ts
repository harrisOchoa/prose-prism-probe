
export interface AptitudeQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // Index of the correct option
}

export const aptitudeQuestions: AptitudeQuestion[] = [
  {
    id: 1,
    question: "Which of the following is not a primitive data type in JavaScript?",
    options: ["String", "Number", "Boolean", "Array"],
    correctAnswer: 3
  },
  {
    id: 2,
    question: "What does CSS stand for?",
    options: ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style Sheets", "Colorful Style Sheets"],
    correctAnswer: 1
  },
  {
    id: 3,
    question: "If a train travels at 60 mph, how long will it take to travel 180 miles?",
    options: ["2 hours", "3 hours", "4 hours", "6 hours"],
    correctAnswer: 1
  },
  {
    id: 4,
    question: "Which of the following is an example of a properly formatted HTML tag?",
    options: ["<p>Text</p>", "<paragraph>Text</paragraph>", "<text>Text</text>", "[p]Text[/p]"],
    correctAnswer: 0
  },
  {
    id: 5,
    question: "A company's sales increased from $10,000 to $12,000. What is the percentage increase?",
    options: ["2%", "12%", "20%", "120%"],
    correctAnswer: 2
  },
  {
    id: 6,
    question: "Which of the following is NOT a valid HTTP request method?",
    options: ["GET", "POST", "DELETE", "FETCH"],
    correctAnswer: 3
  },
  {
    id: 7,
    question: "If 5x + 3 = 18, what is the value of x?",
    options: ["2", "3", "5", "15"],
    correctAnswer: 1
  },
  {
    id: 8,
    question: "Which data structure operates on a LIFO (Last In, First Out) principle?",
    options: ["Queue", "Stack", "Linked List", "Tree"],
    correctAnswer: 1
  },
  {
    id: 9,
    question: "What does API stand for?",
    options: ["Application Programming Interface", "Application Process Integration", "Advanced Programming Interface", "Automated Process Interaction"],
    correctAnswer: 0
  },
  {
    id: 10,
    question: "If a rectangle has a width of 5 units and a length of 8 units, what is its area?",
    options: ["13 square units", "26 square units", "40 square units", "80 square units"],
    correctAnswer: 2
  },
  {
    id: 11,
    question: "Which of the following is a valid way to declare a variable in JavaScript?",
    options: ["var x = 5;", "variable x = 5;", "v x = 5;", "int x = 5;"],
    correctAnswer: 0
  },
  {
    id: 12,
    question: "In a group of 30 people, 40% are males. How many females are in the group?",
    options: ["12", "18", "16", "14"],
    correctAnswer: 1
  },
  {
    id: 13,
    question: "Which of the following is NOT a JavaScript framework or library?",
    options: ["React", "Angular", "Vue", "Pascal"],
    correctAnswer: 3
  },
  {
    id: 14,
    question: "If you invest $1000 at a 5% annual interest rate, how much will you have after 2 years (simple interest)?",
    options: ["$1050", "$1100", "$1102.50", "$1200"],
    correctAnswer: 1
  },
  {
    id: 15,
    question: "Which HTML tag is used to create a hyperlink?",
    options: ["<link>", "<a>", "<href>", "<url>"],
    correctAnswer: 1
  },
  {
    id: 16,
    question: "What is the output of 2 + 2 * 3?",
    options: ["6", "8", "10", "12"],
    correctAnswer: 1
  },
  {
    id: 17,
    question: "Which of the following is a valid CSS selector?",
    options: ["#header", "header@", ".header", "*header"],
    correctAnswer: 0
  },
  {
    id: 18,
    question: "A car travels 150 miles in 3 hours. What is its average speed?",
    options: ["45 mph", "50 mph", "60 mph", "75 mph"],
    correctAnswer: 1
  },
  {
    id: 19,
    question: "What does SQL stand for?",
    options: ["Structured Query Language", "Simple Query Language", "Standard Query Logic", "System Question Language"],
    correctAnswer: 0
  },
  {
    id: 20,
    question: "If log(x) = 2, what is the value of x?",
    options: ["10", "20", "100", "200"],
    correctAnswer: 2
  },
  {
    id: 21,
    question: "Which of the following is NOT a property of a flex container in CSS?",
    options: ["flex-direction", "justify-content", "align-items", "flex-color"],
    correctAnswer: 3
  },
  {
    id: 22,
    question: "If a shirt costs $25 and is discounted by 20%, what is the final price?",
    options: ["$5", "$20", "$22.50", "$20.50"],
    correctAnswer: 1
  },
  {
    id: 23,
    question: "Which protocol is used for secure web browsing?",
    options: ["HTTP", "FTP", "HTTPS", "SMTP"],
    correctAnswer: 2
  },
  {
    id: 24,
    question: "A recipe calls for 2/3 cup of flour. If you want to make 1.5 times the recipe, how much flour do you need?",
    options: ["1 cup", "1.5 cups", "1 cup", "3/4 cup"],
    correctAnswer: 0
  },
  {
    id: 25,
    question: "Which of the following is a valid way to comment in JavaScript?",
    options: ["// Comment", "<!-- Comment -->", "# Comment", "/* Comment */"],
    correctAnswer: 0
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
