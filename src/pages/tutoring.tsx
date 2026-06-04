import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Clock } from "lucide-react";

import { api, type ApiTutorPublic } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

function formatUGX(amount: number): string {
  return `UGX ${amount.toLocaleString()}`;
}

export default function Tutoring() {
  const [tutors, setTutors] = useState<ApiTutorPublic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getPublicTutors()
      .then(setTutors)
      .catch(() => setTutors([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-10 text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Find a Tutor
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Connect with expert lecturers for personalized academic support
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex min-h-[30vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {/* Empty State */}
      {!loading && tutors.length === 0 && (
        <div className="flex min-h-[30vh] flex-col items-center justify-center text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground/50" />
          <h2 className="mt-4 text-lg font-semibold">No tutors available at the moment</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Check back later for available tutoring sessions.
          </p>
        </div>
      )}

      {/* Tutor Cards Grid */}
      {!loading && tutors.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tutors.map((tutor) => (
            <Card
              key={tutor.id}
              className="flex flex-col rounded-2xl shadow-soft"
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{tutor.name}</CardTitle>
                <div className="flex items-center gap-2">
                  {tutor.is_available ? (
                    <Badge className="border-transparent bg-green-100 text-green-800 hover:bg-green-100">
                      Available
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Unavailable</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-3 pb-3">
                {/* Subjects */}
                {tutor.subjects.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {tutor.subjects.map((subject) => (
                      <Badge key={subject} variant="secondary" className="text-xs">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Hourly Rate */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{formatUGX(tutor.hourly_rate)}/hr</span>
                </div>

                {/* Bio */}
                {tutor.bio && (
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {tutor.bio}
                  </p>
                )}
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link to="/login?message=Sign+in+to+book+a+session">
                    Book Session
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
