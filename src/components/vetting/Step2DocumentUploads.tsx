"use client";

import { useState } from "react";
import { DocumentData } from "./VettingWizard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, CheckCircle, X, FileText, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Step2Props {
  onComplete: (data: DocumentData) => void;
  onBack: () => void;
  initialData: DocumentData;
}

interface DocumentField {
  key: keyof DocumentData;
  label: string;
  description: string;
  required: boolean;
  acceptedFormats: string;
  verificationInfo: {
    whatWeVerify: string;
    howWeVerify: string;
    whyItMatters: string;
  };
}

const DOCUMENT_FIELDS: DocumentField[] = [
  {
    key: "business_registration",
    label: "Business Registration",
    description: "State/local business license or registration certificate",
    required: true,
    acceptedFormats: ".pdf,.jpg,.jpeg,.png",
    verificationInfo: {
      whatWeVerify: "Active business registration with state/local authorities, including LLC, Corporation, or Sole Proprietorship documentation.",
      howWeVerify: "Cross-reference provided registration documents with Secretary of State database and DUNS number verification where applicable.",
      whyItMatters: "Establishes the business as a legitimate legal entity, not a fly-by-night operation. Required for contract enforcement and liability."
    }
  },
  {
    key: "professional_license",
    label: "Professional License",
    description: "Valid professional licenses for your trade (e.g., contractor license, architect registration)",
    required: true,
    acceptedFormats: ".pdf,.jpg,.jpeg,.png",
    verificationInfo: {
      whatWeVerify: "Current, valid professional licenses required for the member's trade (contractor license, architect registration, interior design certification, etc.).",
      howWeVerify: "Direct verification with licensing boards (e.g., DC DCRA, Maryland DLLR, Virginia DPOR). License number, status, and expiration date confirmed.",
      whyItMatters: "Unlicensed work exposes clients to legal and financial risk. License verification is non-negotiable for professional credibility."
    }
  },
  {
    key: "liability_insurance",
    label: "General Liability Insurance",
    description: "Certificate of Insurance (COI) showing minimum $1M per occurrence coverage",
    required: true,
    acceptedFormats: ".pdf,.jpg,.jpeg,.png",
    verificationInfo: {
      whatWeVerify: "Active general liability insurance policy with minimum coverage of $1M per occurrence / $2M aggregate (or trade-appropriate minimums).",
      howWeVerify: "Certificate of Insurance (COI) review with policy number, coverage limits, and expiration date. Direct carrier verification for policies over $500K.",
      whyItMatters: "Protects clients from liability exposure. Enterprise partners universally require insurance verification before contractor engagement."
    }
  },
  {
    key: "workers_comp",
    label: "Workers' Compensation",
    description: "Active policy or valid exemption certificate",
    required: true,
    acceptedFormats: ".pdf,.jpg,.jpeg,.png",
    verificationInfo: {
      whatWeVerify: "Active workers' compensation insurance (where required by law) or documented exemption status for sole proprietors without employees.",
      howWeVerify: "COI review or exemption certificate. Cross-reference with state workers' comp board for compliance status.",
      whyItMatters: "Non-compliance creates significant liability for clients and general contractors. Essential for commercial and enterprise projects."
    }
  },
  {
    key: "contact_verification",
    label: "Contact & Location Verification",
    description: "Utility bill, lease agreement, or other proof of business address",
    required: false,
    acceptedFormats: ".pdf,.jpg,.jpeg,.png",
    verificationInfo: {
      whatWeVerify: "Valid business address (physical or registered agent), working phone number, and professional email domain.",
      howWeVerify: "Phone verification call, email confirmation, and address cross-reference with business registration. P.O. boxes flagged (acceptable but noted).",
      whyItMatters: "Ensures the business can be reached and is operating in the service area. Basic reachability is foundational to trust."
    }
  },
  {
    key: "tax_compliance",
    label: "W-9 Tax Form",
    description: "IRS Form W-9 (Request for Taxpayer Identification Number). Download from IRS.gov if needed.",
    required: true,
    acceptedFormats: ".pdf,.jpg,.jpeg,.png",
    verificationInfo: {
      whatWeVerify: "Valid W-9 form with correct business name and tax identification number.",
      howWeVerify: "W-9 form review for completeness and consistency with business registration.",
      whyItMatters: "Required for proper 1099 reporting and ensures the business is tax compliant."
    }
  },
];

// More Info Modal Component
function MoreInfoModal({ field }: { field: DocumentField }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-[#c9a962] hover:text-[#d4b674] hover:bg-[rgba(201,169,98,0.1)] h-auto px-2 py-1 gap-1"
        >
          <Info className="h-4 w-4" />
          <span className="text-[12px] font-medium">More Info</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#21242f] border-[rgba(255,255,255,0.08)] max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-[18px] font-semibold text-[#f8f8fa]">
            {field.label} - Verification Details
          </DialogTitle>
          <DialogDescription className="text-[13px] text-[#b0b2bc]">
            From the 15-Point VaaS Framework
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 mt-4">
          <div className="space-y-2">
            <h4 className="text-[14px] font-semibold text-[#c9a962] flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              What We Verify
            </h4>
            <p className="text-[13px] text-[#d4d6e1] leading-relaxed pl-6">
              {field.verificationInfo.whatWeVerify}
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-[14px] font-semibold text-[#c9a962] flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              How We Verify
            </h4>
            <p className="text-[13px] text-[#d4d6e1] leading-relaxed pl-6">
              {field.verificationInfo.howWeVerify}
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-[14px] font-semibold text-[#c9a962] flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Why It Matters
            </h4>
            <p className="text-[13px] text-[#d4d6e1] leading-relaxed pl-6">
              {field.verificationInfo.whyItMatters}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Step2DocumentUploads({ onComplete, onBack, initialData }: Step2Props) {
  const [documents, setDocuments] = useState<DocumentData>(initialData);
  const [previews, setPreviews] = useState<Record<string, string[]>>({});
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [workersCompExempt, setWorkersCompExempt] = useState<boolean>(initialData.workers_comp_exempt_sole_prop || false);

  const handleFilesAdd = (key: keyof DocumentData, newFiles: FileList | File[]) => {
    const filesArray = Array.from(newFiles);
    const existingFiles = documents[key];
    // Ensure existingFiles is an array (skip if it's a boolean or undefined)
    const existingFilesArray = Array.isArray(existingFiles) ? existingFiles : [];
    const allFiles = [...existingFilesArray, ...filesArray];

    setDocuments((prev) => ({ ...prev, [key]: allFiles }));

    // Create previews for images
    const newPreviews: string[] = [];
    filesArray.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews((prev) => ({
            ...prev,
            [key]: [...(prev[key] || []), reader.result as string],
          }));
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleFileRemove = (key: keyof DocumentData, index: number) => {
    const existingFiles = documents[key];
    // Ensure existingFiles is an array
    const existingFilesArray = Array.isArray(existingFiles) ? existingFiles : [];
    const newFiles = existingFilesArray.filter((_: File, i: number) => i !== index);

    if (newFiles.length === 0) {
      setDocuments((prev) => {
        const newDocs = { ...prev };
        delete newDocs[key];
        return newDocs;
      });
      setPreviews((prev) => {
        const newPreviews = { ...prev };
        delete newPreviews[key];
        return newPreviews;
      });
    } else {
      setDocuments((prev) => ({ ...prev, [key]: newFiles }));
      const existingPreviews = previews[key] || [];
      const newPreviews = existingPreviews.filter((_: string, i: number) => i !== index);
      setPreviews((prev) => ({ ...prev, [key]: newPreviews }));
    }
  };

  const handleDragOver = (e: React.DragEvent, key: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(key);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(null);
  };

  const handleDrop = (e: React.DragEvent, key: keyof DocumentData) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(null);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFilesAdd(key, files);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check required documents
    const requiredFields = DOCUMENT_FIELDS.filter((f) => f.required);
    const missingFields = requiredFields.filter((f) => {
      // Special handling for workers' comp: if exempt, document is not required
      if (f.key === 'workers_comp' && workersCompExempt) {
        return false;
      }
      return !documents[f.key];
    });

    if (missingFields.length > 0) {
      alert(
        `Please upload the following required documents:\n${missingFields
          .map((f) => f.label)
          .join("\n")}`
      );
      return;
    }

    // Include exemption status in the submission
    const submissionData = {
      ...documents,
      workers_comp_exempt_sole_prop: workersCompExempt,
    };

    onComplete(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header Info */}
      <Card hover={false} compact className="bg-[rgba(201,169,98,0.1)] border-[rgba(201,169,98,0.3)]">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-[#c9a962] mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <h3 className="text-[14px] font-medium text-[#c9a962]">Tier 1 Verification Documents</h3>
            <p className="text-[13px] text-[#b0b2bc]">
              Upload the following documents to complete your Tier 1 verification. These are the foundational
              requirements for joining the Proclusive network.
            </p>
          </div>
        </div>
      </Card>

      {/* Document Upload Cards */}
      <div className="space-y-4">
        {DOCUMENT_FIELDS.map((field) => (
          <Card key={field.key} className="bg-[#21242f] border-[rgba(255,255,255,0.08)]">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <FileText className="h-5 w-5 text-[#c9a962] mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <CardTitle className="text-[16px] font-semibold text-[#f8f8fa] flex items-center gap-2">
                        {field.label}
                        {field.required && <Badge variant="destructive" className="text-[11px] px-2 py-0.5">Required</Badge>}
                      </CardTitle>
                      <MoreInfoModal field={field} />
                    </div>
                    <CardDescription className="mt-1 text-[13px] text-[#b0b2bc]">{field.description}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Workers' Comp Exemption Checkbox */}
              {field.key === 'workers_comp' && (
                <div className="bg-[rgba(201,169,98,0.1)] border border-[rgba(201,169,98,0.3)] rounded-lg p-4 mb-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={workersCompExempt}
                      onChange={(e) => {
                        setWorkersCompExempt(e.target.checked);
                        // If checking the exemption, clear any uploaded workers' comp files
                        if (e.target.checked && documents.workers_comp) {
                          setDocuments((prev) => {
                            const newDocs = { ...prev };
                            delete newDocs.workers_comp;
                            return newDocs;
                          });
                          setPreviews((prev) => {
                            const newPreviews = { ...prev };
                            delete newPreviews.workers_comp;
                            return newPreviews;
                          });
                        }
                      }}
                      className="mt-0.5 h-4 w-4 rounded border-[rgba(201,169,98,0.5)] text-[#c9a962] focus:ring-[#c9a962] focus:ring-offset-[#21242f]"
                    />
                    <div className="flex-1">
                      <span className="text-[13px] font-medium text-[#c9a962]">
                        I am a sole proprietor without employees and exempt from workers' compensation requirements
                      </span>
                      <p className="text-[12px] text-[#b0b2bc] mt-1">
                        If you check this box, you can optionally upload an exemption certificate if your state provides one. Otherwise, no document upload is required.
                      </p>
                    </div>
                  </label>
                </div>
              )}

              {/* Upload Area - entire zone is clickable */}
              <div
                className={`border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${
                  dragOver === field.key
                    ? 'border-[#c9a962] bg-[rgba(201,169,98,0.1)]'
                    : 'border-[rgba(255,255,255,0.15)] hover:border-[#c9a962] hover:bg-[rgba(201,169,98,0.05)]'
                }${field.key === 'workers_comp' && workersCompExempt ? ' opacity-60' : ''}`}
                onDragOver={(e) => handleDragOver(e, field.key)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, field.key)}
                onClick={() => {
                  const input = document.getElementById(`file-${field.key}`) as HTMLInputElement;
                  if (input) input.click();
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const input = document.getElementById(`file-${field.key}`) as HTMLInputElement;
                    if (input) input.click();
                  }
                }}
              >
                <div className="flex flex-col items-center gap-3 pointer-events-none">
                  <Upload className="h-8 w-8 text-[#6a6d78]" />
                  <div className="text-center">
                    <span className="text-[14px] text-[#b0b2bc] font-medium">
                      {field.key === 'workers_comp' && workersCompExempt ? 'Optional: Upload exemption certificate' : 'Choose files or drag and drop'}
                    </span>
                    <p className="text-[12px] text-[#6a6d78] mt-1">
                      Accepted: {field.acceptedFormats.replace(/\./g, '').toUpperCase()} • Multiple files allowed
                    </p>
                  </div>
                  <input
                    id={`file-${field.key}`}
                    type="file"
                    accept={field.acceptedFormats}
                    multiple
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFilesAdd(field.key, e.target.files);
                        e.target.value = ''; // Reset input to allow re-upload of same file
                      }
                    }}
                    className="sr-only"
                    aria-label={`Upload ${field.label}`}
                  />
                </div>
              </div>

              {/* Uploaded Files List */}
              {documents[field.key] && Array.isArray(documents[field.key]) && (documents[field.key] as File[]).length > 0 && (
                <div className="space-y-2">
                  {(documents[field.key] as File[]).map((file: File, index: number) => (
                    <div key={index} className="bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.3)] rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-[#22c55e] flex-shrink-0" />
                          <div>
                            <p className="text-[13px] font-medium text-[#22c55e]">
                              {file.name}
                            </p>
                            <p className="text-[12px] text-[#b0b2bc]">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFileRemove(field.key, index)}
                          className="text-[12px] text-[#f87171] hover:text-[#f87171] hover:bg-[rgba(248,113,113,0.1)]"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Preview for images */}
                      {previews[field.key]?.[index] && (
                        <div className="mt-3">
                          <img
                            src={previews[field.key][index]}
                            alt={`${field.label} ${index + 1}`}
                            className="max-w-xs rounded-lg border border-[rgba(255,255,255,0.08)]"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Guidelines */}
      <Card className="bg-[#21242f] border-[rgba(255,255,255,0.08)]">
        <CardHeader>
          <CardTitle className="text-[16px] font-semibold text-[#f8f8fa]">Document Upload Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-[13px] text-[#b0b2bc] space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-[#c9a962] mt-0.5 flex-shrink-0" />
              <span>Accepted formats: PDF, JPG, JPEG, PNG</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-[#c9a962] mt-0.5 flex-shrink-0" />
              <span>Maximum file size: 10MB per document</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-[#c9a962] mt-0.5 flex-shrink-0" />
              <span>Documents must be current and legible</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-[#c9a962] mt-0.5 flex-shrink-0" />
              <span>Ensure all information is clearly visible</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-[#c9a962] mt-0.5 flex-shrink-0" />
              <span>Documents will be reviewed by admin within 48 hours</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-[rgba(255,255,255,0.08)]">
        <Button type="button" variant="outline" onClick={onBack} className="h-10 text-[14px]">
          Back
        </Button>
        <Button type="submit" variant="default" className="h-10 text-[14px] bg-[#c9a962] hover:bg-[#d4b674] text-[#1a1d27]">
          Continue to Terms
        </Button>
      </div>
    </form>
  );
}
