import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Retry helper for transient network failures
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err as Error;
      console.warn(`[Auth Callback] Attempt ${attempt}/${maxRetries} failed:`, err);
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }
  }
  throw lastError;
}

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

  // Handle token_hash flow (email confirmation without PKCE)
  if (token_hash && type) {
    try {
      const result = await withRetry(async () => {
        const supabase = await createClient();
        return supabase.auth.verifyOtp({
          token_hash,
          type: type as "signup" | "email" | "recovery" | "invite" | "magiclink" | "email_change",
        });
      });

      if (result.error) {
        console.error("[Auth Callback] Token verification error:", result.error);
        const errorUrl = new URL("/auth/error", requestUrl.origin);
        errorUrl.searchParams.set("error", "verification_failed");
        errorUrl.searchParams.set("message", result.error.message);
        return NextResponse.redirect(errorUrl);
      }

      return NextResponse.redirect(new URL("/vetting", requestUrl.origin));
    } catch (err) {
      console.error("[Auth Callback] Token verification failed after retries:", err);
      const errorUrl = new URL("/auth/error", requestUrl.origin);
      errorUrl.searchParams.set("error", "network_error");
      errorUrl.searchParams.set("message", "Network error during confirmation. Please try clicking the link again.");
      return NextResponse.redirect(errorUrl);
    }
  }

  // Handle code flow (PKCE)
  if (code) {
    try {
      const result = await withRetry(async () => {
        const supabase = await createClient();
        return supabase.auth.exchangeCodeForSession(code);
      });

      if (result.error) {
        console.error("[Auth Callback] Code exchange error:", result.error);
        const errorUrl = new URL("/auth/error", requestUrl.origin);
        errorUrl.searchParams.set("error", "exchange_failed");
        errorUrl.searchParams.set("message", result.error.message);
        return NextResponse.redirect(errorUrl);
      }

      return NextResponse.redirect(new URL("/vetting", requestUrl.origin));
    } catch (err) {
      console.error("[Auth Callback] Code exchange failed after retries:", err);
      const errorUrl = new URL("/auth/error", requestUrl.origin);
      errorUrl.searchParams.set("error", "network_error");
      errorUrl.searchParams.set("message", "Network error during confirmation. Please try clicking the link again.");
      return NextResponse.redirect(errorUrl);
    }
  }

  // No valid auth parameters provided
  const errorUrl = new URL("/auth/error", requestUrl.origin);
  errorUrl.searchParams.set("error", "missing_code");
  errorUrl.searchParams.set("message", "No confirmation code was provided");
  return NextResponse.redirect(errorUrl);
}
