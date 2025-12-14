"use client";

import { useState } from "react";
import { Application, Profile } from "@/types/database.types";
import ApplicationDetail from "./ApplicationDetail";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { FileText, User } from "lucide-react";

interface ApplicationWithProfile extends Application {
  profile: Profile;
}

interface ApplicationsListProps {
  applications: ApplicationWithProfile[];
  onUpdate: () => void;
  onViewingChange: (isViewing: boolean) => void;
}

export default function ApplicationsList({ applications, onUpdate, onViewingChange }: ApplicationsListProps) {
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithProfile | null>(null);

  const handleSelectApplication = (app: ApplicationWithProfile) => {
    setSelectedApplication(app);
    onViewingChange(true);
  };

  const handleCloseApplication = () => {
    setSelectedApplication(null);
    onViewingChange(false);
    onUpdate();
  };

  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <CardTitle className="mt-4">No applications</CardTitle>
          <CardDescription className="mt-2">
            No applications match the selected filter.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "warning",
      under_review: "default",
      approved: "success",
      rejected: "destructive",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status.replace("_", " ").charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
      </Badge>
    );
  };

  const getTier1Progress = (app: Application) => {
    const tier1Points = [
      app.point_1_business_reg,
      app.point_2_prof_license,
      app.point_3_liability_ins,
      app.point_4_workers_comp,
      app.point_5_contact_verify,
    ];

    const submitted = tier1Points.filter((p) => p !== "not_submitted").length;
    const verified = tier1Points.filter((p) => p === "verified").length;

    return { submitted, verified, total: 5 };
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {selectedApplication ? (
        <ApplicationDetail
          application={selectedApplication}
          onClose={handleCloseApplication}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Applicant</TableHead>
              <TableHead>Company / Trade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app) => {
              const progress = getTier1Progress(app);
              return (
                <TableRow key={app.id}>
                  {/* Applicant Cell */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-navy-100 rounded-full flex items-center justify-center">
                        <span className="text-[14px] font-semibold text-navy-700">
                          {getInitials(app.profile.full_name)}
                        </span>
                      </div>
                      <div>
                        <div className="text-[14px] font-medium text-gray-900">
                          {app.profile.full_name}
                        </div>
                        <div className="text-[12px] text-gray-500">
                          {app.profile.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Company Cell */}
                  <TableCell>
                    <div className="text-[14px] font-medium text-gray-900">{app.profile.company_name}</div>
                    <Badge variant="outline" className="mt-1">{app.profile.primary_trade}</Badge>
                  </TableCell>

                  {/* Status Cell */}
                  <TableCell>
                    {getStatusBadge(app.status)}
                  </TableCell>

                  {/* Progress Cell */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-blue-600 rounded-full transition-all"
                          style={{ width: `${(progress.verified / progress.total) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-[12px] text-gray-600 font-tabular-nums">
                        {progress.verified}/{progress.total}
                      </span>
                    </div>
                  </TableCell>

                  {/* Submitted Cell */}
                  <TableCell className="text-gray-600 font-tabular-nums">
                    {new Date(app.created_at).toLocaleDateString()}
                  </TableCell>

                  {/* Actions Cell */}
                  <TableCell>
                    <button
                      onClick={() => handleSelectApplication(app)}
                      className="text-blue-600 hover:text-blue-700 text-[13px] font-medium"
                    >
                      Review
                    </button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </>
  );
}
