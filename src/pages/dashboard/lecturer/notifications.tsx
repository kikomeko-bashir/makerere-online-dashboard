import { useState, useMemo, useEffect } from "react";
import { CheckCheck } from "lucide-react";
import { format, differenceInHours, differenceInMinutes } from "date-fns";
import { toast } from "sonner";

import type { Notification, NotificationCategory } from "@/lib/types";
import {
  mockNotifications,
  mockExaminations,
  mockVirtualClasses,
  mockEnrollments,
  mockCourses,
} from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function getCategoryBadge(category: NotificationCategory) {
  switch (category) {
    case "enrollment":
      return (
        <Badge className="border-transparent bg-blue-100 text-blue-800 hover:bg-blue-100">
          Enrollment
        </Badge>
      );
    case "payment":
      return (
        <Badge className="border-transparent bg-green-100 text-green-800 hover:bg-green-100">
          Payment
        </Badge>
      );
    case "class":
      return (
        <Badge className="border-transparent bg-purple-100 text-purple-800 hover:bg-purple-100">
          Class
        </Badge>
      );
    case "exam":
      return (
        <Badge className="border-transparent bg-orange-100 text-orange-800 hover:bg-orange-100">
          Exam
        </Badge>
      );
  }
}

export default function DashboardNotifications() {
  const { user } = useAuth();
  const isStudent = user.role === "student";

  const [notifications, setNotifications] = useState<Notification[]>([...mockNotifications]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [readFilter, setReadFilter] = useState<string>("all");

  // Toast notifications for students on page load
  useEffect(() => {
    if (!isStudent) return;

    const now = new Date();

    // Get enrolled course unit IDs
    const studentEnrollments = mockEnrollments.filter(
      (e) => e.studentId === user.id && e.status !== "dropped",
    );
    const enrolledCourseIds = studentEnrollments.map((e) => e.courseId).filter(Boolean) as string[];
    const unitIdsFromCourses = mockCourses
      .filter((c) => enrolledCourseIds.includes(c.id))
      .flatMap((c) => c.unitIds);
    const directUnitIds = studentEnrollments.map((e) => e.courseUnitId).filter(Boolean) as string[];
    const enrolledUnitIds = [...new Set([...unitIdsFromCourses, ...directUnitIds])];

    // Check for exam deadlines within 24 hours
    mockExaminations
      .filter((exam) => {
        if (exam.status !== "active") return false;
        if (!enrolledUnitIds.includes(exam.courseUnitId)) return false;
        const endDate = new Date(exam.endDate);
        const hoursUntilDeadline = differenceInHours(endDate, now);
        return hoursUntilDeadline > 0 && hoursUntilDeadline <= 24;
      })
      .forEach((exam) => {
        const hoursLeft = differenceInHours(new Date(exam.endDate), now);
        toast.warning(`Exam deadline approaching!`, {
          description: `"${exam.title}" is due in ${hoursLeft} hour${hoursLeft !== 1 ? "s" : ""}`,
          duration: 8000,
        });
      });

    // Check for live classes starting within 15 minutes
    mockVirtualClasses
      .filter((cls) => {
        if (!enrolledUnitIds.includes(cls.courseUnitId)) return false;
        const classDateTime = new Date(`${cls.date}T${cls.startTime}`);
        const minutesUntilClass = differenceInMinutes(classDateTime, now);
        return minutesUntilClass > 0 && minutesUntilClass <= 15;
      })
      .forEach((cls) => {
        const minutesLeft = differenceInMinutes(new Date(`${cls.date}T${cls.startTime}`), now);
        toast.info(`Live class starting soon!`, {
          description: `"${cls.title}" starts in ${minutesLeft} minute${minutesLeft !== 1 ? "s" : ""}`,
          duration: 10000,
        });
      });
  }, [isStudent, user.id]);

  // Filter notifications for current user
  const userNotifications = notifications.filter((n) => n.userId === user.id);

  const filteredNotifications = useMemo(() => {
    let filtered = userNotifications;

    if (categoryFilter !== "all") {
      filtered = filtered.filter((n) => n.category === categoryFilter);
    }

    if (readFilter === "read") {
      filtered = filtered.filter((n) => n.isRead);
    } else if (readFilter === "unread") {
      filtered = filtered.filter((n) => !n.isRead);
    }

    // Sort by date, most recent first
    return filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [userNotifications, categoryFilter, readFilter]);

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => (n.userId === user.id ? { ...n, isRead: true } : n)),
    );
    toast.success("All notifications marked as read");
  };

  const unreadCount = userNotifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" description="Stay updated with your latest notifications.">
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark All as Read
          </Button>
        )}
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="enrollment">Enrollment</SelectItem>
            <SelectItem value="payment">Payment</SelectItem>
            <SelectItem value="class">Class</SelectItem>
            <SelectItem value="exam">Exam</SelectItem>
          </SelectContent>
        </Select>

        <Select value={readFilter} onValueChange={setReadFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="read">Read</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notification List */}
      <div className="space-y-2">
        {filteredNotifications.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground shadow-soft">
            <p>No notifications found.</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`cursor-pointer rounded-2xl border border-border bg-card p-4 shadow-soft transition-colors hover:bg-muted/50 ${
                !notification.isRead ? "border-l-4 border-l-primary" : ""
              }`}
              onClick={() => handleMarkAsRead(notification.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {!notification.isRead && <span className="h-2 w-2 rounded-full bg-primary" />}
                    <p
                      className={`text-sm ${!notification.isRead ? "font-semibold" : "font-medium"}`}
                    >
                      {notification.title}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {notification.message}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getCategoryBadge(notification.category)}
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {format(new Date(notification.createdAt), "MMM d, yyyy HH:mm")}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
