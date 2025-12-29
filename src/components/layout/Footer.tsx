import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/[0.08] px-[30px] py-[60px]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Company */}
          <div>
            <h3 className="text-[13px] font-semibold text-[#f8f8fa] uppercase tracking-[0.1em] mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Proclusive
            </h3>
            <p className="text-[14px] text-[#b0b2bc] mb-3">
              For the built environment
            </p>
            <a
              href="mailto:hello@proclusive.com"
              className="text-[14px] text-[#b0b2bc] hover:text-[#c9a962] transition-colors duration-300"
            >
              hello@proclusive.com
            </a>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-[13px] font-semibold text-[#f8f8fa] uppercase tracking-[0.1em] mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/terms"
                  className="text-[14px] text-[#b0b2bc] hover:text-[#c9a962] transition-colors duration-300 py-2 inline-block"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-[14px] text-[#b0b2bc] hover:text-[#c9a962] transition-colors duration-300 py-2 inline-block"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-white/[0.08]">
          <p className="text-[13px] text-[#6a6d78] text-center">
            © 2026 Chalo Enterprises LLC. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
