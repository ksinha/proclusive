"use client";

import { BusinessInfoData, DocumentData } from "./VettingWizard";
import { PortfolioItem } from "./Step3Portfolio";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, FileText, Building2, MapPin, Loader2, Info, AlertCircle, Image } from "lucide-react";

interface Step4Props {
  businessInfo: BusinessInfoData;
  documents: DocumentData;
  portfolioItems: PortfolioItem[];
  tosAccepted: boolean;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
}

export default function Step4Review({
  businessInfo,
  documents,
  portfolioItems,
  tosAccepted,
  onBack,
  onSubmit,
  loading,
}: Step4Props) {
  const documentCount = Object.keys(documents).filter(key => {
    const docs = documents[key as keyof DocumentData];
    return docs && docs.length > 0;
  }).length;

  // Required documents check
  const requiredDocs = ['business_registration', 'professional_license', 'liability_insurance', 'workers_comp', 'tax_compliance'];
  const missingDocs = requiredDocs.filter(key => {
    const docs = documents[key as keyof DocumentData];
    return !docs || docs.length === 0;
  });
  const hasAllRequiredDocs = missingDocs.length === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-[24px] font-semibold text-[#f8f8fa] mb-2">Review & Submit</h2>
        <p className="text-[14px] text-[#b0b2bc]">
          Please review all information before submitting your application
        </p>
      </div>

      {/* Info Card */}
      <Card hover={false} compact className="bg-[rgba(201,169,98,0.1)] border-[rgba(201,169,98,0.3)]">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-[#c9a962] mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <h3 className="text-[14px] font-medium text-[#c9a962]">Review Your Application</h3>
            <p className="text-[13px] text-[#b0b2bc]">
              Please review all information before submitting. Once submitted, your application will be
              reviewed by our admin team within 48 hours.
            </p>
          </div>
        </div>
      </Card>

      {/* Missing Documents Warning */}
      {!hasAllRequiredDocs && (
        <Card hover={false} compact className="bg-[rgba(248,113,113,0.1)] border-[rgba(248,113,113,0.3)]">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-[#f87171] mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <h3 className="text-[14px] font-medium text-[#f87171]">Missing Required Documents</h3>
              <p className="text-[13px] text-[#b0b2bc]">
                You must upload the following documents before submitting:
              </p>
              <ul className="text-[13px] text-[#f87171] list-disc list-inside mt-1">
                {missingDocs.map(doc => (
                  <li key={doc}>{doc.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</li>
                ))}
              </ul>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onBack()}
                className="mt-2 text-[13px] border-[#f87171] text-[#f87171] hover:bg-[rgba(248,113,113,0.1)]"
              >
                Go Back to Upload Documents
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Business Information */}
      <Card className="bg-[#21242f] border-[rgba(255,255,255,0.08)]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#c9a962]" />
            <CardTitle className="text-[18px] font-semibold text-[#f8f8fa]">Business Information</CardTitle>
          </div>
          <CardDescription className="text-[13px] text-[#b0b2bc]">Your company details</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <dt className="text-[12px] font-medium text-[#6a6d78] uppercase">Full Name</dt>
              <dd className="text-[14px] font-semibold text-[#f8f8fa]">{businessInfo.full_name}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-[12px] font-medium text-[#6a6d78] uppercase">Phone</dt>
              <dd className="text-[14px] font-semibold text-[#f8f8fa]">{businessInfo.phone}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-[12px] font-medium text-[#6a6d78] uppercase">Company Name</dt>
              <dd className="text-[14px] font-semibold text-[#f8f8fa]">{businessInfo.company_name}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-[12px] font-medium text-[#6a6d78] uppercase">Primary Trade</dt>
              <dd><Badge variant="outline" className="text-[12px]">{businessInfo.primary_trade}</Badge></dd>
            </div>
            {businessInfo.business_type && (
              <div className="space-y-1">
                <dt className="text-[12px] font-medium text-[#6a6d78] uppercase">Business Type</dt>
                <dd className="text-[14px] font-semibold text-[#f8f8fa]">{businessInfo.business_type}</dd>
              </div>
            )}
            {businessInfo.years_in_business > 0 && (
              <div className="space-y-1">
                <dt className="text-[12px] font-medium text-[#6a6d78] uppercase">Years in Business</dt>
                <dd className="text-[14px] font-semibold text-[#f8f8fa]">{businessInfo.years_in_business}</dd>
              </div>
            )}
            {businessInfo.team_size && (
              <div className="space-y-1">
                <dt className="text-[12px] font-medium text-[#6a6d78] uppercase">Team Size</dt>
                <dd className="text-[14px] font-semibold text-[#f8f8fa]">{businessInfo.team_size}</dd>
              </div>
            )}
            {businessInfo.service_areas.length > 0 && (
              <div className="col-span-2 space-y-1">
                <dt className="text-[12px] font-medium text-[#6a6d78] uppercase">Service Areas</dt>
                <dd className="text-[14px] font-semibold text-[#f8f8fa]">
                  {businessInfo.service_areas.join(", ")}
                </dd>
              </div>
            )}
            {businessInfo.website && (
              <div className="space-y-1">
                <dt className="text-[12px] font-medium text-[#6a6d78] uppercase">Website</dt>
                <dd className="text-[14px]">
                  <a
                    href={businessInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#c9a962] hover:underline"
                  >
                    {businessInfo.website}
                  </a>
                </dd>
              </div>
            )}
            {businessInfo.linkedin_url && (
              <div className="space-y-1">
                <dt className="text-[12px] font-medium text-[#6a6d78] uppercase">LinkedIn</dt>
                <dd className="text-[14px]">
                  <a
                    href={businessInfo.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#c9a962] hover:underline"
                  >
                    View Profile
                  </a>
                </dd>
              </div>
            )}
            {businessInfo.bio && (
              <div className="col-span-2 space-y-1">
                <dt className="text-[12px] font-medium text-[#6a6d78] uppercase">Company Bio</dt>
                <dd className="text-[14px] text-[#b0b2bc]">{businessInfo.bio}</dd>
              </div>
            )}
          </dl>

          {(businessInfo.street_address || businessInfo.city || businessInfo.state) && (
            <div className="mt-6 pt-6 border-t border-[rgba(255,255,255,0.08)] space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#6a6d78]" />
                <h4 className="text-[13px] font-medium text-[#b0b2bc]">Business Address</h4>
              </div>
              <p className="text-[14px] text-[#b0b2bc]">
                {businessInfo.street_address && <>{businessInfo.street_address}<br /></>}
                {businessInfo.city && businessInfo.state && (
                  <>
                    {businessInfo.city}, {businessInfo.state} {businessInfo.zip_code}
                  </>
                )}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Uploaded Documents */}
      <Card className="bg-[#21242f] border-[rgba(255,255,255,0.08)]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#c9a962]" />
            <CardTitle className="text-[18px] font-semibold text-[#f8f8fa]">Uploaded Documents</CardTitle>
          </div>
          <CardDescription className="text-[13px] text-[#b0b2bc]">{documentCount} documents uploaded</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {documents.business_registration && documents.business_registration.length > 0 && (
              <li className="flex items-center gap-2 text-[14px]">
                <CheckCircle className="h-5 w-5 text-[#22c55e] flex-shrink-0" />
                <span className="font-medium text-[#f8f8fa]">Business Registration:</span>
                <span className="text-[#b0b2bc]">{documents.business_registration.map(f => f.name).join(', ')}</span>
              </li>
            )}
            {documents.professional_license && documents.professional_license.length > 0 && (
              <li className="flex items-center gap-2 text-[14px]">
                <CheckCircle className="h-5 w-5 text-[#22c55e] flex-shrink-0" />
                <span className="font-medium text-[#f8f8fa]">Professional License:</span>
                <span className="text-[#b0b2bc]">{documents.professional_license.map(f => f.name).join(', ')}</span>
              </li>
            )}
            {documents.liability_insurance && documents.liability_insurance.length > 0 && (
              <li className="flex items-center gap-2 text-[14px]">
                <CheckCircle className="h-5 w-5 text-[#22c55e] flex-shrink-0" />
                <span className="font-medium text-[#f8f8fa]">Liability Insurance:</span>
                <span className="text-[#b0b2bc]">{documents.liability_insurance.map(f => f.name).join(', ')}</span>
              </li>
            )}
            {documents.workers_comp && documents.workers_comp.length > 0 && (
              <li className="flex items-center gap-2 text-[14px]">
                <CheckCircle className="h-5 w-5 text-[#22c55e] flex-shrink-0" />
                <span className="font-medium text-[#f8f8fa]">Workers' Compensation:</span>
                <span className="text-[#b0b2bc]">{documents.workers_comp.map(f => f.name).join(', ')}</span>
              </li>
            )}
            {documents.contact_verification && documents.contact_verification.length > 0 && (
              <li className="flex items-center gap-2 text-[14px]">
                <CheckCircle className="h-5 w-5 text-[#22c55e] flex-shrink-0" />
                <span className="font-medium text-[#f8f8fa]">Contact Verification:</span>
                <span className="text-[#b0b2bc]">{documents.contact_verification.map(f => f.name).join(', ')}</span>
              </li>
            )}
            {documents.tax_compliance && documents.tax_compliance.length > 0 && (
              <li className="flex items-center gap-2 text-[14px]">
                <CheckCircle className="h-5 w-5 text-[#22c55e] flex-shrink-0" />
                <span className="font-medium text-[#f8f8fa]">W-9 Tax Form:</span>
                <span className="text-[#b0b2bc]">{documents.tax_compliance.map(f => f.name).join(', ')}</span>
              </li>
            )}
            {documentCount === 0 && (
              <li className="text-[14px] text-[#6a6d78] italic">No documents uploaded yet</li>
            )}
          </ul>
        </CardContent>
      </Card>

      {/* Portfolio Items */}
      <Card className="bg-[#21242f] border-[rgba(255,255,255,0.08)]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Image className="h-5 w-5 text-[#c9a962]" />
            <CardTitle className="text-[18px] font-semibold text-[#f8f8fa]">Portfolio</CardTitle>
          </div>
          <CardDescription className="text-[13px] text-[#b0b2bc]">{portfolioItems.length} items uploaded</CardDescription>
        </CardHeader>
        <CardContent>
          {portfolioItems.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {portfolioItems.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="aspect-video bg-[#1a1d27] rounded-lg overflow-hidden border border-[rgba(255,255,255,0.08)]">
                    <img
                      src={URL.createObjectURL(item.file)}
                      alt={`Portfolio ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {item.description && (
                    <p className="text-[13px] text-[#b0b2bc]">{item.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[14px] text-[#6a6d78] italic">No portfolio items uploaded yet</p>
          )}
        </CardContent>
      </Card>

      {/* Terms Acceptance */}
      <Card hover={false} compact className="bg-[rgba(34,197,94,0.1)] border-[rgba(34,197,94,0.3)]">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-[#22c55e]" />
          <span className="text-[14px] font-medium text-[#22c55e]">
            Terms of Service accepted
          </span>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-[rgba(255,255,255,0.08)]">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={loading}
          className="h-10 text-[14px]"
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={loading || !hasAllRequiredDocs}
          className="bg-[#c9a962] hover:bg-[#d4b674] text-[#1a1d27] h-10 text-[14px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : !hasAllRequiredDocs ? (
            "Upload Required Documents"
          ) : (
            "Submit Application"
          )}
        </Button>
      </div>
    </div>
  );
}
