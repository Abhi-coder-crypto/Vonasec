export type QuestionType = "mcq" | "text";

export interface Question {
  id: number;
  text: string;
  type: QuestionType;
  options?: string[];
  correctAnswer?: string;
}

// NOTE:
// MCQ questions include `options`
// Text-input questions use type: "text" and have NO options

export const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "How often do you encounter patients with persistent reflux symptoms despite management therapy?",
    type: "mcq",
    options: [
      "Rarely (less than 10%)",
      "Occasionally (10–25%)",
      "Frequently (25–50%)",
      "Very often (>50%)"
    ]
  },
  {
    id: 2,
    text: "What, in your opinion, is the most common reason for suboptimal response to PPI / other management therapy?",
    type: "mcq",
    options: [
      "Poor compliance or incorrect timing",
      "Nocturnal or non-acid reflux",
      "Functional heartburn or hypersensitivity",
      "True PPI resistance"
    ]
  },
  {
    id: 3,
    text: "Which subgroup of GERD patients do you find most challenging to manage?",
    type: "mcq",
    options: [
      "Nocturnal Acid Breakthrough",
      "Obese or post-bariatric patients",
      "Patients on chronic NSAIDs",
      "Functional dyspepsia overlap cases"
    ]
  },
  {
    id: 4,
    text: "Have you prescribed Vonoprazan or any P-CAB in your practice?",
    type: "mcq",
    options: [
      "Yes, regularly",
      "Yes, occasionally",
      "Tried in few selected cases",
      "Not yet, but aware of it"
    ]
  },
  {
    id: 5,
    text: "In which patient profiles would you consider next-generation acid suppression as first choice?",
    type: "mcq",
    options: [
      "PPI non-responders",
      "Severe or erosive GERD",
      "High-risk or frequent relapsers",
      "All of the above"
    ]
  },
  {
    id: 6,
    text: "How many cases of H. pylori infection do you encounter, on average, per month in your clinical practice?",
    type: "mcq",
    options: [
      "Fewer than 5 cases",
      "5 - 15 cases",
      "16 - 30 cases",
      "More than 30 cases"
    ]
  },
  {
    id: 7,
    text: "What is your current first-line therapy for H. pylori eradication?",
    type: "mcq",
    options: [
      "PPI + Amoxicillin + Clarithromycin",
      "PPI + Amoxicillin + Metronidazole",
      "PPI + Bismuth + Tetracycline + Metronidazole",
      "Sequential therapy: PPI + Amoxicillin for 7 days followed by PPI + Amoxicillin + Clarithromycin + Metronidazole for 7 days",
      "PPI + Amoxicillin + Levofloxacin"
    ]
  },
  {
    id: 8,
    text: "In your clinical experience, how effective are conventional PPI-based triple therapy regimens in achieving H. pylori eradication?",
    type: "mcq",
    options: [
      ">90% eradication consistently",
      "80–90% eradication",
      "70–80% eradication",
      "<70% eradication / frequent failures"
    ]
  },
  {
    id: 9,
    text: "What do you consider the primary benefits of Vonoprazan over traditional PPIs for H. pylori eradication?",
    type: "mcq",
    options: [
      "Faster onset of acid suppression",
      "Stronger and more sustained acid suppression",
      "Reduced variability due to CYP2C19 polymorphisms",
      "Meal-independent dosing"
    ]
  },
  {
    id: 10,
    text: "What challenges have you faced with PPI-based H. pylori treatment?",
    type: "text"
  }
];
