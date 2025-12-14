import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-navy-800 border-t border-navy-700">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Company */}
          <div>
            <h3 className="text-[13px] font-semibold text-white uppercase tracking-wide mb-4">
              Proclusive
            </h3>
            <p className="text-[14px] text-gray-400">
              High-Trust B2B Referral Network for the Construction Industry
            </p>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-[13px] font-semibold text-white uppercase tracking-wide mb-4">
              Resources
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-[14px] text-gray-400 hover:text-white transition-colors py-2 inline-block"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/login"
                  className="text-[14px] text-gray-400 hover:text-white transition-colors py-2 inline-block"
                >
                  Member Login
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/signup"
                  className="text-[14px] text-gray-400 hover:text-white transition-colors py-2 inline-block"
                >
                  Apply to Join
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-[13px] font-semibold text-white uppercase tracking-wide mb-4">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-[14px] text-gray-400 hover:text-white transition-colors py-2 inline-block"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[14px] text-gray-400 hover:text-white transition-colors py-2 inline-block"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@proclusive.com"
                  className="text-[14px] text-gray-400 hover:text-white transition-colors py-2 inline-block"
                >
                  Contact Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-navy-700">
          <p className="text-[13px] text-gray-500 text-center">
            © {new Date().getFullYear()} Proclusive. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
