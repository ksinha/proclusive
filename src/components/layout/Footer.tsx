import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative z-10 bg-[#1a1d27] border-t border-white/[0.08] px-[30px] py-[60px]">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Company Name */}
        <h3
          className="text-[13px] font-semibold text-[#f8f8fa] uppercase tracking-[0.1em] mb-2"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          Proclusive
        </h3>

        {/* Tagline */}
        <p className="text-[14px] text-[#b0b2bc] mb-3">
          For the built environment
        </p>

        {/* Email */}
        <a
          href="mailto:hello@proclusive.com"
          className="text-[14px] text-[#b0b2bc] hover:text-[#c9a962] transition-colors duration-300 mb-8"
        >
          hello@proclusive.com
        </a>

        {/* Legal Links */}
        <div className="flex items-center gap-2 mb-8">
          <Link
            href="/terms"
            className="text-[14px] text-[#b0b2bc] hover:text-[#c9a962] transition-colors duration-300"
          >
            Terms of Service
          </Link>
          <span className="text-[14px] text-[#6a6d78]">·</span>
          <Link
            href="/privacy"
            className="text-[14px] text-[#b0b2bc] hover:text-[#c9a962] transition-colors duration-300"
          >
            Privacy Policy
          </Link>
        </div>

        {/* Copyright */}
        <p className="text-[13px] text-[#6a6d78]">
          © 2026 Chalo Enterprises LLC. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
