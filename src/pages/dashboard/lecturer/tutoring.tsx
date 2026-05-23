import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Star, Calendar, Clock } from "lucide-react";

import type { TutoringSession, TutoringSessionStatus } from "@/lib/types";
import { mockTutoringSessions, mockTutorProfiles, mockUsers } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type ColumnDef } from "@/components/dashboard/data-table";
import { EntityFormDialog } from "@/components/dashboard/entity-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function formatUGX(amount: number): string {
  return `UGX ${amount.toLocaleString()}`;
}

function getStatusBadge(status: TutoringSessionStatus) {
  switch (status) {
    case "upcoming":
      return (
        <Badge className="border-transparent bg-blue-100 text-blue-800 hover:bg-blue-100">
          Upcoming
        </Badge>
      );
    case "completed":
      return (
        <Badge className="border-transparent bg-green-100 text-green-800 hover:bg-green-100">
          Completed
        </Badge>
      );
    case "cancelled":
      return <Badge variant="secondary">Cancelled</Badge>;
  }
}

// ─── Lecturer View ─────────────────────────────────────────────────────────────

function LecturerTutoringView() {
  const { user } = useAuth();

  const sessions = mockTutoringSessions.filter((s) => s.tutorId === user.id);
  const tutorProfile = mockTutorProfiles.find((p) => p.userId === user.id);

  const [hourlyRate, setHourlyRate] = useState(tutorProfile?.hourlyRate ?? 50000);
  const [subjects, setSubjects] = useState<string[]>(tutorProfile?.subjects ?? []);

  const allSubjects = [
    "Data Structures",
    "Database Systems",
    "Web Development",
    "Software Engineering",
    "Structural Analysis",
    "Machine Learning",
    "Marketing",
    "Research Methods",
    "Financial Accounting",
    "Constitutional Law",
    "Curriculum Development",
  ];

  const getStudentName = (studentId: string) => {
    const student = mockUsers.find((u) => u.id === studentId);
    return student?.name ?? "Unknown Student";
  };

  const columns: ColumnDef<TutoringSession>[] = [
    {
      key: "studentId",
      header: "Student Name",
      render: (row) => getStudentName(row.studentId),
    },
    { key: "subject", header: "Subject" },
    {
      key: "date",
      header: "Date/Time",
      render: (row) => `${format(new Date(row.date), "MMM d, yyyy")} at ${row.timeSlot}`,
    },
    {
      key: "duration",
      header: "Duration",
      render: (row) => `${row.duration} hr${row.duration > 1 ? "s" : ""}`,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => getStatusBadge(row.status),
    },
  ];

  const toggleSubject = (subject: string) => {
    setSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject],
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Tutoring" description="Manage your tutoring sessions and availability." />

      {/* Sessions Table */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Tutoring Sessions</h2>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <DataTable<Record<string, unknown>>
            columns={columns as unknown as ColumnDef<Record<string, unknown>>[]}
            data={sessions as unknown as Record<string, unknown>[]}
            searchableFields={["subject"]}
            searchPlaceholder="Search sessions..."
            emptyMessage="No tutoring sessions found."
          />
        </div>
      </div>

      {/* Tutoring Settings */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Tutoring Settings</h2>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="space-y-6">
            {/* Available Subjects */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Available Subjects</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {allSubjects.map((subject) => (
                  <div key={subject} className="flex items-center space-x-2">
                    <Checkbox
                      id={`subject-${subject}`}
                      checked={subjects.includes(subject)}
                      onCheckedChange={() => toggleSubject(subject)}
                    />
                    <label
                      htmlFor={`subject-${subject}`}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {subject}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Hourly Rate */}
            <div className="space-y-2">
              <Label htmlFor="hourly-rate">Hourly Rate (UGX)</Label>
              <Input
                id="hourly-rate"
                type="number"
                min={0}
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="max-w-xs"
              />
            </div>

            {/* Weekly Availability */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Weekly Availability</Label>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(
                  [
                    "monday",
                    "tuesday",
                    "wednesday",
                    "thursday",
                    "friday",
                    "saturday",
                    "sunday",
                  ] as const
                ).map((day) => (
                  <div key={day} className="rounded-lg border p-3">
                    <p className="mb-1 text-sm font-medium capitalize">{day}</p>
                    <p className="text-xs text-muted-foreground">
                      {tutorProfile?.availability[day]?.length
                        ? tutorProfile.availability[day].join(", ")
                        : "Not available"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Student View ──────────────────────────────────────────────────────────────

interface BookingFormData {
  tutorId: string;
  subject: string;
  date: string;
  timeSlot: string;
  duration: number;
}

const emptyBookingForm: BookingFormData = {
  tutorId: "",
  subject: "",
  date: "",
  timeSlot: "",
  duration: 1,
};

function StudentTutoringView() {
  const { user } = useAuth();

  const [sessions, setSessions] = useState<TutoringSession[]>([...mockTutoringSessions]);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState<BookingFormData>(emptyBookingForm);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  // Student's sessions
  const mySessions = sessions.filter((s) => s.studentId === user.id);
  const upcomingSessions = mySessions.filter((s) => s.status === "upcoming");
  const pastSessions = mySessions.filter((s) => s.status !== "upcoming");

  // Selected tutor for booking
  const selectedTutor = mockTutorProfiles.find((t) => t.id === formData.tutorId);

  const handleBookSession = (tutorId: string) => {
    setFormData({ ...emptyBookingForm, tutorId });
    setErrors({});
    setFormOpen(true);
  };

  const handleSubmitBooking = () => {
    const newErrors: Partial<Record<string, string>> = {};
    if (!formData.subject) newErrors.subject = "Subject is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.timeSlot) newErrors.timeSlot = "Time slot is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const tutor = mockTutorProfiles.find((t) => t.id === formData.tutorId);
    if (!tutor) return;

    const newSession: TutoringSession = {
      id: `ts-${Date.now()}`,
      tutorId: tutor.userId,
      studentId: user.id,
      subject: formData.subject,
      date: formData.date,
      timeSlot: formData.timeSlot,
      duration: formData.duration,
      hourlyRate: tutor.hourlyRate,
      status: "upcoming",
    };

    setSessions((prev) => [...prev, newSession]);
    toast.success("Session booked!", {
      description: `${formData.duration}hr session with ${tutor.name} on ${format(new Date(formData.date), "MMM d, yyyy")} at ${formData.timeSlot}. Payment of ${formatUGX(tutor.hourlyRate * formData.duration)} will be processed.`,
    });
    setFormOpen(false);
  };

  const sessionColumns: ColumnDef<TutoringSession>[] = [
    {
      key: "tutorId",
      header: "Tutor",
      render: (row) => {
        const tutor = mockUsers.find((u) => u.id === row.tutorId);
        return tutor?.name ?? "Unknown";
      },
    },
    { key: "subject", header: "Subject" },
    {
      key: "date",
      header: "Date/Time",
      render: (row) => `${format(new Date(row.date), "MMM d, yyyy")} at ${row.timeSlot}`,
    },
    {
      key: "duration",
      header: "Duration",
      render: (row) => `${row.duration} hr${row.duration > 1 ? "s" : ""}`,
    },
    {
      key: "hourlyRate",
      header: "Cost",
      render: (row) => formatUGX(row.hourlyRate * row.duration),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => getStatusBadge(row.status),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Tutoring" description="Find tutors and book sessions for extra help." />

      {/* Available Tutors */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Available Tutors</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mockTutorProfiles.map((tutor) => {
            // Check if tutor has any availability
            const hasAvailability = Object.values(tutor.availability).some(
              (slots) => slots.length > 0,
            );

            return (
              <Card key={tutor.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{tutor.name}</CardTitle>
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-muted-foreground">{tutor.rating.toFixed(1)}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-2 pb-3">
                  <div className="flex flex-wrap gap-1">
                    {tutor.subjects.map((subject) => (
                      <Badge key={subject} variant="secondary" className="text-xs">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatUGX(tutor.hourlyRate)}/hr</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {hasAvailability ? (
                      <Badge className="border-transparent bg-green-100 text-green-800 hover:bg-green-100">
                        Available
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Unavailable</Badge>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    disabled={!hasAvailability}
                    onClick={() => handleBookSession(tutor.id)}
                  >
                    Book Session
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Upcoming Sessions */}
      {upcomingSessions.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Upcoming Sessions</h2>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <DataTable<Record<string, unknown>>
              columns={sessionColumns as unknown as ColumnDef<Record<string, unknown>>[]}
              data={upcomingSessions as unknown as Record<string, unknown>[]}
              emptyMessage="No upcoming sessions."
            />
          </div>
        </div>
      )}

      {/* Past Sessions */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Session History</h2>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <DataTable<Record<string, unknown>>
            columns={sessionColumns as unknown as ColumnDef<Record<string, unknown>>[]}
            data={pastSessions as unknown as Record<string, unknown>[]}
            searchableFields={["subject"]}
            searchPlaceholder="Search sessions..."
            emptyMessage="No past sessions."
          />
        </div>
      </div>

      {/* Booking Form Dialog */}
      <EntityFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title="Book Tutoring Session"
        description={
          selectedTutor ? `Book a session with ${selectedTutor.name}` : "Book a tutoring session"
        }
        onSubmit={handleSubmitBooking}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Subject</Label>
            <Select
              value={formData.subject}
              onValueChange={(val) => setFormData((f) => ({ ...f, subject: val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {selectedTutor?.subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="booking-date">Preferred Date</Label>
            <Input
              id="booking-date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData((f) => ({ ...f, date: e.target.value }))}
            />
            {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
          </div>

          <div className="space-y-2">
            <Label>Time Slot</Label>
            <Select
              value={formData.timeSlot}
              onValueChange={(val) => setFormData((f) => ({ ...f, timeSlot: val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select time slot" />
              </SelectTrigger>
              <SelectContent>
                {["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"].map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.timeSlot && <p className="text-xs text-destructive">{errors.timeSlot}</p>}
          </div>

          <div className="space-y-2">
            <Label>Duration (hours)</Label>
            <Select
              value={String(formData.duration)}
              onValueChange={(val) => setFormData((f) => ({ ...f, duration: Number(val) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 hour</SelectItem>
                <SelectItem value="2">2 hours</SelectItem>
                <SelectItem value="3">3 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedTutor && (
            <div className="rounded-lg border bg-muted/50 p-3">
              <p className="text-sm font-medium">Estimated Cost</p>
              <p className="text-lg font-bold text-primary">
                {formatUGX(selectedTutor.hourlyRate * formData.duration)}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatUGX(selectedTutor.hourlyRate)}/hr × {formData.duration} hr
                {formData.duration > 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      </EntityFormDialog>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function DashboardTutoring() {
  const { user } = useAuth();

  if (user.role === "student") {
    return <StudentTutoringView />;
  }

  // Lecturers and admins see the lecturer view
  return <LecturerTutoringView />;
}
