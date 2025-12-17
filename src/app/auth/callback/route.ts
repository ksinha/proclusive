import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
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

  if (code) {
    try {
      const supabase = await createClient();
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error("[Auth Callback] Code exchange error:", exchangeError);
        const errorUrl = new URL("/auth/error", requestUrl.origin);
        errorUrl.searchParams.set("error", "exchange_failed");
        errorUrl.searchParams.set("message", exchangeError.message);
        return NextResponse.redirect(errorUrl);
      }
    } catch (err) {
      console.error("[Auth Callback] Unexpected error:", err);
      const errorUrl = new URL("/auth/error", requestUrl.origin);
      errorUrl.searchParams.set("error", "unexpected_error");
      errorUrl.searchParams.set("message", "An unexpected error occurred during confirmation");
      return NextResponse.redirect(errorUrl);
    }
  } else {
    // No code provided - redirect to error page
    const errorUrl = new URL("/auth/error", requestUrl.origin);
    errorUrl.searchParams.set("error", "missing_code");
    errorUrl.searchParams.set("message", "No confirmation code was provided");
    return NextResponse.redirect(errorUrl);
  }

  return NextResponse.redirect(new URL("/vetting", requestUrl.origin));
}
