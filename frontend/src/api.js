/**
 * api.js — API client for Haqdaar backend HTTP API
 * Enforces 15s timeout via AbortController, clean error envelopes, and base URL validation.
 * Transparently falls back to local reference evaluator when running offline / locally.
 */
import { evaluateLocalProfile, SCHEMES } from "./mockEngine";

const RAW_BASE = import.meta.env.VITE_API_BASE_URL || "";
export const API_BASE_URL = RAW_BASE.replace(/\/+$/, "");

export function isApiConfigured() {
  return Boolean(API_BASE_URL && API_BASE_URL.trim().length > 0);
}

/**
 * Helper to fetch with timeout and standard error envelope handling.
 */
async function fetchWithTimeout(endpoint, options = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const callerSignal = options.signal;
  
  const abortHandler = () => controller.abort();
  if (callerSignal) {
    callerSignal.addEventListener("abort", abortHandler);
  }

  const timeoutId = setTimeout(() => {
    controller.abort(new Error("Request timed out after 15 seconds"));
  }, timeoutMs);

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorCode = data?.code || `HTTP_${response.status}`;
      const errorMessage = data?.message || "An unexpected error occurred while communicating with the engine.";
      const err = new Error(errorMessage);
      err.code = errorCode;
      err.details = data?.details;
      throw err;
    }

    return data;
  } catch (error) {
    if (error.name === "AbortError" && !callerSignal?.aborted) {
      const err = new Error("The eligibility engine took longer than 15 seconds to respond. Please try again.");
      err.code = "TIMEOUT";
      throw err;
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
    if (callerSignal) {
      callerSignal.removeEventListener("abort", abortHandler);
    }
  }
}

/**
 * Check eligibility for a citizen profile.
 * When schemeId is provided, evaluates only that one scheme (single-scheme mode).
 * When null, evaluates all 50 published schemes (batch mode).
 */
export async function checkEligibility(profile, language = "en", signal = null, schemeId = null) {
  if (!isApiConfigured()) {
    // Standalone local mode: runs exact Cedar reference logic in browser
    return evaluateLocalProfile(profile, language, schemeId);
  }

  return fetchWithTimeout(
    "/check",
    {
      method: "POST",
      body: JSON.stringify({
        profile,
        language,
        explain: true,
        ...(schemeId ? { schemeId } : {})
      }),
      signal
    },
    15000
  );
}

/**
 * List all published schemes and their verified metadata.
 */
export async function listSchemes(signal = null) {
  if (!isApiConfigured()) {
    return { count: SCHEMES.length, schemes: SCHEMES };
  }

  return fetchWithTimeout(
    "/schemes",
    {
      method: "GET",
      signal
    },
    10000
  );
}

/**
 * Health check endpoint.
 */
export async function health(signal = null) {
  if (!isApiConfigured()) {
    return { ok: true, mode: "local-reference-evaluator" };
  }

  return fetchWithTimeout(
    "/health",
    {
      method: "GET",
      signal
    },
    5000
  );
}
