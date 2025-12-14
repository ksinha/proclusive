"use client";

import { useState, useRef } from "react";

export interface TaxComplianceData {
  tin_number: string;
  w9_document?: File;
}

interface Step4TaxComplianceProps {
  onComplete: (data: TaxComplianceData) => void;
  onBack: () => void;
  initialData?: TaxComplianceData;
}

export default function Step4TaxCompliance({
  onComplete,
  onBack,
  initialData,
}: Step4TaxComplianceProps) {
  const [tinNumber, setTinNumber] = useState(initialData?.tin_number || "");
  const [w9Document, setW9Document] = useState<File | undefined>(
    initialData?.w9_document
  );
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setError("Only PDF, JPG, and PNG files are allowed");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    setW9Document(file);
    setError(null);

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleRemoveFile = () => {
    setW9Document(undefined);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatTIN = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, "");

    // Format as XX-XXXXXXX for TIN/EIN
    if (digits.length <= 2) {
      return digits;
    } else if (digits.length <= 9) {
      return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    } else {
      return `${digits.slice(0, 2)}-${digits.slice(2, 9)}`;
    }
  };

  const handleTINChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTIN(e.target.value);
    setTinNumber(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate TIN number (should be 9 digits formatted as XX-XXXXXXX)
    const digits = tinNumber.replace(/\D/g, "");
    if (digits.length !== 9) {
      setError("TIN/EIN must be 9 digits");
      return;
    }

    // Validate W-9 document
    if (!w9Document) {
      setError("Please upload your W-9 form");
      return;
    }

    onComplete({
      tin_number: tinNumber,
      w9_document: w9Document,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Tax Compliance</h2>
      <p className="text-gray-600 mb-6">
        To comply with tax regulations and enable payment processing, we need
        your Tax Identification Number (TIN) or Employer Identification Number
        (EIN) and a completed W-9 form.
      </p>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* TIN/EIN Input */}
      <div className="mb-6">
        <label className="block mb-2">
          <span className="text-sm font-medium text-gray-700">
            TIN / EIN <span className="text-red-600">*</span>
          </span>
          <input
            type="text"
            value={tinNumber}
            onChange={handleTINChange}
            placeholder="XX-XXXXXXX"
            maxLength={10}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </label>
        <p className="text-sm text-gray-500 mt-1">
          Format: XX-XXXXXXX (9 digits). This information is encrypted and secure.
        </p>
      </div>

      {/* W-9 Upload */}
      <div className="mb-6">
        <label className="block mb-2">
          <span className="text-sm font-medium text-gray-700">
            W-9 Form <span className="text-red-600">*</span>
          </span>
        </label>

        {!w9Document ? (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 w-full hover:border-blue-500 transition-colors text-center"
            >
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-600">
                Click to upload W-9 Form
              </p>
              <p className="mt-1 text-xs text-gray-500">
                PDF, JPG, or PNG (max 10MB)
              </p>
            </button>
          </div>
        ) : (
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <svg
                  className="h-10 w-10 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {w9Document.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(w9Document.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Remove
              </button>
            </div>
            {preview && (
              <div className="mt-4">
                <img
                  src={preview}
                  alt="W-9 Preview"
                  className="max-h-64 rounded border border-gray-200"
                />
              </div>
            )}
          </div>
        )}

        <p className="text-sm text-gray-500 mt-2">
          Download a blank W-9 form from the{" "}
          <a
            href="https://www.irs.gov/pub/irs-pdf/fw9.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            IRS website
          </a>
        </p>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <svg
            className="h-5 w-5 text-blue-600 mt-0.5 mr-3"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-900">
              Your information is secure
            </p>
            <p className="text-sm text-blue-700 mt-1">
              Your TIN and W-9 form are encrypted and stored securely. This
              information will never be displayed publicly and is only accessible
              to authorized administrators for compliance purposes.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Continue
        </button>
      </div>
    </form>
  );
}
