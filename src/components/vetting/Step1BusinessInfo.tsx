"use client";

import { useState } from "react";
import { BusinessInfoData } from "./VettingWizard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CustomSelect } from "@/components/ui/custom-select";
import { Info, Building2, MapPin, Shield, Eye, AlertCircle } from "lucide-react";

interface Step1Props {
  onComplete: (data: BusinessInfoData) => void;
  initialData: BusinessInfoData | null;
}

const TRADE_OPTIONS = [
  { value: "Architecture", label: "Architecture" },
  { value: "Interior Design", label: "Interior Design" },
  { value: "Project Management", label: "Project Management" },
  { value: "General Contracting", label: "General Contracting" },
  { value: "Electrical", label: "Electrical" },
  { value: "Plumbing", label: "Plumbing" },
  { value: "HVAC", label: "HVAC" },
  { value: "Landscaping", label: "Landscaping" },
  { value: "Real Estate Agent", label: "Real Estate Agent" },
  { value: "Specialty Contractor", label: "Specialty Contractor" },
  { value: "Other", label: "Other" },
];

const TEAM_SIZE_OPTIONS = [
  { value: "1-5", label: "1-5 employees" },
  { value: "6-10", label: "6-10 employees" },
  { value: "11-25", label: "11-25 employees" },
  { value: "26-50", label: "26-50 employees" },
  { value: "50+", label: "50+ employees" },
];

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC"
].map(state => ({ value: state, label: state }));

// Phone number formatting helper
const formatPhoneNumber = (value: string): string => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, "");

  // Format as (XXX) XXX-XXXX
  if (digits.length <= 3) {
    return digits;
  } else if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  } else {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }
};

// Validation types
interface ValidationErrors {
  full_name?: string;
  phone?: string;
  company_name?: string;
  primary_trade?: string;
  business_type?: string;
  years_in_business?: string;
  team_size?: string;
  service_areas?: string;
  bio?: string;
  website?: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  tin_number?: string;
}

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
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitted, setSubmitted] = useState(false);

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Personal Information
    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    }

    const phoneDigits = formData.phone.replace(/\D/g, "");
    if (!phoneDigits) {
      newErrors.phone = "Phone number is required";
    } else if (phoneDigits.length !== 10) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    // Business Information
    if (!formData.company_name.trim()) {
      newErrors.company_name = "Company name is required";
    }
    if (!formData.primary_trade) {
      newErrors.primary_trade = "Primary trade is required";
    }
    if (!formData.business_type.trim()) {
      newErrors.business_type = "Business type is required";
    }
    if (!formData.years_in_business || formData.years_in_business < 0) {
      newErrors.years_in_business = "Years in business is required";
    }
    if (!formData.team_size) {
      newErrors.team_size = "Team size is required";
    }
    if (!formData.service_areas.length || !formData.service_areas.some(a => a.trim())) {
      newErrors.service_areas = "At least one service area is required";
    }
    if (!formData.bio.trim()) {
      newErrors.bio = "Company bio is required";
    }

    // Business Address
    if (!formData.street_address.trim()) {
      newErrors.street_address = "Street address is required";
    }
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }
    if (!formData.state) {
      newErrors.state = "State is required";
    }
    if (!formData.zip_code.trim()) {
      newErrors.zip_code = "ZIP code is required";
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zip_code.trim())) {
      newErrors.zip_code = "Please enter a valid ZIP code";
    }

    // Tax Compliance
    const tinDigits = formData.tin_number.replace(/\D/g, "");
    if (!tinDigits) {
      newErrors.tin_number = "TIN/EIN is required";
    } else if (tinDigits.length !== 9) {
      newErrors.tin_number = "TIN/EIN must be 9 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (validateForm()) {
      onComplete(formData);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "years_in_business" ? parseInt(value) || 0 : value,
    }));

    // Clear error when field is edited
    if (submitted && errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData((prev) => ({ ...prev, phone: formatted }));

    if (submitted && errors.phone) {
      setErrors((prev) => ({ ...prev, phone: undefined }));
    }
  };

  const handleServiceAreasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const areas = e.target.value.split(",").map((s) => s.trim());
    setFormData((prev) => ({ ...prev, service_areas: areas }));

    if (submitted && errors.service_areas) {
      setErrors((prev) => ({ ...prev, service_areas: undefined }));
    }
  };

  // Helper for showing field errors
  const FieldError = ({ error }: { error?: string }) => {
    if (!error) return null;
    return (
      <p className="text-[12px] text-[#f87171] mt-1 flex items-center gap-1">
        <AlertCircle className="h-3 w-3" />
        {error}
      </p>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Required Fields Notice */}
      <Card hover={false} compact className="bg-[rgba(201,169,98,0.1)] border-[rgba(201,169,98,0.3)]">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-[#c9a962] flex-shrink-0" />
          <p className="text-[13px] text-[#c9a962]">
            All fields on this page are required for vetting. Please complete each section thoroughly.
          </p>
        </div>
      </Card>

      {/* Validation Error Summary */}
      {submitted && Object.keys(errors).length > 0 && (
        <Card hover={false} compact className="bg-[rgba(248,113,113,0.1)] border-[rgba(248,113,113,0.3)]">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-[#f87171] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-medium text-[#f87171]">
                Please fix the following errors before continuing:
              </p>
              <ul className="text-[12px] text-[#f87171] mt-1 list-disc list-inside">
                {Object.values(errors).map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

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
              <Label htmlFor="full_name" className="text-[13px] font-medium text-[#b0b2bc]">Full Name</Label>
              <Input
                type="text"
                name="full_name"
                id="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className={errors.full_name ? "border-[#f87171]" : ""}
              />
              <FieldError error={errors.full_name} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[13px] font-medium text-[#b0b2bc]">Phone Number</Label>
              <Input
                type="tel"
                name="phone"
                id="phone"
                placeholder="(555) 555-5555"
                value={formData.phone}
                onChange={handlePhoneChange}
                className={errors.phone ? "border-[#f87171]" : ""}
              />
              <FieldError error={errors.phone} />
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
            <Label htmlFor="company_name" className="text-[13px] font-medium text-[#b0b2bc]">Company Name</Label>
            <Input
              type="text"
              name="company_name"
              id="company_name"
              value={formData.company_name}
              onChange={handleChange}
              className={errors.company_name ? "border-[#f87171]" : ""}
            />
            <FieldError error={errors.company_name} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary_trade" className="text-[13px] font-medium text-[#b0b2bc]">Primary Trade</Label>
              <CustomSelect
                name="primary_trade"
                id="primary_trade"
                options={TRADE_OPTIONS}
                value={formData.primary_trade}
                onChange={(value) => {
                  setFormData((prev) => ({ ...prev, primary_trade: value }));
                  if (submitted && errors.primary_trade) {
                    setErrors((prev) => ({ ...prev, primary_trade: undefined }));
                  }
                }}
                placeholder="Select a trade"
                error={!!errors.primary_trade}
              />
              <FieldError error={errors.primary_trade} />
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
                className={errors.business_type ? "border-[#f87171]" : ""}
              />
              <FieldError error={errors.business_type} />
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
                className={errors.years_in_business ? "border-[#f87171]" : ""}
              />
              <FieldError error={errors.years_in_business} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team_size" className="text-[13px] font-medium text-[#b0b2bc]">Team Size</Label>
              <CustomSelect
                name="team_size"
                id="team_size"
                options={TEAM_SIZE_OPTIONS}
                value={formData.team_size}
                onChange={(value) => {
                  setFormData((prev) => ({ ...prev, team_size: value }));
                  if (submitted && errors.team_size) {
                    setErrors((prev) => ({ ...prev, team_size: undefined }));
                  }
                }}
                placeholder="Select team size"
                error={!!errors.team_size}
              />
              <FieldError error={errors.team_size} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="service_areas" className="text-[13px] font-medium text-[#b0b2bc]">Service Areas</Label>
            <Input
              type="text"
              name="service_areas"
              id="service_areas"
              placeholder="e.g., Washington DC, Maryland, Virginia"
              value={formData.service_areas.join(", ")}
              onChange={handleServiceAreasChange}
              className={errors.service_areas ? "border-[#f87171]" : ""}
            />
            <p className="text-[12px] text-[#6a6d78]">Enter cities or regions where you provide services (comma-separated)</p>
            <FieldError error={errors.service_areas} />
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
              className={errors.bio ? "border-[#f87171]" : ""}
            />
            <FieldError error={errors.bio} />
          </div>

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
            <p className="text-[12px] text-[#6a6d78]">Optional but recommended</p>
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
              className={errors.street_address ? "border-[#f87171]" : ""}
            />
            <FieldError error={errors.street_address} />
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
                className={errors.city ? "border-[#f87171]" : ""}
              />
              <FieldError error={errors.city} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state" className="text-[13px] font-medium text-[#b0b2bc]">State</Label>
              <CustomSelect
                name="state"
                id="state"
                options={US_STATES}
                value={formData.state}
                onChange={(value) => {
                  setFormData((prev) => ({ ...prev, state: value }));
                  if (submitted && errors.state) {
                    setErrors((prev) => ({ ...prev, state: undefined }));
                  }
                }}
                placeholder="Select state"
                error={!!errors.state}
              />
              <FieldError error={errors.state} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zip_code" className="text-[13px] font-medium text-[#b0b2bc]">ZIP Code</Label>
              <Input
                type="text"
                name="zip_code"
                id="zip_code"
                placeholder="12345"
                value={formData.zip_code}
                onChange={handleChange}
                className={errors.zip_code ? "border-[#f87171]" : ""}
              />
              <FieldError error={errors.zip_code} />
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
          <Card hover={false} compact className="bg-[rgba(201,169,98,0.1)] border-[rgba(201,169,98,0.3)]">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-[#c9a962] mt-0.5 flex-shrink-0" />
              <div className="space-y-0.5">
                <p className="text-[13px] font-medium text-[#c9a962]">Your information is secure</p>
                <p className="text-[12px] text-[#b0b2bc]">
                  Your TIN is encrypted and stored securely. This information will never be
                  displayed publicly and is only accessible to authorized administrators for
                  compliance purposes.
                </p>
              </div>
            </div>
          </Card>

          <div className="space-y-2">
            <Label htmlFor="tin_number" className="text-[13px] font-medium text-[#b0b2bc]">Tax Identification Number (TIN / EIN)</Label>
            <Input
              type="text"
              name="tin_number"
              id="tin_number"
              placeholder="XX-XXXXXXX"
              maxLength={10}
              value={formData.tin_number}
              className={errors.tin_number ? "border-[#f87171]" : ""}
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
                if (submitted && errors.tin_number) {
                  setErrors((prev) => ({ ...prev, tin_number: undefined }));
                }
              }}
            />
            <p className="text-[12px] text-[#6a6d78]">
              Format: XX-XXXXXXX (9 digits). You'll upload your W-9 form in the next step.
            </p>
            <FieldError error={errors.tin_number} />
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
          <Card hover={false} compact className="bg-[rgba(201,169,98,0.1)] border-[rgba(201,169,98,0.3)]">
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                name="is_public"
                id="is_public"
                checked={formData.is_public}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, is_public: e.target.checked }))
                }
                className="h-4 w-4 rounded border-[rgba(255,255,255,0.2)] bg-[#21242f] text-[#c9a962] focus:ring-[#c9a962] mt-0.5"
              />
              <div className="space-y-0.5">
                <Label htmlFor="is_public" className="text-[13px] font-medium text-[#f8f8fa] cursor-pointer">
                  Make my profile visible in the Member Directory
                </Label>
                <p className="text-[12px] text-[#b0b2bc]">
                  When enabled, verified members can view your profile, portfolio, and contact
                  information in the directory. Your sensitive documents (W-9, insurance, etc.)
                  are never shown publicly. You can change this setting later.
                </p>
              </div>
            </div>
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
