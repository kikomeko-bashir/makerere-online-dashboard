import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Plus, Trash2, Loader2, CheckCircle, XCircle, ClipboardCheck, Users, Settings,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { api, type ApiAssessment } from "@/lib/api";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EntityFormDialog } from "@/components/dashboard/entity-form-dialog";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";

interface Question {
  id: string;
  assessment_id: string;
  question_text: string;
  question_type: string;
  options: string[];
  correct_answer?: string;
  marks: number;
  order: number;
}

interface Submission {
  id: string;
  assessment_id: string;
  student_id: string;
  answers: Array<{ question_id: string; answer: string }>;
  score: number;
  total_marks: number;
  is_graded: boolean;
  graded_by: string | null;
  feedback: string;
  submitted_at: string;
  graded_at: string | null;
}

export default function LecturerAssessmentDetail() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState<ApiAssessment | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  // Question form
  const [qFormOpen, setQFormOpen] = useState(false);
  const [qForm, setQForm] = useState({
    question_text: "",
    question_type: "mcq",
    options: ["", "", "", ""],
    correct_answer: "",
    marks: 1,
  });

  // Grade form
  const [gradeOpen, setGradeOpen] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  const [gradeScore, setGradeScore] = useState(0);
  const [gradeFeedback, setGradeFeedback] = useState("");

  // Delete
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingQuestion, setDeletingQuestion] = useState<Question | null>(null);

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

      // Get assessment info
      // We need to find it from the course unit — get all assessments and find this one
      // Simple approach: store assessment info from questions endpoint or get it separately
    } catch {
      toast.error("Failed to load assessment data");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddQuestion() {
    if (!qForm.question_text.trim()) {
      toast.error("Question text is required");
      return;
    }
    if (qForm.question_type === "mcq" && !qForm.correct_answer.trim()) {
      toast.error("Correct answer is required for MCQ");
      return;
    }
    try {
      await api.createAssessmentQuestion({
        assessment_id: assessmentId!,
        question_text: qForm.question_text,
        question_type: qForm.question_type,
        options: qForm.question_type === "mcq" ? qForm.options.filter((o) => o.trim()) : [],
        correct_answer: qForm.correct_answer,
        marks: qForm.marks,
        order: questions.length + 1,
      });
      toast.success("Question added");
      setQFormOpen(false);
      setQForm({ question_text: "", question_type: "mcq", options: ["", "", "", ""], correct_answer: "", marks: 1 });
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add question");
    }
  }

  async function handleDeleteQuestion() {
    if (!deletingQuestion) return;
    try {
      await api.deleteAssessmentQuestion(deletingQuestion.id);
      toast.success("Question deleted");
      setDeleteOpen(false);
      setDeletingQuestion(null);
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  async function handleGrade() {
    if (!gradingSubmission) return;
    try {
      await api.gradeSubmission(gradingSubmission.id, {
        score: gradeScore,
        feedback: gradeFeedback,
      });
      toast.success("Submission graded");
      setGradeOpen(false);
      setGradingSubmission(null);
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Grading failed");
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>
      </div>

      <PageHeader title="Assessment Detail" description={`${questions.length} questions · ${totalMarks} total marks · ${submissions.length} submissions`} />

      <Tabs defaultValue="questions" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="questions" className="gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Questions ({questions.length})
          </TabsTrigger>
          <TabsTrigger value="submissions" className="gap-2">
            <Users className="h-4 w-4" />
            Submissions ({submissions.length})
          </TabsTrigger>
        </TabsList>

        {/* ─── Questions Tab ─────────────────────────────────────────────────── */}
        <TabsContent value="questions" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setQFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </div>

          {questions.length === 0 ? (
            <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground shadow-soft">
              <ClipboardCheck className="mx-auto mb-2 h-10 w-10 text-muted-foreground/50" />
              <p className="font-medium">No questions yet</p>
              <p className="text-sm mt-1">Add questions for students to answer.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((q, idx) => (
                <div key={q.id} className="rounded-xl border bg-card p-4 shadow-soft">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">Q{idx + 1}</Badge>
                        <Badge variant="outline" className="text-xs capitalize">{q.question_type}</Badge>
                        <Badge variant="secondary" className="text-xs">{q.marks} mark{q.marks > 1 ? "s" : ""}</Badge>
                      </div>
                      <p className="mt-2 text-sm font-medium">{q.question_text}</p>
                      {q.question_type === "mcq" && q.options.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {q.options.map((opt, i) => (
                            <div key={i} className={`flex items-center gap-2 text-xs rounded px-2 py-1 ${opt === q.correct_answer ? "bg-green-50 text-green-800 font-medium" : "text-muted-foreground"}`}>
                              <span>{String.fromCharCode(65 + i)}.</span>
                              <span>{opt}</span>
                              {opt === q.correct_answer && <CheckCircle className="h-3 w-3" />}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setDeletingQuestion(q); setDeleteOpen(true); }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── Submissions Tab ───────────────────────────────────────────────── */}
        <TabsContent value="submissions" className="space-y-4">
          {submissions.length === 0 ? (
            <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground shadow-soft">
              <Users className="mx-auto mb-2 h-10 w-10 text-muted-foreground/50" />
              <p className="font-medium">No submissions yet</p>
              <p className="text-sm mt-1">Student submissions will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map((sub) => (
                <div key={sub.id} className="rounded-xl border bg-card p-4 shadow-soft">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Student: {sub.student_id.slice(0, 8)}…</p>
                      <p className="text-xs text-muted-foreground">
                        Submitted: {format(new Date(sub.submitted_at), "MMM d, yyyy HH:mm")}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={sub.is_graded ? "default" : "secondary"}>
                          {sub.is_graded ? `${sub.score}/${sub.total_marks}` : "Ungraded"}
                        </Badge>
                        {sub.is_graded && sub.graded_by === "system" && (
                          <Badge variant="outline" className="text-xs">Auto-graded</Badge>
                        )}
                      </div>
                      {sub.feedback && (
                        <p className="text-xs text-muted-foreground mt-1">Feedback: {sub.feedback}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {/* Show answers */}
                      <div className="text-xs text-muted-foreground">
                        {sub.answers.length} answer{sub.answers.length !== 1 ? "s" : ""}
                      </div>
                      {!sub.is_graded && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setGradingSubmission(sub);
                            setGradeScore(0);
                            setGradeFeedback("");
                            setGradeOpen(true);
                          }}
                        >
                          Grade
                        </Button>
                      )}
                      {sub.is_graded && sub.graded_by !== "system" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setGradingSubmission(sub);
                            setGradeScore(sub.score);
                            setGradeFeedback(sub.feedback);
                            setGradeOpen(true);
                          }}
                        >
                          Re-grade
                        </Button>
                      )}
                    </div>
                  </div>
                  {/* Show student answers */}
                  <div className="mt-3 border-t pt-3 space-y-2">
                    {sub.answers.map((ans, i) => {
                      const question = questions.find((q) => q.id === ans.question_id);
                      return (
                        <div key={i} className="text-xs">
                          <p className="font-medium text-muted-foreground">
                            Q{i + 1}: {question?.question_text ?? "Unknown question"}
                          </p>
                          <p className={`ml-4 ${question?.question_type === "mcq" && question.correct_answer === ans.answer ? "text-green-700" : question?.question_type === "mcq" ? "text-red-700" : ""}`}>
                            Answer: {ans.answer}
                            {question?.question_type === "mcq" && (
                              <span className="ml-2 text-muted-foreground">(Correct: {question.correct_answer})</span>
                            )}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ─── Add Question Dialog ──────────────────────────────────────────── */}
      <EntityFormDialog open={qFormOpen} onOpenChange={setQFormOpen} title="Add Question" description="Create a new question for this assessment." onSubmit={handleAddQuestion}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Question Type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={qForm.question_type === "mcq" ? "default" : "outline"}
                size="sm"
                onClick={() => setQForm((f) => ({ ...f, question_type: "mcq" }))}
              >
                Multiple Choice
              </Button>
              <Button
                type="button"
                variant={qForm.question_type === "essay" ? "default" : "outline"}
                size="sm"
                onClick={() => setQForm((f) => ({ ...f, question_type: "essay" }))}
              >
                Essay
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Question</Label>
            <Textarea
              value={qForm.question_text}
              onChange={(e) => setQForm((f) => ({ ...f, question_text: e.target.value }))}
              placeholder="Enter your question..."
              rows={3}
            />
          </div>

          {qForm.question_type === "mcq" && (
            <>
              <div className="space-y-2">
                <Label>Options</Label>
                {qForm.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs font-medium w-5">{String.fromCharCode(65 + i)}.</span>
                    <Input
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...qForm.options];
                        newOpts[i] = e.target.value;
                        setQForm((f) => ({ ...f, options: newOpts }));
                      }}
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setQForm((f) => ({ ...f, options: [...f.options, ""] }))}
                >
                  + Add Option
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Correct Answer</Label>
                <Input
                  value={qForm.correct_answer}
                  onChange={(e) => setQForm((f) => ({ ...f, correct_answer: e.target.value }))}
                  placeholder="Enter the correct option text exactly"
                />
                <p className="text-xs text-muted-foreground">Type the exact text of the correct option.</p>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>Marks</Label>
            <Input
              type="number"
              min={1}
              value={qForm.marks}
              onChange={(e) => setQForm((f) => ({ ...f, marks: Number(e.target.value) }))}
            />
          </div>
        </div>
      </EntityFormDialog>

      {/* ─── Grade Dialog ─────────────────────────────────────────────────── */}
      <EntityFormDialog
        open={gradeOpen}
        onOpenChange={setGradeOpen}
        title="Grade Submission"
        description={`Grading submission from student ${gradingSubmission?.student_id.slice(0, 8)}…`}
        onSubmit={handleGrade}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Score (out of {gradingSubmission?.total_marks ?? 0})</Label>
            <Input
              type="number"
              min={0}
              max={gradingSubmission?.total_marks ?? 100}
              value={gradeScore}
              onChange={(e) => setGradeScore(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Feedback</Label>
            <Textarea
              value={gradeFeedback}
              onChange={(e) => setGradeFeedback(e.target.value)}
              placeholder="Provide feedback to the student..."
              rows={4}
            />
          </div>
        </div>
      </EntityFormDialog>

      {/* ─── Delete Confirmation ──────────────────────────────────────────── */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Question"
        description={`Are you sure you want to delete this question? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteQuestion}
        destructive
      />
    </div>
  );
}
