"use client";

import { useState } from "react";
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

interface VettingWizardProps {
  userId: string;
}

export interface BusinessInfoData {
  full_name: string;
  company_name: string;
  phone: string;
  business_type: string;
  primary_trade: string;
  service_areas: string[];
  website: string;
  linkedin_url: string;
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

export default function VettingWizard({ userId }: VettingWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfoData | null>(null);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [documents, setDocuments] = useState<DocumentData>({});
  const [tosAccepted, setTosAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStep1Complete = (data: BusinessInfoData) => {
    setBusinessInfo(data);
    setCurrentStep(2);
  };

  const handleStep2Complete = (items: PortfolioItem[]) => {
    setPortfolioItems(items);
    setCurrentStep(3);
  };

  const handleStep3Complete = (data: DocumentData) => {
    setDocuments(data);
    setCurrentStep(4);
  };

  const handleStep4Complete = (accepted: boolean) => {
    setTosAccepted(accepted);
    setCurrentStep(5);
  };

  const handleFinalSubmit = async () => {
    if (!businessInfo) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // 1. Create/Update Profile
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          email: (await supabase.auth.getUser()).data.user?.email || "",
          ...businessInfo,
        });

      if (profileError) throw profileError;

      // 2. Create Application
      const { data: application, error: applicationError } = await supabase
        .from("applications")
        .insert({
          user_id: userId,
          status: "pending",
          tos_accepted: tosAccepted,
          tos_accepted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (applicationError) throw applicationError;

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
        if (!files || files.length === 0) continue;

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
          tax_compliance: "point_6_portfolio", // Using point_6 for tax compliance tracking
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

      // 6. Redirect to success page
      router.push("/vetting/success");
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean Progress Stepper */}
      <div className="bg-white border-b border-gray-200">
        <div className="container max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`rounded-full w-8 h-8 flex items-center justify-center ${
                      step.id === currentStep
                        ? "bg-blue-600 text-white text-[13px] font-semibold"
                        : step.id < currentStep
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-500 text-[13px]"
                    }`}
                  >
                    {step.id < currentStep ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <span className="text-[13px] font-semibold">{step.id}</span>
                    )}
                  </div>
                  <span
                    className={`mt-2 text-[13px] font-medium text-center max-w-[100px] ${
                      step.id === currentStep
                        ? "text-gray-900"
                        : step.id < currentStep
                        ? "text-green-700"
                        : "text-gray-500"
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      step.id < currentStep ? "bg-green-600" : "bg-gray-200"
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
        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50 mb-6">
            <div className="p-4">
              <p className="text-red-700 font-medium text-[14px]">{error}</p>
            </div>
          </Card>
        )}

        <Card className="bg-white p-8">
          {currentStep === 1 && (
            <Step1BusinessInfo
              onComplete={handleStep1Complete}
              initialData={businessInfo}
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
              initialAccepted={tosAccepted}
            />
          )}

          {currentStep === 5 && (
            <Step5Review
              businessInfo={businessInfo!}
              documents={documents}
              tosAccepted={tosAccepted}
              onBack={() => setCurrentStep(4)}
              onSubmit={handleFinalSubmit}
              loading={loading}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
