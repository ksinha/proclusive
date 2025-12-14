import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ReferralSubmissionForm from "@/components/referrals/ReferralSubmissionForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function NewReferralPage() {
  console.log("[NewReferralPage] Loading new referral page...");

  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("[NewReferralPage] Auth error:", authError);
      redirect("/auth/login");
    }

    if (!user) {
      console.log("[NewReferralPage] No user found, redirecting to login");
      redirect("/auth/login");
    }

    console.log("[NewReferralPage] User authenticated:", user.id);

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("[NewReferralPage] Profile error:", profileError);
    }

    if (!profile) {
      console.log("[NewReferralPage] No profile found, redirecting to vetting");
      redirect("/vetting");
    }

    console.log("[NewReferralPage] Profile loaded:", profile.id);

    // Check if user is verified (optional - you may want to allow non-verified users to submit)
    // if (!profile.is_verified) {
    //   redirect("/dashboard?error=not_verified");
    // }

    return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/referrals">
            <Button variant="ghost" className="mb-4 -ml-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Referrals
            </Button>
          </Link>
          <h1 className="text-[36px] font-semibold text-gray-900">Submit a Referral</h1>
          <p className="text-[15px] text-gray-600 mt-2">
            Refer a client to the Proclusive network. Our admin team will review and match the referral with the best-fit member.
          </p>
        </div>

        {/* Form */}
        <ReferralSubmissionForm />
      </div>
    </div>
  );
  } catch (err) {
    console.error("[NewReferralPage] Unexpected error:", err);
    throw err;
  }
}
