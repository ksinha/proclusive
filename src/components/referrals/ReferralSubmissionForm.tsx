"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { User, Building2, Briefcase, MapPin, Clock, FileText, Send } from "lucide-react";

const PROJECT_TYPES = [
  "Commercial Construction",
  "Residential Construction",
  "Renovation/Remodel",
  "Electrical",
  "Plumbing",
  "HVAC",
  "Landscaping",
  "Roofing",
  "Concrete",
  "Painting",
  "Masonry",
  "Flooring",
  "Steel Erection",
  "Demolition",
  "Insulation",
  "Waterproofing",
  "Glazing",
  "Fire Protection",
  "Elevator Installation",
  "Excavation",
  "Other",
];

const VALUE_RANGES = [
  "Under $10k",
  "$10k - $50k",
  "$50k - $100k",
  "$100k - $250k",
  "$250k - $500k",
  "$500k - $1M",
  "Over $1M",
];

const TIMELINES = [
  "Immediate (0-2 weeks)",
  "Short-term (2-4 weeks)",
  "Medium-term (1-3 months)",
  "Long-term (3-6 months)",
  "Future (6+ months)",
];

interface ReferralFormData {
  client_name: string;
  client_email: string;
  client_phone: string;
  client_company: string;
  project_type: string;
  project_description: string;
  value_range: string;
  location: string;
  timeline: string;
  notes: string;
}

export default function ReferralSubmissionForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ReferralFormData>({
    client_name: "",
    client_email: "",
    client_phone: "",
    client_company: "",
    project_type: "",
    project_description: "",
    value_range: "",
    location: "",
    timeline: "",
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[ReferralSubmissionForm] Starting referral submission...");
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Get current user
      console.log("[ReferralSubmissionForm] Getting current user...");
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError) {
        console.error("[ReferralSubmissionForm] Auth error:", authError);
        throw new Error("You must be logged in to submit a referral");
      }

      if (!user) {
        console.error("[ReferralSubmissionForm] No user found");
        throw new Error("You must be logged in to submit a referral");
      }

      console.log("[ReferralSubmissionForm] User authenticated:", user.id);
      console.log("[ReferralSubmissionForm] Form data:", formData);

      // Insert referral with status SUBMITTED
      const { data, error: insertError } = await supabase
        .from("referrals")
        .insert({
          submitted_by: user.id,
          client_name: formData.client_name,
          client_email: formData.client_email || null,
          client_phone: formData.client_phone || null,
          client_company: formData.client_company || null,
          project_type: formData.project_type,
          project_description: formData.project_description || null,
          value_range: formData.value_range || null,
          location: formData.location,
          timeline: formData.timeline || null,
          notes: formData.notes || null,
          status: "SUBMITTED",
        })
        .select()
        .single();

      if (insertError) {
        console.error("[ReferralSubmissionForm] Insert error:", insertError);
        throw insertError;
      }

      console.log("[ReferralSubmissionForm] Referral created:", data.id);

      // Send email notification to admin
      try {
        console.log("[ReferralSubmissionForm] Sending admin notification...");
        await fetch('/api/referrals/notify-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ referralId: data.id }),
        });
        console.log("[ReferralSubmissionForm] Admin notification sent");
      } catch (emailError) {
        // Log but don't fail the submission if email fails
        console.error('[ReferralSubmissionForm] Failed to send admin notification:', emailError);
      }

      // Redirect to success or referrals list
      console.log("[ReferralSubmissionForm] Redirecting to success page...");
      window.location.href = "/dashboard/referrals?success=true";
    } catch (err: any) {
      console.error("[ReferralSubmissionForm] Error submitting referral:", err);
      setError(err.message || "Failed to submit referral");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <p className="text-[14px] text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Client Information */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-[18px] font-semibold text-gray-900">Client Information</CardTitle>
          </div>
          <CardDescription className="text-[14px] text-gray-600">
            Details about the client you're referring
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client_name" className="text-[13px] font-medium text-gray-700">
                Client Name *
              </Label>
              <Input
                type="text"
                name="client_name"
                id="client_name"
                required
                value={formData.client_name}
                onChange={handleChange}
                className="h-10"
                placeholder="John Smith"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_company" className="text-[13px] font-medium text-gray-700">
                Company Name
              </Label>
              <Input
                type="text"
                name="client_company"
                id="client_company"
                value={formData.client_company}
                onChange={handleChange}
                className="h-10"
                placeholder="Acme Corp"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client_email" className="text-[13px] font-medium text-gray-700">
                Email
              </Label>
              <Input
                type="email"
                name="client_email"
                id="client_email"
                value={formData.client_email}
                onChange={handleChange}
                className="h-10"
                placeholder="john@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_phone" className="text-[13px] font-medium text-gray-700">
                Phone Number
              </Label>
              <Input
                type="tel"
                name="client_phone"
                id="client_phone"
                value={formData.client_phone}
                onChange={handleChange}
                className="h-10"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Details */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-[18px] font-semibold text-gray-900">Project Details</CardTitle>
          </div>
          <CardDescription className="text-[14px] text-gray-600">
            Information about the project opportunity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project_type" className="text-[13px] font-medium text-gray-700">
                Project Type *
              </Label>
              <Select
                name="project_type"
                id="project_type"
                required
                value={formData.project_type}
                onChange={handleChange}
                className="h-10"
              >
                <option value="">Select project type</option>
                {PROJECT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="value_range" className="text-[13px] font-medium text-gray-700">
                Project Value Range
              </Label>
              <Select
                name="value_range"
                id="value_range"
                value={formData.value_range}
                onChange={handleChange}
                className="h-10"
              >
                <option value="">Select value range</option>
                {VALUE_RANGES.map((range) => (
                  <option key={range} value={range}>
                    {range}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project_description" className="text-[13px] font-medium text-gray-700">
              Project Description
            </Label>
            <Textarea
              name="project_description"
              id="project_description"
              rows={4}
              value={formData.project_description}
              onChange={handleChange}
              placeholder="Describe the project scope, requirements, and any relevant details..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-[13px] font-medium text-gray-700">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location *
                </div>
              </Label>
              <Input
                type="text"
                name="location"
                id="location"
                required
                value={formData.location}
                onChange={handleChange}
                className="h-10"
                placeholder="San Francisco, CA"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeline" className="text-[13px] font-medium text-gray-700">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Timeline
                </div>
              </Label>
              <Select
                name="timeline"
                id="timeline"
                value={formData.timeline}
                onChange={handleChange}
                className="h-10"
              >
                <option value="">Select timeline</option>
                {TIMELINES.map((timeline) => (
                  <option key={timeline} value={timeline}>
                    {timeline}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Context */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-[18px] font-semibold text-gray-900">Additional Context</CardTitle>
          </div>
          <CardDescription className="text-[14px] text-gray-600">
            Any additional information that would be helpful
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-[13px] font-medium text-gray-700">
              Notes
            </Label>
            <Textarea
              name="notes"
              id="notes"
              rows={4}
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any additional context, requirements, or special considerations..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
          className="h-10"
        >
          Cancel
        </Button>
        <Button type="submit" variant="default" disabled={loading} className="h-10">
          {loading ? (
            "Submitting..."
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Submit Referral
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
