"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, X, ImageIcon, Info } from "lucide-react";

export interface PortfolioItem {
  file: File;
  description: string;
  preview: string;
}

interface Step3PortfolioProps {
  onComplete: (items: PortfolioItem[]) => void;
  onBack: () => void;
  initialData?: PortfolioItem[];
}

export default function Step3Portfolio({
  onComplete,
  onBack,
  initialData = [],
}: Step3PortfolioProps) {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(initialData);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = (files: FileList | File[]) => {
    const newItems: PortfolioItem[] = [];

    Array.from(files).forEach((file) => {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }

      // Create preview URL
      const preview = URL.createObjectURL(file);
      newItems.push({
        file,
        description: "",
        preview,
      });
    });

    if (newItems.length > 0) {
      setPortfolioItems([...portfolioItems, ...newItems]);
      setError(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    processFiles(files);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleDescriptionChange = (index: number, description: string) => {
    const updated = [...portfolioItems];
    updated[index].description = description;
    setPortfolioItems(updated);
  };

  const handleRemove = (index: number) => {
    const updated = portfolioItems.filter((_, i) => i !== index);
    setPortfolioItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate minimum 5 items
    if (portfolioItems.length < 5) {
      setError("Please upload at least 5 portfolio images");
      return;
    }

    onComplete(portfolioItems);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-[24px] font-semibold text-[#f8f8fa] mb-2">Portfolio</h2>
        <p className="text-[14px] text-[#b0b2bc]">
          Showcase your work by uploading at least 5 high-quality images of your
          projects. Add descriptions to provide context about each project.
        </p>
      </div>

      {error && (
        <Card className="border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.1)]">
          <CardContent className="pt-6">
            <p className="text-[#f87171] font-medium text-[14px]">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Upload Section - Entire zone is clickable */}
      <Card className="bg-[#21242f] border-[rgba(255,255,255,0.08)]">
        <CardContent className="pt-6">
          <input
            type="file"
            ref={fileInputRef}
            id="portfolio-file-input"
            onChange={handleFileSelect}
            accept="image/*"
            multiple
            className="sr-only"
            aria-label="Upload portfolio images"
          />
          <div
            className={`border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer ${
              dragOver
                ? 'border-[#c9a962] bg-[rgba(201,169,98,0.1)]'
                : 'border-[rgba(255,255,255,0.15)] hover:border-[#c9a962] hover:bg-[rgba(201,169,98,0.05)]'
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
          >
            <div className="flex flex-col items-center justify-center gap-3 pointer-events-none">
              <Upload className="h-8 w-8 text-[#6a6d78]" />
              <div className="text-center">
                <span className="text-[14px] text-[#b0b2bc] font-medium">
                  Choose files or drag and drop
                </span>
                <p className="text-[12px] text-[#6a6d78] mt-1">
                  Accepted: JPG, PNG, WebP, GIF • Max 10MB per image
                </p>
                <p className="text-[13px] text-[#c9a962] mt-2 font-medium">
                  {portfolioItems.length} / 5 minimum images uploaded
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Grid */}
      {portfolioItems.length > 0 && (
        <div className="grid grid-cols-2 gap-6">
          {portfolioItems.map((item, index) => (
            <Card key={index} className="bg-[#21242f] border-[rgba(255,255,255,0.08)] overflow-hidden">
              <div className="relative aspect-video">
                <img
                  src={item.preview}
                  alt={`Portfolio item ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemove(index)}
                  className="absolute top-2 right-2 h-8 px-3 text-[12px]"
                  title="Remove image"
                >
                  <X className="h-3 w-3 mr-1" />
                  Remove
                </Button>
                <Badge className="absolute top-2 left-2 bg-[#1a1d27] text-[#f8f8fa] text-[11px]">
                  Image {index + 1}
                </Badge>
              </div>
              <CardContent className="pt-4 space-y-2">
                <Label htmlFor={`description-${index}`} className="text-[13px] font-medium text-[#b0b2bc]">
                  Description (Optional)
                </Label>
                <Textarea
                  id={`description-${index}`}
                  value={item.description}
                  onChange={(e) => handleDescriptionChange(index, e.target.value)}
                  placeholder="Describe this project..."
                  rows={3}
                  className="text-[14px]"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-[rgba(255,255,255,0.08)]">
        <Button type="button" variant="outline" onClick={onBack} className="h-10 text-[14px]">
          Back
        </Button>
        <Button
          type="submit"
          variant="default"
          disabled={portfolioItems.length < 5}
          className="h-10 text-[14px] bg-[#c9a962] hover:bg-[#d4b674] text-[#1a1d27] disabled:bg-[rgba(201,169,98,0.3)]"
        >
          Continue
        </Button>
      </div>
    </form>
  );
}
