import { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Calendar, Clock } from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { api, type ApiTutoringBooking, type ApiTutorPublic } from "@/lib/api";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type ColumnDef } from "@/components/dashboard/data-table";
import { EntityFormDialog } from "@/components/dashboard/entity-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
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

function getStatusBadge(status: string) {
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
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

// ─── Lecturer View ─────────────────────────────────────────────────────────────

function LecturerTutoringView() {
  const [bookings, setBookings] = useState<ApiTutoringBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const [hourlyRate, setHourlyRate] = useState(50000);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);

  // Fetch bookings for this tutor
  useEffect(() => {
    setLoadingBookings(true);
    api
      .getTutoringBookings()
      .then((data) => setBookings(data))
      .catch(() => setBookings([]))
      .finally(() => setLoadingBookings(false));
  }, []);

  // Fetch course units to use as available subjects
  useEffect(() => {
    api.getCourseUnits()
      .then((units) => {
        const unitTitles = units
          .filter((u) => u.status === "active")
          .map((u) => u.title);
        setAvailableSubjects(unitTitles);
      })
      .catch(() => setAvailableSubjects([]));
  }, []);

  // Load existing profile on mount
  useEffect(() => {
    setProfileLoading(true);
    api
      .getMyTutorProfile()
      .then((profile) => {
        setSubjects(profile.subjects);
        setHourlyRate(profile.hourly_rate);
        setBio(profile.bio);
        setIsAvailable(profile.is_available);
        setApprovalStatus(profile.approval_status);
        setHasProfile(true);
      })
      .catch(() => {
        // No profile yet
        setHasProfile(false);
        setApprovalStatus(null);
      })
      .finally(() => setProfileLoading(false));
  }, []);

  const handleSubmitApplication = async () => {
    if (subjects.length === 0) {
      toast.error("Please select at least one subject");
      return;
    }
    if (!bio.trim()) {
      toast.error("Please write a bio describing your tutoring experience");
      return;
    }

    setSubmitting(true);
    try {
      const profile = await api.updateMyTutorProfile({
        subjects,
        hourly_rate: hourlyRate,
        bio,
        is_available: isAvailable,
      });
      setApprovalStatus(profile.approval_status);
      setHasProfile(true);
      setEditing(false);
      toast.success(
        hasProfile ? "Application updated!" : "Tutoring application submitted!",
        {
          description: hasProfile
            ? "Your changes have been saved."
            : "Your application is now pending admin approval.",
        },
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to submit application";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ColumnDef<ApiTutoringBooking>[] = [
    {
      key: "student_id",
      header: "Student",
      render: (row) => row.student_id.slice(0, 8) + "…",
    },
    { key: "subject", header: "Subject" },
    {
      key: "date",
      header: "Date/Time",
      render: (row) => `${format(new Date(row.date), "MMM d, yyyy")} at ${row.time_slot}`,
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

  if (profileLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Tutoring" description="Apply to become a tutor and manage your tutoring sessions." />

      {/* ─── Application Section ───────────────────────────────────────────── */}
      {!hasProfile && !editing ? (
        /* No application yet — show call to action */
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
          <div className="mx-auto max-w-md space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Become a Tutor</h2>
            <p className="text-sm text-muted-foreground">
              Share your expertise with students by offering tutoring sessions.
              Submit an application and an admin will review it.
              Once approved, you'll appear on the public tutoring page.
            </p>
            <Button size="lg" onClick={() => setEditing(true)}>
              Apply to Tutor
            </Button>
          </div>
        </div>
      ) : hasProfile && !editing ? (
        /* Has profile — show application status and details */
        <div className="space-y-4">
          {/* Status Banner */}
          {approvalStatus === "pending" && (
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
              <p className="font-medium">⏳ Your application is pending review</p>
              <p className="mt-1 text-xs">An admin will review your application. Once approved, your profile will be visible to students and on the public tutoring page.</p>
            </div>
          )}
          {approvalStatus === "rejected" && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <p className="font-medium">❌ Your application was not approved</p>
              <p className="mt-1 text-xs">You can update your profile and resubmit. Please ensure your bio and subjects are complete.</p>
            </div>
          )}
          {approvalStatus === "approved" && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              <p className="font-medium">✅ Your application is approved</p>
              <p className="mt-1 text-xs">You're visible to students on the public tutoring page. Students can book sessions with you.</p>
            </div>
          )}

          {/* Application Profile Card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-semibold">Your Tutor Application</h2>
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                Edit Application
              </Button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border border-border p-4">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <div className="mt-1">
                    {approvalStatus === "approved" && (
                      <Badge className="border-transparent bg-green-100 text-green-800">Approved</Badge>
                    )}
                    {approvalStatus === "pending" && (
                      <Badge className="border-transparent bg-yellow-100 text-yellow-800">Pending</Badge>
                    )}
                    {approvalStatus === "rejected" && (
                      <Badge className="border-transparent bg-red-100 text-red-800">Rejected</Badge>
                    )}
                  </div>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <p className="text-xs text-muted-foreground">Hourly Rate</p>
                  <p className="mt-1 font-semibold">{formatUGX(hourlyRate)}/hr</p>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <p className="text-xs text-muted-foreground">Availability</p>
                  <div className="mt-1">
                    {isAvailable ? (
                      <Badge className="border-transparent bg-green-100 text-green-800">Available</Badge>
                    ) : (
                      <Badge variant="secondary">Not Available</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Subjects</p>
                <div className="flex flex-wrap gap-1">
                  {subjects.length > 0 ? (
                    subjects.map((s) => (
                      <Badge key={s} variant="secondary">{s}</Badge>
                    ))
                  ) : (
                    <span className="text-sm italic text-muted-foreground">No subjects selected</span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Bio</p>
                <p className="text-sm">{bio || <span className="italic text-muted-foreground">No bio provided</span>}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Editing / Creating application form */
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="text-lg font-semibold mb-4">
            {hasProfile ? "Edit Your Application" : "Tutor Application Form"}
          </h2>
          <div className="space-y-6">
            {/* Available for Tutoring Toggle */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="available-toggle"
                checked={isAvailable}
                onCheckedChange={(checked) => setIsAvailable(checked === true)}
              />
              <label
                htmlFor="available-toggle"
                className="text-sm font-medium leading-none"
              >
                Available for Tutoring
              </label>
            </div>

            {/* Subjects */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Subjects you can tutor <span className="text-destructive">*</span></Label>
              {availableSubjects.length === 0 ? (
                <p className="text-xs text-muted-foreground">No course units available in the system yet.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {availableSubjects.map((subject) => (
                    <div key={subject} className="flex items-center space-x-2">
                      <Checkbox
                        id={`subject-${subject}`}
                        checked={subjects.includes(subject)}
                        onCheckedChange={() => toggleSubject(subject)}
                      />
                      <label
                        htmlFor={`subject-${subject}`}
                        className="text-sm leading-none"
                      >
                        {subject}
                      </label>
                    </div>
                  ))}
                </div>
              )}
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

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="tutor-bio">Bio <span className="text-destructive">*</span></Label>
              <Textarea
                id="tutor-bio"
                placeholder="Describe your tutoring approach, experience, qualifications, and what students can expect..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">This will be shown to students considering your profile.</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button onClick={handleSubmitApplication} disabled={submitting}>
                {submitting
                  ? "Submitting..."
                  : hasProfile
                    ? "Update Application"
                    : "Submit Application"}
              </Button>
              {hasProfile && (
                <Button variant="outline" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Tutoring Sessions (only show if profile exists and approved) ──── */}
      {hasProfile && approvalStatus === "approved" && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Tutoring Sessions</h2>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <DataTable<Record<string, unknown>>
              columns={columns as unknown as ColumnDef<Record<string, unknown>>[]}
              data={bookings as unknown as Record<string, unknown>[]}
              searchableFields={["subject"]}
              searchPlaceholder="Search sessions..."
              emptyMessage={loadingBookings ? "Loading sessions..." : "No tutoring sessions yet."}
            />
          </div>
        </div>
      )}
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
  const [bookings, setBookings] = useState<ApiTutoringBooking[]>([]);
  const [tutors, setTutors] = useState<ApiTutorPublic[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingTutors, setLoadingTutors] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState<BookingFormData>(emptyBookingForm);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch bookings
  const fetchBookings = () => {
    setLoadingBookings(true);
    api
      .getTutoringBookings()
      .then((data) => setBookings(data))
      .catch(() => setBookings([]))
      .finally(() => setLoadingBookings(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Fetch available tutors
  useEffect(() => {
    setLoadingTutors(true);
    api
      .getPublicTutors()
      .then((data) => setTutors(data))
      .catch(() => setTutors([]))
      .finally(() => setLoadingTutors(false));
  }, []);

  // Student's sessions split by status
  const upcomingSessions = bookings.filter((b) => b.status === "upcoming");
  const pastSessions = bookings.filter((b) => b.status !== "upcoming");

  // Selected tutor for booking
  const selectedTutor = tutors.find((t) => t.id === formData.tutorId);

  const handleBookSession = (tutorId: string) => {
    setFormData({ ...emptyBookingForm, tutorId });
    setErrors({});
    setFormOpen(true);
  };

  const handleSubmitBooking = async () => {
    const newErrors: Partial<Record<string, string>> = {};
    if (!formData.subject) newErrors.subject = "Subject is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.timeSlot) newErrors.timeSlot = "Time slot is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!selectedTutor) return;

    setSubmitting(true);
    try {
      await api.createTutoringBooking({
        tutor_profile_id: selectedTutor.id,
        subject: formData.subject,
        date: formData.date,
        time_slot: formData.timeSlot,
        duration: formData.duration,
      });
      toast.success("Session booked!", {
        description: `${formData.duration}hr session with ${selectedTutor.name} on ${format(new Date(formData.date), "MMM d, yyyy")} at ${formData.timeSlot}. Payment of ${formatUGX(selectedTutor.hourly_rate * formData.duration)} will be processed.`,
      });
      setFormOpen(false);
      fetchBookings();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to book session";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const sessionColumns: ColumnDef<ApiTutoringBooking>[] = [
    {
      key: "tutor_profile_id",
      header: "Tutor",
      render: (row) => {
        const tutor = tutors.find((t) => t.id === row.tutor_profile_id);
        return tutor?.name ?? row.tutor_profile_id.slice(0, 8) + "…";
      },
    },
    { key: "subject", header: "Subject" },
    {
      key: "date",
      header: "Date/Time",
      render: (row) => `${format(new Date(row.date), "MMM d, yyyy")} at ${row.time_slot}`,
    },
    {
      key: "duration",
      header: "Duration",
      render: (row) => `${row.duration} hr${row.duration > 1 ? "s" : ""}`,
    },
    {
      key: "total_cost",
      header: "Cost",
      render: (row) => formatUGX(row.total_cost),
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
        {loadingTutors ? (
          <p className="text-sm text-muted-foreground">Loading tutors...</p>
        ) : tutors.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tutors available at the moment.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tutors.map((tutor) => (
              <Card key={tutor.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{tutor.name}</CardTitle>
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
                    <span>{formatUGX(tutor.hourly_rate)}/hr</span>
                  </div>
                  {tutor.bio && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{tutor.bio}</p>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {tutor.is_available ? (
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
                    disabled={!tutor.is_available}
                    onClick={() => handleBookSession(tutor.id)}
                  >
                    Book Session
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
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
            emptyMessage={loadingBookings ? "Loading sessions..." : "No past sessions."}
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
                {formatUGX(selectedTutor.hourly_rate * formData.duration)}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatUGX(selectedTutor.hourly_rate)}/hr × {formData.duration} hr
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
