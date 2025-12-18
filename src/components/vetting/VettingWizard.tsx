"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle } from "lucide-react";
import Step1BusinessInfo from "./Step1BusinessInfo";
import Step2Portfolio, { PortfolioItem } from "./Step3Portfolio";
import Step3DocumentUploads from "./Step2DocumentUploads";
import Step4TermsOfService from "./Step3TermsOfService";
import Step5Review from "./Step4Review";
import { Application, Profile } from "@/types/database.types";

const VETTING_PROGRESS_KEY = "proclusive_vetting_progress";

interface VettingWizardProps {
  userId: string;
  existingApplication?: Application;
  existingProfile?: Profile;
  isEditMode?: boolean;
}

export interface BusinessInfoData {
  full_name: string;
  company_name: string;
  phone: string;
  business_type: string;
  primary_trade: string;
  service_areas: string[];
  website: string;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  bio: string;
  years_in_business: number;
  team_size: string;
  tin_number: string;
  is_public: boolean;
}

export interface DocumentData {
  business_registration?: File[];
  professional_license?: File[];
  liability_insurance?: File[];
  workers_comp?: File[];
  workers_comp_exempt_sole_prop?: boolean;
  contact_verification?: File[];
  tax_compliance?: File[];
}

const STEPS = [
  { id: 1, name: "Business Information" },
  { id: 2, name: "Portfolio" },
  { id: 3, name: "Document Uploads" },
  { id: 4, name: "Terms of Service" },
  { id: 5, name: "Review & Submit" },
];

export default function VettingWizard({
  userId,
  existingApplication,
  existingProfile,
  isEditMode = false,
}: VettingWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfoData | null>(null);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [documents, setDocuments] = useState<DocumentData>({});
  const [tosAccepted, setTosAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingDraft, setSavingDraft] = useState(false);
  const [progressRestored, setProgressRestored] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);

  // Save progress to localStorage
  const saveProgress = useCallback((step: number, tos: boolean, privacy: boolean) => {
    try {
      const progress = {
        userId,
        currentStep: step,
        tosAccepted: tos,
        privacyAccepted: privacy,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(VETTING_PROGRESS_KEY, JSON.stringify(progress));
    } catch (err) {
      console.error("[VettingWizard] Error saving progress:", err);
    }
  }, [userId]);

  // Load saved progress on mount
  useEffect(() => {
    // Only load progress for new applications (not edit mode)
    if (isEditMode) return;

    try {
      const saved = localStorage.getItem(VETTING_PROGRESS_KEY);
      if (saved) {
        const progress = JSON.parse(saved);
        // Only restore if same user and saved within last 7 days
        const savedAt = new Date(progress.savedAt);
        const daysSinceSave = (Date.now() - savedAt.getTime()) / (1000 * 60 * 60 * 24);

        if (progress.userId === userId && daysSinceSave < 7) {
          console.log("[VettingWizard] Restoring progress to step", progress.currentStep);
          setCurrentStep(progress.currentStep);
          setTosAccepted(progress.tosAccepted || false);
          setPrivacyAccepted(progress.privacyAccepted || false);
          if (progress.currentStep > 1) {
            setProgressRestored(true);
          }
        } else {
          // Clear stale progress
          localStorage.removeItem(VETTING_PROGRESS_KEY);
        }
      }
    } catch (err) {
      console.error("[VettingWizard] Error loading progress:", err);
    }
  }, [userId, isEditMode]);

  // Load profile data if exists (for resuming)
  useEffect(() => {
    const loadExistingProfile = async () => {
      if (isEditMode && existingProfile) {
        // Edit mode - use provided profile
        setBusinessInfo({
          full_name: existingProfile.full_name || "",
          company_name: existingProfile.company_name || "",
          phone: existingProfile.phone || "",
          business_type: existingProfile.business_type || "",
          primary_trade: existingProfile.primary_trade || "",
          service_areas: existingProfile.service_areas || [],
          website: existingProfile.website || "",
          street_address: existingProfile.street_address || "",
          city: existingProfile.city || "",
          state: existingProfile.state || "",
          zip_code: existingProfile.zip_code || "",
          bio: existingProfile.bio || "",
          years_in_business: existingProfile.years_in_business || 0,
          team_size: existingProfile.team_size || "",
          tin_number: existingProfile.tin_number || "",
          is_public: existingProfile.is_public ?? true,
        });
        if (existingApplication) {
          setTosAccepted(existingApplication.tos_accepted || false);
          setPrivacyAccepted(existingApplication.privacy_accepted || false);
        }
        return;
      }

      // New application - check if profile data exists (for resume)
      try {
        const supabase = createClient();
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (profile && profile.company_name) {
          // Profile has been partially filled - restore it
          console.log("[VettingWizard] Restoring profile data");
          setBusinessInfo({
            full_name: profile.full_name || "",
            company_name: profile.company_name || "",
            phone: profile.phone || "",
            business_type: profile.business_type || "",
            primary_trade: profile.primary_trade || "",
            service_areas: profile.service_areas || [],
            website: profile.website || "",
            street_address: profile.street_address || "",
            city: profile.city || "",
            state: profile.state || "",
            zip_code: profile.zip_code || "",
            bio: profile.bio || "",
            years_in_business: profile.years_in_business || 0,
            team_size: profile.team_size || "",
            tin_number: profile.tin_number || "",
            is_public: profile.is_public ?? true,
          });
        }
      } catch (err) {
        console.error("[VettingWizard] Error loading profile:", err);
      }
    };

    loadExistingProfile();
  }, [isEditMode, existingProfile, existingApplication, userId]);

  // Save profile data to database (for progress persistence)
  const saveProfileDraft = async (data: BusinessInfoData) => {
    try {
      setSavingDraft(true);
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();

      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          email: userData.user?.email || "",
          ...data,
        });

      if (profileError) {
        console.error("[VettingWizard] Error saving profile draft:", profileError);
      } else {
        console.log("[VettingWizard] Profile draft saved");
      }
    } catch (err) {
      console.error("[VettingWizard] Error saving profile draft:", err);
    } finally {
      setSavingDraft(false);
    }
  };

  const handleStep1Complete = async (data: BusinessInfoData, picture?: File) => {
    setBusinessInfo(data);
    if (picture) {
      setProfilePicture(picture);
    }
    // Save profile immediately so progress is persisted
    await saveProfileDraft(data);
    setCurrentStep(2);
    saveProgress(2, tosAccepted, privacyAccepted);
  };

  const handleStep2Complete = (items: PortfolioItem[]) => {
    setPortfolioItems(items);
    setCurrentStep(3);
    saveProgress(3, tosAccepted, privacyAccepted);
  };

  const handleStep3Complete = (data: DocumentData) => {
    setDocuments(data);
    setCurrentStep(4);
    saveProgress(4, tosAccepted, privacyAccepted);
  };

  const handleStep4Complete = (tos: boolean, privacy: boolean) => {
    setTosAccepted(tos);
    setPrivacyAccepted(privacy);
    setCurrentStep(5);
    saveProgress(5, tos, privacy);
  };

  const handleFinalSubmit = async () => {
    if (!businessInfo) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // 0. Upload profile picture if provided
      let profilePictureUrl: string | null = null;
      if (profilePicture) {
        const fileExt = profilePicture.name.split('.').pop()?.toLowerCase() || 'jpg';
        const filePath = `${userId}/profile-picture.${fileExt}`;

        // Upload to profile-pictures bucket
        const { error: uploadError } = await supabase.storage
          .from("profile-pictures")
          .upload(filePath, profilePicture, { upsert: true });

        if (uploadError) {
          console.error("[VettingWizard] Profile picture upload error:", uploadError);
          // Don't fail the whole submission for profile picture
        } else {
          profilePictureUrl = filePath;
        }
      }

      // 1. Create/Update Profile
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          email: (await supabase.auth.getUser()).data.user?.email || "",
          ...businessInfo,
          ...(profilePictureUrl && { profile_picture_url: profilePictureUrl }),
        });

      if (profileError) throw profileError;

      let application;

      if (isEditMode && existingApplication) {
        // 2a. Update existing application - reset status to pending for re-review
        const { data: updatedApp, error: updateError } = await supabase
          .from("applications")
          .update({
            status: "pending",
            tos_accepted: tosAccepted,
            tos_accepted_at: new Date().toISOString(),
            privacy_accepted: privacyAccepted,
            privacy_accepted_at: new Date().toISOString(),
            workers_comp_exempt_sole_prop: documents.workers_comp_exempt_sole_prop || false,
            // Reset all rejected points to pending so they can be re-reviewed
            point_1_business_reg: existingApplication.point_1_business_reg === "rejected" ? "pending" : existingApplication.point_1_business_reg,
            point_2_prof_license: existingApplication.point_2_prof_license === "rejected" ? "pending" : existingApplication.point_2_prof_license,
            point_3_liability_ins: existingApplication.point_3_liability_ins === "rejected" ? "pending" : existingApplication.point_3_liability_ins,
            point_4_workers_comp: existingApplication.point_4_workers_comp === "rejected" ? "pending" : existingApplication.point_4_workers_comp,
            point_5_contact_verify: existingApplication.point_5_contact_verify === "rejected" ? "pending" : existingApplication.point_5_contact_verify,
            point_6_portfolio: existingApplication.point_6_portfolio === "rejected" ? "pending" : existingApplication.point_6_portfolio,
            // Clear admin notes for fresh review
            admin_notes: null,
            reviewed_by: null,
            reviewed_at: null,
          })
          .eq("id", existingApplication.id)
          .select()
          .single();

        if (updateError) throw updateError;
        application = updatedApp;
      } else {
        // 2b. Create new Application
        const { data: newApp, error: applicationError } = await supabase
          .from("applications")
          .insert({
            user_id: userId,
            status: "pending",
            tos_accepted: tosAccepted,
            tos_accepted_at: new Date().toISOString(),
            privacy_accepted: privacyAccepted,
            privacy_accepted_at: new Date().toISOString(),
            workers_comp_exempt_sole_prop: documents.workers_comp_exempt_sole_prop || false,
          })
          .select()
          .single();

        if (applicationError) throw applicationError;
        application = newApp;
      }

      // 3. Upload Tier 1 Documents (including W-9)
      const documentTypes: Array<keyof DocumentData> = [
        "business_registration",
        "professional_license",
        "liability_insurance",
        "workers_comp",
        "contact_verification",
        "tax_compliance",
      ];

      for (const docType of documentTypes) {
        const files = documents[docType];
        if (!files || !Array.isArray(files) || files.length === 0) continue;

        // Upload each file in the array
        for (const file of files) {
          // Upload to Supabase Storage
          const filePath = `${userId}/${docType}_${Date.now()}_${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from("documents")
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          // Create document record
          const { error: docError } = await supabase.from("documents").insert({
            application_id: application.id,
            user_id: userId,
            document_type: docType,
            file_name: file.name,
            file_path: filePath,
            file_size: file.size,
            mime_type: file.type,
          });

          if (docError) throw docError;
        }

        // Update application verification status
        const pointMap: Record<string, string> = {
          business_registration: "point_1_business_reg",
          professional_license: "point_2_prof_license",
          liability_insurance: "point_3_liability_ins",
          workers_comp: "point_4_workers_comp",
          contact_verification: "point_5_contact_verify",
          tax_compliance: "point_6_portfolio", // Tax compliance (W-9)
        };

        if (pointMap[docType]) {
          await supabase
            .from("applications")
            .update({ [pointMap[docType]]: "pending" })
            .eq("id", application.id);
        }
      }

      // 4. Upload Portfolio Items
      for (let i = 0; i < portfolioItems.length; i++) {
        const item = portfolioItems[i];

        // Upload image to portfolio storage bucket
        const imagePath = `${userId}/portfolio_${Date.now()}_${i}_${item.file.name}`;
        const { error: imageUploadError } = await supabase.storage
          .from("portfolio")
          .upload(imagePath, item.file);

        if (imageUploadError) throw imageUploadError;

        // Create portfolio_items record
        const { error: portfolioError } = await supabase
          .from("portfolio_items")
          .insert({
            profile_id: userId,
            image_url: imagePath,
            description: item.description || null,
            display_order: i,
          });

        if (portfolioError) throw portfolioError;
      }

      // 5. Update profile with TIN number (already included in businessInfo)
      // TIN is saved with the profile in step 1 above

      // 6. Clear saved progress since submission is complete
      localStorage.removeItem(VETTING_PROGRESS_KEY);

      // 7. Redirect to success page
      router.push("/vetting/success");
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1d27]">
      {/* Clean Progress Stepper */}
      <div className="bg-[#252833] border-b border-[rgba(255,255,255,0.08)]">
        <div className="container max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-start justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-start flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`rounded-full w-8 h-8 flex items-center justify-center ${
                      step.id === currentStep
                        ? "bg-[#c9a962] text-[#1a1d27]"
                        : step.id < currentStep
                        ? "bg-[#22c55e] text-white"
                        : "bg-[#21242f] text-[#6a6d78] border border-[rgba(255,255,255,0.08)]"
                    }`}
                  >
                    {step.id < currentStep ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-[13px] font-semibold">{step.id}</span>
                    )}
                  </div>
                  <span
                    className={`mt-2 text-[13px] font-medium text-center max-w-[100px] ${
                      step.id === currentStep
                        ? "text-[#f8f8fa]"
                        : step.id < currentStep
                        ? "text-[#22c55e]"
                        : "text-[#6a6d78]"
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-3 mt-4 ${
                      step.id < currentStep ? "bg-[#22c55e]" : "bg-[rgba(255,255,255,0.08)]"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="container max-w-3xl mx-auto px-6 py-8">
        {/* Progress Restored Notice */}
        {progressRestored && (
          <Card hover={false} compact className="border-[rgba(34,197,94,0.3)] bg-[rgba(34,197,94,0.1)] mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-[#22c55e]" />
                <p className="text-[#22c55e] font-medium text-[14px]">
                  Welcome back! Your progress has been restored.
                </p>
              </div>
              <button
                onClick={() => setProgressRestored(false)}
                className="text-[#22c55e] hover:text-[#4ade80] text-[13px]"
              >
                Dismiss
              </button>
            </div>
          </Card>
        )}

        {/* Note about file uploads if resuming after step 2 */}
        {progressRestored && currentStep > 2 && (
          <Card hover={false} compact className="border-[rgba(201,169,98,0.3)] bg-[rgba(201,169,98,0.1)] mb-6">
            <div className="flex items-start gap-3">
              <span className="text-[#c9a962] text-lg">⚠️</span>
              <p className="text-[#c9a962] text-[13px]">
                Note: Portfolio images and documents cannot be saved between sessions.
                You may need to re-upload them before submitting.
              </p>
            </div>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Card hover={false} compact className="border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.1)] mb-6">
            <p className="text-[#f87171] font-medium text-[14px]">{error}</p>
          </Card>
        )}

        {/* Saving Draft Indicator */}
        {savingDraft && (
          <div className="fixed bottom-4 right-4 bg-[#252833] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-2 shadow-lg">
            <p className="text-[#b0b2bc] text-[13px] flex items-center gap-2">
              <span className="animate-spin">⏳</span> Saving progress...
            </p>
          </div>
        )}

        <Card className="bg-[#252833] border-[rgba(255,255,255,0.08)] p-8">
          {currentStep === 1 && (
            <Step1BusinessInfo
              onComplete={handleStep1Complete}
              initialData={businessInfo}
              initialProfilePicture={profilePicture}
              existingProfilePictureUrl={existingProfile?.profile_picture_url}
            />
          )}

          {currentStep === 2 && (
            <Step2Portfolio
              onComplete={handleStep2Complete}
              onBack={() => setCurrentStep(1)}
              initialData={portfolioItems}
            />
          )}

          {currentStep === 3 && (
            <Step3DocumentUploads
              onComplete={handleStep3Complete}
              onBack={() => setCurrentStep(2)}
              initialData={documents}
            />
          )}

          {currentStep === 4 && (
            <Step4TermsOfService
              onComplete={handleStep4Complete}
              onBack={() => setCurrentStep(3)}
              initialTosAccepted={tosAccepted}
              initialPrivacyAccepted={privacyAccepted}
            />
          )}

          {currentStep === 5 && (
            <Step5Review
              businessInfo={businessInfo}
              documents={documents}
              portfolioItems={portfolioItems}
              tosAccepted={tosAccepted}
              privacyAccepted={privacyAccepted}
              profilePicture={profilePicture}
              onBack={() => setCurrentStep(4)}
              onGoToStep={setCurrentStep}
              onSubmit={handleFinalSubmit}
              loading={loading}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
