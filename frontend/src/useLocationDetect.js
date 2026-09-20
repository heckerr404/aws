/**
 * useLocationDetect.js — GPS Auto-Detect & Reverse Geocoding Hook
 *
 * Provides:
 *  1. Native Geolocation (navigator.geolocation.getCurrentPosition) with fast timeout (8s)
 *  2. OpenStreetMap Nominatim reverse geocoding to extract Indian State/UT & District
 *  3. Fuzzy / alias matching to auto-select State in the Haqdaar eligibility profile
 *  4. In-flight debounce, permission/timeout error handling, and auto-filled hint state
 *
 * NOTE: navigator.geolocation requires HTTPS or localhost; on plain HTTP it will silently fail.
 */

import { useState, useRef, useCallback } from "react";
import { INDIAN_STATES } from "./demoProfiles";

/**
 * State aliases and variations map for robust matching
 */
const STATE_ALIASES = {
  tn: ["tamil nadu", "tamilnadu", "state of tamil nadu"],
  ka: ["karnataka", "mysore"],
  kl: ["kerala"],
  ap: ["andhra pradesh", "andhra"],
  ts: ["telangana", "telengana"],
  mh: ["maharashtra"],
  gj: ["gujarat"],
  rj: ["rajasthan"],
  up: ["uttar pradesh"],
  uk: ["uttarakhand", "uttaranchal"],
  mp: ["madhya pradesh"],
  br: ["bihar"],
  wb: ["west bengal", "bengal", "paschim banga"],
  od: ["odisha", "orissa"],
  pb: ["punjab"],
  hr: ["haryana"],
  cg: ["chhattisgarh", "chattisgarh"],
  jh: ["jharkhand"],
  as: ["assam"],
  hp: ["himachal pradesh", "himachal"],
  ga: ["goa"],
  tr: ["tripura"],
  ml: ["meghalaya"],
  mn: ["manipur"],
  mz: ["mizoram"],
  nl: ["nagaland"],
  ar: ["arunachal pradesh", "arunachal"],
  sk: ["sikkim"],
  dl: ["delhi", "national capital territory of delhi", "nct of delhi", "new delhi"],
  jk: ["jammu and kashmir", "jammu & kashmir", "jammu", "kashmir"],
  la: ["ladakh", "leh"],
  py: ["puducherry", "pondicherry"]
};

/**
 * Normalise string for case-insensitive and punctuation-free matching
 */
function normalizeStr(str) {
  return (str || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Matches a state string (from reverse geocoding) against INDIAN_STATES
 */
export function matchStateFromLocation(rawStateText) {
  if (!rawStateText) return null;
  const clean = normalizeStr(rawStateText);

  // 1. Direct match with aliases
  for (const [code, aliases] of Object.entries(STATE_ALIASES)) {
    if (aliases.some((alias) => clean === alias || clean.includes(alias) || alias.includes(clean))) {
      const stateObj = INDIAN_STATES.find((s) => s.code === code);
      if (stateObj) return stateObj;
    }
  }

  // 2. Direct match with INDIAN_STATES names
  for (const s of INDIAN_STATES) {
    const sNameClean = normalizeStr(s.name);
    if (clean === sNameClean || clean.includes(sNameClean) || sNameClean.includes(clean)) {
      return s;
    }
  }

  return null;
}

export function useLocationDetect() {
  const isSupported = typeof window !== "undefined" && "geolocation" in navigator;

  const [status, setStatus] = useState("idle"); // "idle" | "detecting" | "success" | "error"
  const [errorMessage, setErrorMessage] = useState(null);
  const [detectedInfo, setDetectedInfo] = useState(null); // { stateCode, stateName, district }
  const [showAutoFillHint, setShowAutoFillHint] = useState(false);

  // In-flight debounce guard to avoid hammering Nominatim (>1 req/sec)
  const isRequestInFlight = useRef(false);
  const lastRequestTime = useRef(0);

  const dismissHint = useCallback(() => {
    setShowAutoFillHint(false);
  }, []);

  const detectLocation = useCallback(
    (onSuccess) => {
      if (!isSupported) {
        setStatus("error");
        setErrorMessage("Geolocation is not supported by your browser");
        return;
      }

      const now = Date.now();
      // 1-second debounce
      if (isRequestInFlight.current || now - lastRequestTime.current < 1000) {
        return;
      }

      isRequestInFlight.current = true;
      lastRequestTime.current = now;
      setStatus("detecting");
      setErrorMessage(null);
      setShowAutoFillHint(false);

      const geoOptions = {
        enableHighAccuracy: false, // Low accuracy is fast and sufficient for state detection
        timeout: 8000,             // 8s timeout keeps experience snappy
        maximumAge: 60000          // 1-minute cached position is fine
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const url = `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(
              latitude
            )}&lon=${encodeURIComponent(longitude)}&format=json&zoom=8&addressdetails=1`;

            // OpenStreetMap Nominatim request
            const response = await fetch(url, {
              headers: {
                "Accept-Language": "en"
              }
            });

            if (!response.ok) {
              throw new Error(`Geocoding failed with status: ${response.status}`);
            }

            const data = await response.json();
            const address = data?.address || {};

            const rawState =
              address.state ||
              address.province ||
              address.territory ||
              address.region ||
              address["ISO3166-2-lvl4"];

            const rawDistrict =
              address.state_district ||
              address.county ||
              address.city ||
              address.district ||
              null;

            const matchedState = matchStateFromLocation(rawState);

            if (matchedState) {
              const info = {
                stateCode: matchedState.code,
                stateName: matchedState.name,
                district: rawDistrict
              };

              setDetectedInfo(info);
              setStatus("success");
              setShowAutoFillHint(true);

              if (typeof onSuccess === "function") {
                onSuccess(matchedState.code, matchedState.name, rawDistrict);
              }
            } else {
              // Geocoding returned but state was unrecognized
              setStatus("error");
              setErrorMessage("Couldn't detect — select manually");
            }
          } catch (err) {
            console.warn("Reverse geocoding error:", err);
            setStatus("error");
            setErrorMessage("Couldn't detect — select manually");
          } finally {
            isRequestInFlight.current = false;
          }
        },
        (error) => {
          isRequestInFlight.current = false;
          setStatus("error");

          // Handle all distinct GeolocationPositionError cases
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setErrorMessage("Location permission denied — please select manually");
              break;
            case error.TIMEOUT:
              setErrorMessage("Location detection timed out — please select manually");
              break;
            case error.POSITION_UNAVAILABLE:
            default:
              setErrorMessage("Couldn't detect — select manually");
              break;
          }
        },
        geoOptions
      );
    },
    [isSupported]
  );

  return {
    isSupported,
    status,
    errorMessage,
    detectedInfo,
    showAutoFillHint,
    dismissHint,
    detectLocation
  };
}
