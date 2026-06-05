import { Clock, Users } from "lucide-react";
import type { ApiCourse } from "@/lib/api";
import { resolveImageUrl } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import makereLogo from "@/assets/makerere-logo.png";

interface CourseCardProps {
  course: ApiCourse;
  schoolName?: string;
  onClick?: () => void;
  actionButton?: React.ReactNode;
  statusBadge?: React.ReactNode;
}

function formatUGX(amount: number): string {
  if (amount === 0) return "Free";
  return `UGX ${amount.toLocaleString()}`;
}

export function CourseCard({ course, schoolName, onClick, actionButton, statusBadge }: CourseCardProps) {
  return (
    <div
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft hover:shadow-elegant transition-all hover:-translate-y-0.5 cursor-pointer"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden bg-muted">
        <img
          src={resolveImageUrl(course.image_url) || makereLogo}
          alt={course.title}
          className={`h-full w-full ${course.image_url ? "object-cover" : "object-contain p-8 opacity-30"} group-hover:scale-105 transition-transform duration-500`}
        />
        {/* School badge */}
        {schoolName && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-primary/90 text-primary-foreground text-[10px]">
              {schoolName}
            </Badge>
          </div>
        )}
        {/* Fee badge */}
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-card/90 text-foreground text-xs font-semibold">
            {formatUGX(course.fee)}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-base font-semibold leading-tight line-clamp-2">
          {course.title}
        </h3>

        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {course.duration} {course.duration_unit}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            Pass: {course.pass_mark}%
          </span>
        </div>

        {statusBadge && <div className="mt-2">{statusBadge}</div>}

        {/* Action button */}
        {actionButton && <div className="mt-auto pt-3">{actionButton}</div>}
      </div>
    </div>
  );
}
