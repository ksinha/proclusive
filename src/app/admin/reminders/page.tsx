"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Bell,
  Clock,
  Mail,
  User,
  Building2,
  ArrowLeft,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface ApplicationWithProfile {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_reminder_sent: string | null;
  reminder_count: number;
  profile: {
    email: string;
    full_name: string;
    company_name: string;
  };
}

function formatTimeAgo(dateString: string | null): string {
  if (!dateString) return "Never";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffDays > 0) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else {
    return "Less than an hour ago";
  }
}

function getDaysSince(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

export default function AdminRemindersPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [applications, setApplications] = useState<ApplicationWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, 'success' | 'error'>>({});

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        window.location.href = "/auth/login";
        return;
      }
      if (!isAdmin) {
        window.location.href = "/dashboard";
        return;
      }
      loadApplications();
    }
  }, [authLoading, user, isAdmin]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          user_id,
          status,
          created_at,
          updated_at,
          last_reminder_sent,
          reminder_count,
          profile:profiles!applications_user_id_fkey(
            email,
            full_name,
            company_name
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('[Reminders] Error loading applications:', error);
        return;
      }

      // Filter to only show applications that are at least 3 days old
      const eligibleApps = (data || []).filter((app: any) => {
        const daysSinceCreated = getDaysSince(app.created_at);
        return daysSinceCreated >= 3;
      }).map((app: any) => ({
        ...app,
        profile: Array.isArray(app.profile) ? app.profile[0] : app.profile,
      }));

      setApplications(eligibleApps as ApplicationWithProfile[]);
    } catch (err) {
      console.error('[Reminders] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendReminder = async (applicationId: string, email: string, fullName: string) => {
    setSendingReminder(applicationId);

    try {
      const response = await fetch('/api/admin/send-single-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId }),
      });

      const data = await response.json();

      if (data.success) {
        setResults((prev) => ({ ...prev, [applicationId]: 'success' }));
        // Reload to get updated reminder count
        await loadApplications();
      } else {
        setResults((prev) => ({ ...prev, [applicationId]: 'error' }));
      }

      // Clear result after 3 seconds
      setTimeout(() => {
        setResults((prev) => {
          const newResults = { ...prev };
          delete newResults[applicationId];
          return newResults;
        });
      }, 3000);
    } catch (err) {
      console.error('[Reminders] Error sending reminder:', err);
      setResults((prev) => ({ ...prev, [applicationId]: 'error' }));
    } finally {
      setSendingReminder(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1a1d27' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c9a962] mx-auto"></div>
          <p className="mt-4 text-[14px] text-[#b0b2bc]">Loading reminders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#1a1d27' }}>
      {/* Header */}
      <div style={{ background: '#252833', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="p-2 rounded-lg hover:bg-[#282c38] transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-[#b0b2bc]" />
            </Link>
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-[#c9a962]" />
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-white">Application Reminders</h1>
                <p className="text-sm text-[#6a6d78]">Send reminders to incomplete applications</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {applications.length === 0 ? (
          <Card style={{ background: '#252833', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px' }}>
            <CardContent className="py-12 text-center">
              <CheckCircle2 className="h-12 w-12 text-[#4ade80] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Reminders Needed</h3>
              <p className="text-[#b0b2bc] text-sm">
                All pending applications are less than 3 days old, or there are no pending applications.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <p className="text-[#b0b2bc] text-sm mb-4">
              Showing {applications.length} application{applications.length === 1 ? '' : 's'} eligible for reminders (3+ days old)
            </p>

            {applications.map((app) => {
              const daysSinceCreated = getDaysSince(app.created_at);
              const daysSinceActivity = getDaysSince(app.updated_at);
              const isRecentlyReminded = app.last_reminder_sent && getDaysSince(app.last_reminder_sent) < 3;
              const isSending = sendingReminder === app.id;
              const result = results[app.id];

              return (
                <Card
                  key={app.id}
                  style={{
                    background: '#252833',
                    border: result === 'success'
                      ? '1px solid rgba(74, 222, 128, 0.3)'
                      : result === 'error'
                      ? '1px solid rgba(248, 113, 113, 0.3)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                  }}
                >
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between gap-4">
                      {/* User Info */}
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-full bg-[#282c38] flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 text-[#c9a962]" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-[15px] font-medium text-white truncate">
                              {app.profile.full_name}
                            </h3>
                            {app.reminder_count > 0 && (
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#282c38] text-[#b0b2bc]">
                                {app.reminder_count} reminder{app.reminder_count === 1 ? '' : 's'} sent
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-[13px] text-[#6a6d78] mt-1">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3.5 w-3.5" />
                              {app.profile.email}
                            </span>
                            {app.profile.company_name && (
                              <span className="flex items-center gap-1">
                                <Building2 className="h-3.5 w-3.5" />
                                {app.profile.company_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Time Info */}
                      <div className="hidden sm:flex flex-col items-end gap-1 text-[12px] text-[#6a6d78] flex-shrink-0">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          Started: {daysSinceCreated} days ago
                        </span>
                        <span>
                          Last activity: {formatTimeAgo(app.updated_at)}
                        </span>
                        {app.last_reminder_sent && (
                          <span className="text-[#c9a962]">
                            Last reminder: {formatTimeAgo(app.last_reminder_sent)}
                          </span>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="flex-shrink-0">
                        {result === 'success' ? (
                          <div className="flex items-center gap-2 text-[#4ade80] text-sm">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="hidden sm:inline">Sent!</span>
                          </div>
                        ) : result === 'error' ? (
                          <div className="flex items-center gap-2 text-[#f87171] text-sm">
                            <AlertCircle className="h-4 w-4" />
                            <span className="hidden sm:inline">Failed</span>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant={isRecentlyReminded ? "outline" : "default"}
                            onClick={() => sendReminder(app.id, app.profile.email, app.profile.full_name)}
                            disabled={isSending}
                            className="gap-2"
                          >
                            {isSending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                            <span className="hidden sm:inline">
                              {isRecentlyReminded ? 'Remind Again' : 'Send Reminder'}
                            </span>
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Mobile Time Info */}
                    <div className="sm:hidden mt-3 pt-3 border-t border-white/[0.08] flex flex-wrap gap-3 text-[11px] text-[#6a6d78]">
                      <span>Started: {daysSinceCreated}d ago</span>
                      <span>Activity: {formatTimeAgo(app.updated_at)}</span>
                      {app.last_reminder_sent && (
                        <span className="text-[#c9a962]">Reminded: {formatTimeAgo(app.last_reminder_sent)}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
