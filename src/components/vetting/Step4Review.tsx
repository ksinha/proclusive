"use client";

import { BusinessInfoData, DocumentData } from "./VettingWizard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, FileText, Building2, MapPin, Loader2, Info } from "lucide-react";

interface Step4Props {
  businessInfo: BusinessInfoData;
  documents: DocumentData;
  tosAccepted: boolean;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
}

export default function Step4Review({
  businessInfo,
  documents,
  tosAccepted,
  onBack,
  onSubmit,
  loading,
}: Step4Props) {
  const documentCount = Object.keys(documents).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-[24px] font-semibold text-gray-900 mb-2">Review & Submit</h2>
        <p className="text-[14px] text-gray-600">
          Please review all information before submitting your application
        </p>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <h3 className="text-[14px] font-medium text-blue-900">Review Your Application</h3>
              <p className="text-[13px] text-blue-800">
                Please review all information before submitting. Once submitted, your application will be
                reviewed by our admin team within 48 hours.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Information */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-[18px] font-semibold text-gray-900">Business Information</CardTitle>
          </div>
          <CardDescription className="text-[13px] text-gray-600">Your company details</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <dt className="text-[12px] font-medium text-gray-500 uppercase">Full Name</dt>
              <dd className="text-[14px] font-semibold text-gray-900">{businessInfo.full_name}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-[12px] font-medium text-gray-500 uppercase">Phone</dt>
              <dd className="text-[14px] font-semibold text-gray-900">{businessInfo.phone}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-[12px] font-medium text-gray-500 uppercase">Company Name</dt>
              <dd className="text-[14px] font-semibold text-gray-900">{businessInfo.company_name}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-[12px] font-medium text-gray-500 uppercase">Primary Trade</dt>
              <dd><Badge variant="outline" className="text-[12px]">{businessInfo.primary_trade}</Badge></dd>
            </div>
            {businessInfo.business_type && (
              <div className="space-y-1">
                <dt className="text-[12px] font-medium text-gray-500 uppercase">Business Type</dt>
                <dd className="text-[14px] font-semibold text-gray-900">{businessInfo.business_type}</dd>
              </div>
            )}
            {businessInfo.years_in_business > 0 && (
              <div className="space-y-1">
                <dt className="text-[12px] font-medium text-gray-500 uppercase">Years in Business</dt>
                <dd className="text-[14px] font-semibold text-gray-900">{businessInfo.years_in_business}</dd>
              </div>
            )}
            {businessInfo.team_size && (
              <div className="space-y-1">
                <dt className="text-[12px] font-medium text-gray-500 uppercase">Team Size</dt>
                <dd className="text-[14px] font-semibold text-gray-900">{businessInfo.team_size}</dd>
              </div>
            )}
            {businessInfo.service_areas.length > 0 && (
              <div className="col-span-2 space-y-1">
                <dt className="text-[12px] font-medium text-gray-500 uppercase">Service Areas</dt>
                <dd className="text-[14px] font-semibold text-gray-900">
                  {businessInfo.service_areas.join(", ")}
                </dd>
              </div>
            )}
            {businessInfo.website && (
              <div className="space-y-1">
                <dt className="text-[12px] font-medium text-gray-500 uppercase">Website</dt>
                <dd className="text-[14px]">
                  <a
                    href={businessInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {businessInfo.website}
                  </a>
                </dd>
              </div>
            )}
            {businessInfo.linkedin_url && (
              <div className="space-y-1">
                <dt className="text-[12px] font-medium text-gray-500 uppercase">LinkedIn</dt>
                <dd className="text-[14px]">
                  <a
                    href={businessInfo.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View Profile
                  </a>
                </dd>
              </div>
            )}
            {businessInfo.bio && (
              <div className="col-span-2 space-y-1">
                <dt className="text-[12px] font-medium text-gray-500 uppercase">Company Bio</dt>
                <dd className="text-[14px] text-gray-700">{businessInfo.bio}</dd>
              </div>
            )}
          </dl>

          {(businessInfo.street_address || businessInfo.city || businessInfo.state) && (
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <h4 className="text-[13px] font-medium text-gray-700">Business Address</h4>
              </div>
              <p className="text-[14px] text-gray-600">
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
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-[18px] font-semibold text-gray-900">Uploaded Documents</CardTitle>
          </div>
          <CardDescription className="text-[13px] text-gray-600">{documentCount} documents uploaded</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {documents.business_registration && documents.business_registration.length > 0 && (
              <li className="flex items-center gap-2 text-[14px]">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="font-medium text-gray-900">Business Registration:</span>
                <span className="text-gray-600">{documents.business_registration.map(f => f.name).join(', ')}</span>
              </li>
            )}
            {documents.professional_license && documents.professional_license.length > 0 && (
              <li className="flex items-center gap-2 text-[14px]">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="font-medium text-gray-900">Professional License:</span>
                <span className="text-gray-600">{documents.professional_license.map(f => f.name).join(', ')}</span>
              </li>
            )}
            {documents.liability_insurance && documents.liability_insurance.length > 0 && (
              <li className="flex items-center gap-2 text-[14px]">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="font-medium text-gray-900">Liability Insurance:</span>
                <span className="text-gray-600">{documents.liability_insurance.map(f => f.name).join(', ')}</span>
              </li>
            )}
            {documents.workers_comp && documents.workers_comp.length > 0 && (
              <li className="flex items-center gap-2 text-[14px]">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="font-medium text-gray-900">Workers' Compensation:</span>
                <span className="text-gray-600">{documents.workers_comp.map(f => f.name).join(', ')}</span>
              </li>
            )}
            {documents.contact_verification && documents.contact_verification.length > 0 && (
              <li className="flex items-center gap-2 text-[14px]">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="font-medium text-gray-900">Contact Verification:</span>
                <span className="text-gray-600">{documents.contact_verification.map(f => f.name).join(', ')}</span>
              </li>
            )}
          </ul>
        </CardContent>
      </Card>

      {/* Terms Acceptance */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <span className="text-[14px] font-medium text-green-900">
              Terms of Service accepted
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
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
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white h-10 text-[14px]"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Application"
          )}
        </Button>
      </div>
    </div>
  );
}
