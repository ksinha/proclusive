"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CustomSelect } from "@/components/ui/custom-select";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { User, Building2, Briefcase, MapPin, Clock, FileText, Send } from "lucide-react";

const PROJECT_TYPES = [
  { value: "Commercial Construction", label: "Commercial Construction" },
  { value: "Residential Construction", label: "Residential Construction" },
  { value: "Renovation/Remodel", label: "Renovation/Remodel" },
  { value: "Electrical", label: "Electrical" },
  { value: "Plumbing", label: "Plumbing" },
  { value: "HVAC", label: "HVAC" },
  { value: "Landscaping", label: "Landscaping" },
  { value: "Roofing", label: "Roofing" },
  { value: "Concrete", label: "Concrete" },
  { value: "Painting", label: "Painting" },
  { value: "Masonry", label: "Masonry" },
  { value: "Flooring", label: "Flooring" },
  { value: "Steel Erection", label: "Steel Erection" },
  { value: "Demolition", label: "Demolition" },
  { value: "Insulation", label: "Insulation" },
  { value: "Waterproofing", label: "Waterproofing" },
  { value: "Glazing", label: "Glazing" },
  { value: "Fire Protection", label: "Fire Protection" },
  { value: "Elevator Installation", label: "Elevator Installation" },
  { value: "Excavation", label: "Excavation" },
  { value: "Other", label: "Other" },
];

const VALUE_RANGES = [
  { value: "Under $10k", label: "Under $10k" },
  { value: "$10k - $50k", label: "$10k - $50k" },
  { value: "$50k - $100k", label: "$50k - $100k" },
  { value: "$100k - $250k", label: "$100k - $250k" },
  { value: "$250k - $500k", label: "$250k - $500k" },
  { value: "$500k - $1M", label: "$500k - $1M" },
  { value: "Over $1M", label: "Over $1M" },
];

const TIMELINES = [
  { value: "Immediate (0-2 weeks)", label: "Immediate (0-2 weeks)" },
  { value: "Short-term (2-4 weeks)", label: "Short-term (2-4 weeks)" },
  { value: "Medium-term (1-3 months)", label: "Medium-term (1-3 months)" },
  { value: "Long-term (3-6 months)", label: "Long-term (3-6 months)" },
  { value: "Future (6+ months)", label: "Future (6+ months)" },
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

      // Send email notifications in parallel
      try {
        console.log("[ReferralSubmissionForm] Sending email notifications...");
        await Promise.all([
          // Send confirmation to submitter (3.1)
          fetch('/api/referrals/notify-submitter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ referralId: data.id }),
          }),
          // Send notification to admin (3.2)
          fetch('/api/referrals/notify-admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ referralId: data.id }),
          }),
        ]);
        console.log("[ReferralSubmissionForm] Email notifications sent");
      } catch (emailError) {
        // Log but don't fail the submission if email fails
        console.error('[ReferralSubmissionForm] Failed to send email notifications:', emailError);
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
        <Card style={{ background: 'rgba(248, 113, 113, 0.1)', border: '1px solid #f87171', borderRadius: '10px' }}>
          <CardContent className="pt-6">
            <p className="text-[14px]" style={{ color: '#f87171' }}>{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Client Information */}
      <Card style={{ background: '#252833', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px' }}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" style={{ color: '#60a5fa' }} />
            <CardTitle className="text-[18px]" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 400, color: '#f8f8fa' }}>Client Information</CardTitle>
          </div>
          <CardDescription className="text-[14px]" style={{ color: '#b0b2bc' }}>
            Details about the client you're referring
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client_name" className="text-[13px] font-medium" style={{ color: '#b0b2bc' }}>
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
              <Label htmlFor="client_company" className="text-[13px] font-medium" style={{ color: '#b0b2bc' }}>
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
              <Label htmlFor="client_email" className="text-[13px] font-medium" style={{ color: '#b0b2bc' }}>
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
              <Label htmlFor="client_phone" className="text-[13px] font-medium" style={{ color: '#b0b2bc' }}>
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
      <Card style={{ background: '#252833', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px' }}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" style={{ color: '#60a5fa' }} />
            <CardTitle className="text-[18px]" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 400, color: '#f8f8fa' }}>Project Details</CardTitle>
          </div>
          <CardDescription className="text-[14px]" style={{ color: '#b0b2bc' }}>
            Information about the project opportunity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project_type" className="text-[13px] font-medium" style={{ color: '#b0b2bc' }}>
                Project Type *
              </Label>
              <CustomSelect
                name="project_type"
                id="project_type"
                options={PROJECT_TYPES}
                value={formData.project_type}
                onChange={(value) => setFormData((prev) => ({ ...prev, project_type: value }))}
                placeholder="Select project type"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="value_range" className="text-[13px] font-medium" style={{ color: '#b0b2bc' }}>
                Project Value Range
              </Label>
              <CustomSelect
                name="value_range"
                id="value_range"
                options={VALUE_RANGES}
                value={formData.value_range}
                onChange={(value) => setFormData((prev) => ({ ...prev, value_range: value }))}
                placeholder="Select value range"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project_description" className="text-[13px] font-medium" style={{ color: '#b0b2bc' }}>
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
              <Label htmlFor="location" className="text-[13px] font-medium" style={{ color: '#b0b2bc' }}>
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
              <Label htmlFor="timeline" className="text-[13px] font-medium" style={{ color: '#b0b2bc' }}>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Timeline
                </div>
              </Label>
              <CustomSelect
                name="timeline"
                id="timeline"
                options={TIMELINES}
                value={formData.timeline}
                onChange={(value) => setFormData((prev) => ({ ...prev, timeline: value }))}
                placeholder="Select timeline"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Context */}
      <Card style={{ background: '#252833', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px' }}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" style={{ color: '#60a5fa' }} />
            <CardTitle className="text-[18px]" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 400, color: '#f8f8fa' }}>Additional Context</CardTitle>
          </div>
          <CardDescription className="text-[14px]" style={{ color: '#b0b2bc' }}>
            Any additional information that would be helpful
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-[13px] font-medium" style={{ color: '#b0b2bc' }}>
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
      <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
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
