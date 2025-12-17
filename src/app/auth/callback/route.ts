import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  // Handle Supabase error parameters (sent when email confirmation fails)
  if (error) {
    console.error("[Auth Callback] Supabase error:", error, errorDescription);
    const errorUrl = new URL("/auth/error", requestUrl.origin);
    errorUrl.searchParams.set("error", error);
    if (errorDescription) {
      errorUrl.searchParams.set("message", errorDescription);
    }
    return NextResponse.redirect(errorUrl);
  }

  const supabase = await createClient();

  // Handle token_hash flow (email confirmation without PKCE)
  if (token_hash && type) {
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as "signup" | "email" | "recovery" | "invite" | "magiclink" | "email_change",
      });

      if (verifyError) {
        console.error("[Auth Callback] Token verification error:", verifyError);
        const errorUrl = new URL("/auth/error", requestUrl.origin);
        errorUrl.searchParams.set("error", "verification_failed");
        errorUrl.searchParams.set("message", verifyError.message);
        return NextResponse.redirect(errorUrl);
      }

      return NextResponse.redirect(new URL("/vetting", requestUrl.origin));
    } catch (err) {
      console.error("[Auth Callback] Token verification unexpected error:", err);
      const errorUrl = new URL("/auth/error", requestUrl.origin);
      errorUrl.searchParams.set("error", "unexpected_error");
      errorUrl.searchParams.set("message", "An unexpected error occurred during confirmation");
      return NextResponse.redirect(errorUrl);
    }
  }

  // Handle code flow (PKCE)
  if (code) {
    try {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error("[Auth Callback] Code exchange error:", exchangeError);
        const errorUrl = new URL("/auth/error", requestUrl.origin);
        errorUrl.searchParams.set("error", "exchange_failed");
        errorUrl.searchParams.set("message", exchangeError.message);
        return NextResponse.redirect(errorUrl);
      }

      return NextResponse.redirect(new URL("/vetting", requestUrl.origin));
    } catch (err) {
      console.error("[Auth Callback] Unexpected error:", err);
      const errorUrl = new URL("/auth/error", requestUrl.origin);
      errorUrl.searchParams.set("error", "unexpected_error");
      errorUrl.searchParams.set("message", "An unexpected error occurred during confirmation");
      return NextResponse.redirect(errorUrl);
    }
  }

  // No valid auth parameters provided
  const errorUrl = new URL("/auth/error", requestUrl.origin);
  errorUrl.searchParams.set("error", "missing_code");
  errorUrl.searchParams.set("message", "No confirmation code was provided");
  return NextResponse.redirect(errorUrl);
}
