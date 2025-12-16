import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { QUIZ_QUESTIONS } from "@/lib/quiz-data";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function QuizPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const question = QUIZ_QUESTIONS[currentQuestionIndex];
  const progress = (currentQuestionIndex / QUIZ_QUESTIONS.length) * 100;

  useEffect(() => {
    const storedId = localStorage.getItem("quiz_participant_id");
    if (!storedId) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Please login first.",
      });
      setLocation("/");
      return;
    }
    setParticipantId(storedId);
  }, [setLocation, toast]);

  const handleAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  };

  const handleNext = () => {
    if (!answers[question.id] && answers[question.id] !== "") {
      toast({
        variant: "destructive",
        title: "Required",
        description: "Please answer the question to proceed.",
      });
      return;
    }

    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!participantId) return;

    setIsSubmitting(true);
    try {
      // Convert numeric keys to string keys for the API
      const stringAnswers: Record<string, string> = {};
      for (const [key, value] of Object.entries(answers)) {
        stringAnswers[key] = value;
      }

      await api.createSubmission({
        participantId,
        answers: stringAnswers,
      });
      setIsCompleted(true);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    localStorage.removeItem("quiz_participant_id");
    localStorage.removeItem("quiz_participant_name");
    setLocation("/");
  };

  if (!participantId) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/mega-cv-logo.png" alt="MEGA-CV" className="h-10" />
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span>
              Question {currentQuestionIndex + 1} of {QUIZ_QUESTIONS.length}
            </span>
          </div>
        </div>
        <Progress value={progress} className="h-1 rounded-none bg-slate-100" />
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto p-4 md:p-8 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-none shadow-lg shadow-slate-200/60 overflow-hidden">
              <CardContent className="p-6 md:p-10">
                <div className="mb-8">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm mb-4">
                    Q{question.id}
                  </span>
                  <h2 className="text-2xl font-semibold text-slate-900 leading-tight">
                    {question.text}
                  </h2>
                </div>

                <div className="space-y-6">
                  {question.type === "mcq" ? (
                    <RadioGroup
                      value={answers[question.id] || ""}
                      onValueChange={handleAnswer}
                      className="space-y-3"
                    >
                      {question.options?.map((option, idx) => (
                        <div
                          key={idx}
                          className={`
                          relative flex items-center space-x-3 border p-4 rounded-xl cursor-pointer transition-all
                          ${
                            answers[question.id] === option
                              ? "border-primary bg-primary/5 ring-1 ring-primary"
                              : "border-slate-200 hover:border-primary/50 hover:bg-slate-50"
                          }
                        `}
                        >
                          <RadioGroupItem
                            value={option}
                            id={`opt-${idx}`}
                            className="sr-only"
                          />
                          <Label
                            htmlFor={`opt-${idx}`}
                            className="flex-1 cursor-pointer text-base font-medium text-slate-700 pl-2"
                            onClick={() => handleAnswer(option)}
                          >
                            <span className="mr-3 font-bold text-primary opacity-50">
                              {String.fromCharCode(65 + idx)}.
                            </span>
                            {option}
                          </Label>
                          {answers[question.id] === option && (
                            <CheckCircle2 className="w-5 h-5 text-primary absolute right-4" />
                          )}
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Type your answer here..."
                        className="min-h-[150px] text-lg p-4 resize-none border-slate-200 focus:border-primary focus:ring-primary/20"
                        value={answers[question.id] || ""}
                        onChange={(e) => handleAnswer(e.target.value)}
                      />
                      <p className="text-xs text-slate-400 text-right">
                        {answers[question.id]?.length || 0} characters
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-10 flex justify-end">
                  <Button
                    onClick={handleNext}
                    size="lg"
                    className="px-8 text-base"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Submitting..."
                      : currentQuestionIndex === QUIZ_QUESTIONS.length - 1
                        ? "Submit Quiz"
                        : "Next Question"}
                    {currentQuestionIndex !== QUIZ_QUESTIONS.length - 1 &&
                      !isSubmitting && (
                        <ChevronRight className="ml-2 w-4 h-4" />
                      )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </main>

      <Dialog open={isCompleted} onOpenChange={setIsCompleted}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader className="flex flex-col items-center gap-4 py-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <DialogTitle className="text-2xl">Quiz Completed!</DialogTitle>
            <DialogDescription className="text-base pt-2">
              Thank you for participating in the MEGA CV Surgical Infection
              Decision Quiz. Your responses have been recorded.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={handleFinish}
              className="w-full sm:w-auto min-w-[120px]"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
