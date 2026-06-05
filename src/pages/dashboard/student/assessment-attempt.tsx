import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, CheckCircle, Send } from "lucide-react";
import { toast } from "sonner";

import { api } from "@/lib/api";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Question {
  id: string;
  assessment_id: string;
  question_text: string;
  question_type: string;
  options: string[];
  marks: number;
  order: number;
}

interface Submission {
  id: string;
  score: number;
  total_marks: number;
  is_graded: boolean;
  feedback: string;
  submitted_at: string;
}

export default function StudentAssessmentAttempt() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Student answers
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Result after submission
  const [result, setResult] = useState<{ score: number; total_marks: number; is_graded: boolean; feedback: string } | null>(null);

  useEffect(() => {
    if (assessmentId) loadData();
  }, [assessmentId]);

  async function loadData() {
    try {
      setLoading(true);
      const [questionsData, submissionsData] = await Promise.all([
        api.getAssessmentQuestions(assessmentId!),
        api.getAssessmentSubmissions(assessmentId!),
      ]);
      setQuestions(questionsData as Question[]);
      setSubmissions(submissionsData as Submission[]);
    } catch {
      toast.error("Failed to load assessment");
    } finally {
      setLoading(false);
    }
  }

  function setAnswer(questionId: string, answer: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  }

  async function handleSubmit() {
    // Validate that all questions are answered
    const unanswered = questions.filter((q) => !answers[q.id]?.trim());
    if (unanswered.length > 0) {
      toast.error(`Please answer all questions (${unanswered.length} unanswered)`);
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.submitAssessment({
        assessment_id: assessmentId!,
        answers: questions.map((q) => ({
          question_id: q.id,
          answer: answers[q.id] || "",
        })),
      });
      setResult(response);
      toast.success("Assessment submitted!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // If student already has submissions, show results
  if (submissions.length > 0 && !result) {
    const latestSub = submissions[0];
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
        </div>

        <PageHeader title="Assessment Results" description="Your submission has been recorded." />

        <div className="rounded-2xl border bg-card p-6 shadow-soft space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <h2 className="text-lg font-semibold">Submitted</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border p-4 text-center">
              <p className="text-xs text-muted-foreground">Score</p>
              <p className="text-2xl font-bold">{latestSub.is_graded ? `${latestSub.score}/${latestSub.total_marks}` : "Pending"}</p>
            </div>
            <div className="rounded-xl border p-4 text-center">
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge variant={latestSub.is_graded ? "default" : "secondary"} className="mt-1">
                {latestSub.is_graded ? "Graded" : "Awaiting Grading"}
              </Badge>
            </div>
            <div className="rounded-xl border p-4 text-center">
              <p className="text-xs text-muted-foreground">Percentage</p>
              <p className="text-2xl font-bold">
                {latestSub.is_graded && latestSub.total_marks > 0
                  ? `${Math.round((latestSub.score / latestSub.total_marks) * 100)}%`
                  : "—"}
              </p>
            </div>
          </div>

          {latestSub.feedback && (
            <div className="rounded-xl bg-muted/50 p-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">Lecturer Feedback</p>
              <p className="text-sm">{latestSub.feedback}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show result after just submitting
  if (result) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
        </div>

        <PageHeader title="Assessment Submitted" description="Your answers have been recorded." />

        <div className="rounded-2xl border bg-card p-6 shadow-soft space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <h2 className="text-lg font-semibold">
              {result.is_graded ? "Results" : "Submitted Successfully"}
            </h2>
          </div>

          {result.is_graded ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border p-4 text-center">
                <p className="text-xs text-muted-foreground">Your Score</p>
                <p className="text-3xl font-bold text-primary">{result.score}/{result.total_marks}</p>
              </div>
              <div className="rounded-xl border p-4 text-center">
                <p className="text-xs text-muted-foreground">Percentage</p>
                <p className="text-3xl font-bold">
                  {result.total_marks > 0 ? Math.round((result.score / result.total_marks) * 100) : 0}%
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Your submission is pending review by your lecturer. You'll see your results once it's graded.
            </p>
          )}

          <Button variant="outline" onClick={() => navigate(-1)}>
            Back to Course Unit
          </Button>
        </div>
      </div>
    );
  }

  // Show questions for answering
  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>
      </div>

      <PageHeader
        title="Assessment"
        description={`${questions.length} questions · ${totalMarks} total marks`}
      />

      {questions.length === 0 ? (
        <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground shadow-soft">
          <p className="font-medium">No questions available</p>
          <p className="text-sm mt-1">This assessment has no questions yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div key={q.id} className="rounded-xl border bg-card p-5 shadow-soft space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Q{idx + 1}</Badge>
                  <Badge variant="outline" className="text-xs">{q.marks} mark{q.marks > 1 ? "s" : ""}</Badge>
                </div>
              </div>

              <p className="font-medium">{q.question_text}</p>

              {q.question_type === "mcq" ? (
                <div className="space-y-2">
                  {q.options.map((opt, i) => (
                    <label
                      key={i}
                      className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${answers[q.id] === opt ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}
                    >
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        value={opt}
                        checked={answers[q.id] === opt}
                        onChange={() => setAnswer(q.id, opt)}
                        className="h-4 w-4 accent-primary"
                      />
                      <span className="text-sm">
                        <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
                        {opt}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Your Answer</Label>
                  <Textarea
                    value={answers[q.id] || ""}
                    onChange={(e) => setAnswer(q.id, e.target.value)}
                    placeholder="Type your answer here..."
                    rows={5}
                  />
                </div>
              )}
            </div>
          ))}

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button size="lg" onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Submit Assessment
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
