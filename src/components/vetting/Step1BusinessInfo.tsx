"use client";

import { useState } from "react";
import { BusinessInfoData } from "./VettingWizard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Info, Building2, MapPin, FileText, Shield, Eye } from "lucide-react";

interface Step1Props {
  onComplete: (data: BusinessInfoData) => void;
  initialData: BusinessInfoData | null;
}

const TRADE_OPTIONS = [
  "Architecture",
  "Interior Design",
  "Project Management",
  "General Contracting",
  "Electrical",
  "Plumbing",
  "HVAC",
  "Landscaping",
  "Specialty Contractor",
  "Other",
];

const TEAM_SIZE_OPTIONS = ["1-5", "6-10", "11-25", "26-50", "50+"];

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC"
];

export default function Step1BusinessInfo({ onComplete, initialData }: Step1Props) {
  const [formData, setFormData] = useState<BusinessInfoData>(
    initialData || {
      full_name: "",
      company_name: "",
      phone: "",
      business_type: "",
      primary_trade: "",
      service_areas: [],
      website: "",
      linkedin_url: "",
      street_address: "",
      city: "",
      state: "",
      zip_code: "",
      bio: "",
      years_in_business: 0,
      team_size: "",
      tin_number: "",
      is_public: true,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "years_in_business" ? parseInt(value) || 0 : value,
    }));
  };

  const handleServiceAreasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const areas = e.target.value.split(",").map((s) => s.trim());
    setFormData((prev) => ({ ...prev, service_areas: areas }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <Card className="bg-[#21242f] border-[rgba(255,255,255,0.08)]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-[#c9a962]" />
            <CardTitle className="text-[18px] font-semibold text-[#f8f8fa]">Personal Information</CardTitle>
          </div>
          <CardDescription className="text-[14px] text-[#b0b2bc]">Your contact details for the application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-[13px] font-medium text-[#b0b2bc]">Full Name *</Label>
              <Input
                type="text"
                name="full_name"
                id="full_name"
                required
                value={formData.full_name}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[13px] font-medium text-[#b0b2bc]">Phone Number *</Label>
              <Input
                type="tel"
                name="phone"
                id="phone"
                required
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Information */}
      <Card className="bg-[#21242f] border-[rgba(255,255,255,0.08)]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#c9a962]" />
            <CardTitle className="text-[18px] font-semibold text-[#f8f8fa]">Business Information</CardTitle>
          </div>
          <CardDescription className="text-[14px] text-[#b0b2bc]">Tell us about your company and expertise</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company_name" className="text-[13px] font-medium text-[#b0b2bc]">Company Name *</Label>
            <Input
              type="text"
              name="company_name"
              id="company_name"
              required
              value={formData.company_name}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary_trade" className="text-[13px] font-medium text-[#b0b2bc]">Primary Trade *</Label>
              <Select
                name="primary_trade"
                id="primary_trade"
                required
                value={formData.primary_trade}
                onChange={handleChange}
              >
                <option value="">Select a trade</option>
                {TRADE_OPTIONS.map((trade) => (
                  <option key={trade} value={trade}>
                    {trade}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_type" className="text-[13px] font-medium text-[#b0b2bc]">Business Type</Label>
              <Input
                type="text"
                name="business_type"
                id="business_type"
                placeholder="e.g., LLC, Corporation, Sole Proprietor"
                value={formData.business_type}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="years_in_business" className="text-[13px] font-medium text-[#b0b2bc]">Years in Business</Label>
              <Input
                type="number"
                name="years_in_business"
                id="years_in_business"
                min="0"
                value={formData.years_in_business}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team_size" className="text-[13px] font-medium text-[#b0b2bc]">Team Size</Label>
              <Select
                name="team_size"
                id="team_size"
                value={formData.team_size}
                onChange={handleChange}
              >
                <option value="">Select team size</option>
                {TEAM_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="service_areas" className="text-[13px] font-medium text-[#b0b2bc]">Service Areas (comma-separated)</Label>
            <Input
              type="text"
              name="service_areas"
              id="service_areas"
              placeholder="e.g., Washington DC, Maryland, Virginia"
              value={formData.service_areas.join(", ")}
              onChange={handleServiceAreasChange}
            />
            <p className="text-[12px] text-[#6a6d78]">Enter cities or regions where you provide services</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-[13px] font-medium text-[#b0b2bc]">Company Bio</Label>
            <Textarea
              name="bio"
              id="bio"
              rows={4}
              placeholder="Tell us about your company and expertise..."
              value={formData.bio}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website" className="text-[13px] font-medium text-[#b0b2bc]">Website</Label>
              <Input
                type="text"
                name="website"
                id="website"
                placeholder="yourcompany.com"
                value={formData.website}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin_url" className="text-[13px] font-medium text-[#b0b2bc]">LinkedIn Profile</Label>
              <Input
                type="text"
                name="linkedin_url"
                id="linkedin_url"
                placeholder="linkedin.com/in/yourprofile"
                value={formData.linkedin_url}
                onChange={handleChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Address */}
      <Card className="bg-[#21242f] border-[rgba(255,255,255,0.08)]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#c9a962]" />
            <CardTitle className="text-[18px] font-semibold text-[#f8f8fa]">Business Address</CardTitle>
          </div>
          <CardDescription className="text-[14px] text-[#b0b2bc]">Where is your business located?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="street_address" className="text-[13px] font-medium text-[#b0b2bc]">Street Address</Label>
            <Input
              type="text"
              name="street_address"
              id="street_address"
              value={formData.street_address}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city" className="text-[13px] font-medium text-[#b0b2bc]">City</Label>
              <Input
                type="text"
                name="city"
                id="city"
                value={formData.city}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state" className="text-[13px] font-medium text-[#b0b2bc]">State</Label>
              <Select
                name="state"
                id="state"
                value={formData.state}
                onChange={handleChange}
              >
                <option value="">Select state</option>
                {US_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="zip_code" className="text-[13px] font-medium text-[#b0b2bc]">ZIP Code</Label>
              <Input
                type="text"
                name="zip_code"
                id="zip_code"
                value={formData.zip_code}
                onChange={handleChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Compliance */}
      <Card className="bg-[#21242f] border-[rgba(201,169,98,0.2)]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#c9a962]" />
            <CardTitle className="text-[18px] font-semibold text-[#f8f8fa]">Tax Compliance</CardTitle>
          </div>
          <CardDescription className="text-[14px] text-[#b0b2bc]">Secure tax identification information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Card className="bg-[rgba(201,169,98,0.1)] border-[rgba(201,169,98,0.3)]">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-[#c9a962] mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-[13px] font-medium text-[#c9a962]">Your information is secure</p>
                  <p className="text-[13px] text-[#b0b2bc]">
                    Your TIN is encrypted and stored securely. This information will never be
                    displayed publicly and is only accessible to authorized administrators for
                    compliance purposes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label htmlFor="tin_number" className="text-[13px] font-medium text-[#b0b2bc]">Tax Identification Number (TIN / EIN) *</Label>
            <Input
              type="text"
              name="tin_number"
              id="tin_number"
              required
              placeholder="XX-XXXXXXX"
              maxLength={10}
              value={formData.tin_number}
              onChange={(e) => {
                // Format TIN as XX-XXXXXXX
                const digits = e.target.value.replace(/\D/g, "");
                let formatted = "";
                if (digits.length <= 2) {
                  formatted = digits;
                } else if (digits.length <= 9) {
                  formatted = `${digits.slice(0, 2)}-${digits.slice(2)}`;
                } else {
                  formatted = `${digits.slice(0, 2)}-${digits.slice(2, 9)}`;
                }
                setFormData((prev) => ({ ...prev, tin_number: formatted }));
              }}
            />
            <p className="text-[12px] text-[#6a6d78]">
              Format: XX-XXXXXXX (9 digits). You'll upload your W-9 form in the next step.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Profile Settings */}
      <Card className="bg-[#21242f] border-[rgba(201,169,98,0.2)]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-[#c9a962]" />
            <CardTitle className="text-[18px] font-semibold text-[#f8f8fa]">Profile Settings</CardTitle>
          </div>
          <CardDescription className="text-[14px] text-[#b0b2bc]">Control your profile visibility</CardDescription>
        </CardHeader>
        <CardContent>
          <Card className="bg-[rgba(201,169,98,0.1)] border-[rgba(201,169,98,0.3)]">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="is_public"
                  id="is_public"
                  checked={formData.is_public}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, is_public: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-[rgba(255,255,255,0.2)] bg-[#21242f] text-[#c9a962] focus:ring-[#c9a962] mt-1"
                />
                <div className="space-y-1">
                  <Label htmlFor="is_public" className="text-[14px] font-medium text-[#f8f8fa] cursor-pointer">
                    Make my profile visible in the Member Directory
                  </Label>
                  <p className="text-[13px] text-[#b0b2bc]">
                    When enabled, verified members can view your profile, portfolio, and contact
                    information in the directory. Your sensitive documents (W-9, insurance, etc.)
                    are never shown publicly. You can change this setting later.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-[rgba(255,255,255,0.08)]">
        <div></div>
        <Button type="submit" variant="default" className="h-10 text-[14px] bg-[#c9a962] hover:bg-[#d4b674] text-[#1a1d27]">
          Continue to Portfolio
        </Button>
      </div>
    </form>
  );
}
