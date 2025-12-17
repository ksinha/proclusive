"use client";

import { useState } from "react";
import { DocumentData } from "./VettingWizard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, CheckCircle, X, FileText, Info } from "lucide-react";

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
}

const DOCUMENT_FIELDS: DocumentField[] = [
  {
    key: "business_registration",
    label: "Business Registration",
    description: "State/local business license or registration certificate",
    required: true,
    acceptedFormats: ".pdf,.jpg,.jpeg,.png",
  },
  {
    key: "professional_license",
    label: "Professional License",
    description: "Valid professional licenses for your trade (e.g., contractor license, architect registration)",
    required: true,
    acceptedFormats: ".pdf,.jpg,.jpeg,.png",
  },
  {
    key: "liability_insurance",
    label: "General Liability Insurance",
    description: "Certificate of Insurance (COI) showing minimum $1M per occurrence coverage",
    required: true,
    acceptedFormats: ".pdf,.jpg,.jpeg,.png",
  },
  {
    key: "workers_comp",
    label: "Workers' Compensation",
    description: "Active policy or valid exemption certificate",
    required: true,
    acceptedFormats: ".pdf,.jpg,.jpeg,.png",
  },
  {
    key: "contact_verification",
    label: "Contact & Location Verification",
    description: "Utility bill, lease agreement, or other proof of business address",
    required: false,
    acceptedFormats: ".pdf,.jpg,.jpeg,.png",
  },
  {
    key: "tax_compliance",
    label: "W-9 Tax Form",
    description: "IRS Form W-9 (Request for Taxpayer Identification Number). Download from IRS.gov if needed.",
    required: true,
    acceptedFormats: ".pdf,.jpg,.jpeg,.png",
  },
];

export default function Step2DocumentUploads({ onComplete, onBack, initialData }: Step2Props) {
  const [documents, setDocuments] = useState<DocumentData>(initialData);
  const [previews, setPreviews] = useState<Record<string, string[]>>({});
  const [dragOver, setDragOver] = useState<string | null>(null);

  const handleFilesAdd = (key: keyof DocumentData, newFiles: FileList | File[]) => {
    const filesArray = Array.from(newFiles);
    const existingFiles = documents[key] || [];
    const allFiles = [...existingFiles, ...filesArray];

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
    const existingFiles = documents[key] || [];
    const newFiles = existingFiles.filter((_, i) => i !== index);

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
      const newPreviews = existingPreviews.filter((_, i) => i !== index);
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
    const missingFields = requiredFields.filter((f) => !documents[f.key]);

    if (missingFields.length > 0) {
      alert(
        `Please upload the following required documents:\n${missingFields
          .map((f) => f.label)
          .join("\n")}`
      );
      return;
    }

    onComplete(documents);
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
                    <CardTitle className="text-[16px] font-semibold text-[#f8f8fa] flex items-center gap-2">
                      {field.label}
                      {field.required && <Badge variant="destructive" className="text-[11px] px-2 py-0.5">Required</Badge>}
                    </CardTitle>
                    <CardDescription className="mt-1 text-[13px] text-[#b0b2bc]">{field.description}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                  dragOver === field.key
                    ? 'border-[#c9a962] bg-[rgba(201,169,98,0.1)]'
                    : 'border-[rgba(255,255,255,0.15)] hover:border-[#c9a962]'
                }`}
                onDragOver={(e) => handleDragOver(e, field.key)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, field.key)}
              >
                <div className="flex flex-col items-center gap-3">
                  <Upload className="h-8 w-8 text-[#6a6d78]" />
                  <div className="text-center">
                    <label htmlFor={`file-${field.key}`} className="text-[14px] text-[#b0b2bc] font-medium cursor-pointer hover:text-[#c9a962]">
                      Choose files or drag and drop
                    </label>
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
                    className="hidden"
                  />
                </div>
              </div>

              {/* Uploaded Files List */}
              {documents[field.key] && documents[field.key]!.length > 0 && (
                <div className="space-y-2">
                  {documents[field.key]!.map((file, index) => (
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
