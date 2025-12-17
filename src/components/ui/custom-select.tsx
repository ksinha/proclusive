"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  name?: string;
  id?: string;
  error?: boolean;
  disabled?: boolean;
  className?: string;
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  name,
  id,
  error,
  disabled,
  className,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Scroll selected option into view when opening
  useEffect(() => {
    if (isOpen && listRef.current && value) {
      const selectedElement = listRef.current.querySelector(`[data-value="${value}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [isOpen, value]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setIsOpen(!isOpen);
    } else if (event.key === "ArrowDown" && isOpen) {
      event.preventDefault();
      const currentIndex = options.findIndex((opt) => opt.value === value);
      const nextIndex = Math.min(currentIndex + 1, options.length - 1);
      onChange(options[nextIndex].value);
    } else if (event.key === "ArrowUp" && isOpen) {
      event.preventDefault();
      const currentIndex = options.findIndex((opt) => opt.value === value);
      const prevIndex = Math.max(currentIndex - 1, 0);
      onChange(options[prevIndex].value);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={value} />

      {/* Select button */}
      <button
        type="button"
        id={id}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={cn(
          "flex w-full h-[52px] items-center justify-between rounded-md border px-[18px] text-[16px] text-left",
          "bg-[#21242f] border-[rgba(255,255,255,0.08)] text-[#f8f8fa]",
          "font-['Outfit',sans-serif] transition-all duration-200",
          "focus:outline-none focus:border-[#c9a962] focus:shadow-[0_0_0_3px_rgba(201,169,98,0.15)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-[#f87171] focus:border-[#f87171] focus:shadow-[0_0_0_3px_rgba(248,113,113,0.15)]",
          !selectedOption && "text-[#6a6d78]"
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-[#6a6d78] transition-transform duration-200 flex-shrink-0 ml-2",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <ul
          ref={listRef}
          role="listbox"
          className={cn(
            "absolute z-50 mt-1 w-full rounded-md border overflow-hidden",
            "bg-[#21242f] border-[rgba(255,255,255,0.15)]",
            "shadow-lg shadow-black/20",
            "max-h-60 overflow-y-auto"
          )}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <li
                key={option.value}
                role="option"
                data-value={option.value}
                aria-selected={isSelected}
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "flex items-center justify-between px-[18px] py-3 text-[15px] cursor-pointer",
                  "transition-colors duration-150",
                  isSelected
                    ? "bg-[rgba(201,169,98,0.15)] text-[#c9a962]"
                    : "text-[#f8f8fa] hover:bg-[rgba(255,255,255,0.08)]"
                )}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && <Check className="h-4 w-4 flex-shrink-0 ml-2" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
