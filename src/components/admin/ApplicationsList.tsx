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
      <Card style={{ background: '#252833', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px' }}>
        <CardContent className="py-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-[#6a6d78]" />
          <CardTitle className="mt-4 text-white">No applications</CardTitle>
          <CardDescription className="mt-2 text-[#b0b2bc]">
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
      app.point_1_business_reg,    // Business Registration
      app.point_2_prof_license,    // Professional License
      app.point_3_liability_ins,   // Liability Insurance
      app.point_4_workers_comp,    // Workers' Compensation
      app.point_5_contact_verify,  // Contact Verification
      app.point_6_portfolio,       // Tax Compliance (W-9)
    ];

    const submitted = tier1Points.filter((p) => p !== "not_submitted").length;
    const verified = tier1Points.filter((p) => p === "verified").length;

    return { submitted, verified, total: tier1Points.length };
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
        <div style={{ background: '#252833', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', overflow: 'hidden' }}>
          <Table>
            <TableHeader style={{ background: '#282c38' }}>
              <TableRow style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <TableHead style={{ color: '#6a6d78', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.75rem' }}>Applicant</TableHead>
                <TableHead style={{ color: '#6a6d78', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.75rem' }}>Company / Trade</TableHead>
                <TableHead style={{ color: '#6a6d78', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.75rem' }}>Status</TableHead>
                <TableHead style={{ color: '#6a6d78', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.75rem' }}>Progress</TableHead>
                <TableHead style={{ color: '#6a6d78', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.75rem' }}>Submitted</TableHead>
                <TableHead style={{ color: '#6a6d78', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.75rem' }}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => {
                const progress = getTier1Progress(app);
                return (
                  <TableRow key={app.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }} className="hover:bg-[#2f3442] transition-colors">
                    {/* Applicant Cell */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#282c38' }}>
                          <span className="text-[14px] font-semibold text-[#c9a962]">
                            {getInitials(app.profile.full_name)}
                          </span>
                        </div>
                        <div>
                          <div className="text-[14px] font-medium text-white">
                            {app.profile.full_name}
                          </div>
                          <div className="text-[12px] text-[#6a6d78]">
                            {app.profile.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Company Cell */}
                    <TableCell>
                      <div className="text-[14px] font-medium text-white">{app.profile.company_name}</div>
                      <Badge variant="outline" className="mt-1">{app.profile.primary_trade}</Badge>
                    </TableCell>

                    {/* Status Cell */}
                    <TableCell>
                      {getStatusBadge(app.status)}
                    </TableCell>

                    {/* Progress Cell */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 rounded-full" style={{ background: 'rgba(255, 255, 255, 0.08)' }}>
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{ background: '#c9a962', width: `${(progress.verified / progress.total) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-[12px] text-[#b0b2bc] font-tabular-nums">
                          {progress.verified}/{progress.total}
                        </span>
                      </div>
                    </TableCell>

                    {/* Submitted Cell */}
                    <TableCell className="text-[#b0b2bc] font-tabular-nums">
                      {new Date(app.created_at).toLocaleDateString()}
                    </TableCell>

                    {/* Actions Cell */}
                    <TableCell>
                      <button
                        onClick={() => handleSelectApplication(app)}
                        className="text-[#c9a962] hover:text-[#d4b574] text-[13px] font-medium transition-colors"
                      >
                        Review
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
