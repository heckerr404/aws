/**
 * useSpeech.js — Centralized hook for Web Speech API (Input & Output)
 * 
 * Provides:
 *  1. SpeechRecognition (Voice Input) with field dictation & dropdown keyword parsing
 *  2. SpeechSynthesis (Voice Output) for reading scheme eligibility receipts aloud
 *  3. Auto-stop on 5s silence, graceful fallbacks for unsupported browsers
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { INDIAN_STATES, SOCIAL_CATEGORIES, OCCUPATIONS } from "./demoProfiles";

// Speech Recognition API detection
const SpeechRecognition =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

// Speech Synthesis API detection
const hasSpeechSynthesis =
  typeof window !== "undefined" && "speechSynthesis" in window;

/**
 * Normalise strings for robust keyword matching
 */
function cleanText(str) {
  return (str || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Keyword matcher for Indian states, social categories, and occupations
 */
export function matchKeywords(transcript) {
  const text = cleanText(transcript);
  const result = {};
  let matchedAny = false;

  // 1. State matching
  for (const s of INDIAN_STATES) {
    const sName = cleanText(s.name);
    const sCode = s.code.toLowerCase();
    if (text.includes(sName) || text.split(" ").includes(sCode)) {
      result.state = s.code;
      matchedAny = true;
      break;
    }
  }

  // 2. Social category matching
  const categoryKeywords = {
    general: ["general", "open", "samanya"],
    obc: ["obc", "other backward", "backward class", "pichhada", "pichhda"],
    sc: ["sc", "scheduled caste", "dalit", "anusuchit jati"],
    st: ["st", "scheduled tribe", "adivasi", "tribal", "anusuchit janjati"],
    ews: ["ews", "economically weaker", "arthik", "garib"],
  };

  for (const [code, words] of Object.entries(categoryKeywords)) {
    if (words.some((w) => text.includes(w))) {
      result.socialCategory = code;
      matchedAny = true;
      break;
    }
  }

  // 3. Occupation matching
  const occupationKeywords = {
    farmer: ["farmer", "agriculture", "farming", "kisan", "krishi", "kheti", "cultivator"],
    artisan: ["artisan", "craftsperson", "craft", "darzi", "lohar", "sonar", "tailor", "blacksmith", "carpenter", "weaver"],
    student: ["student", "study", "studying", "college", "school", "vidyarthi", "chhatra"],
    salaried: ["salaried", "private", "corporate", "job", "naukri", "company employee"],
    self_employed: ["self employed", "business", "shop", "trader", "vyapar", "dukaan", "dukan"],
    unemployed: ["unemployed", "homemaker", "berojgar", "housewife"],
    other: ["other occupation", "any other"],
  };

  for (const [code, words] of Object.entries(occupationKeywords)) {
    if (words.some((w) => text.includes(w))) {
      result.occupation = code;
      matchedAny = true;
      break;
    }
  }

  return { result, matchedAny };
}

export function useSpeech() {
  // Voice Input (Recognition) State
  const [speechLang, setSpeechLang] = useState("en-IN");
  const [listeningField, setListeningField] = useState(null); // null | "name" | "address" | "general"
  const [speechStatus, setSpeechStatus] = useState("idle"); // "idle" | "listening" | "processing"
  const [toastMessage, setToastMessage] = useState(null);

  // Voice Output (Synthesis) State
  const [speakingSchemeId, setSpeakingSchemeId] = useState(null);

  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const toastTimerRef = useRef(null);

  // Show a temporary toast message
  const showToast = useCallback((msg) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 3500);
  }, []);

  // Clear silence auto-stop timer
  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  // Reset recognition instance
  const stopListening = useCallback(() => {
    clearSilenceTimer();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setListeningField(null);
    setSpeechStatus("idle");
  }, [clearSilenceTimer]);

  // Start listening for a specific field or general voice fill
  const startListening = useCallback(
    (field, onResultCallback) => {
      if (!SpeechRecognition) {
        showToast("Speech recognition is not supported in this browser.");
        return;
      }

      // If already listening on this field, toggle it off
      if (listeningField === field) {
        stopListening();
        return;
      }

      // Stop any existing instance
      stopListening();

      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.lang = speechLang;
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        setListeningField(field);
        setSpeechStatus("listening");

        // 5-second silence auto-stop timer
        clearSilenceTimer();
        silenceTimerRef.current = setTimeout(() => {
          stopListening();
        }, 5000);

        recognition.onspeechstart = () => {
          clearSilenceTimer();
          // Reset another 5-second timer from speech start
          silenceTimerRef.current = setTimeout(() => {
            stopListening();
          }, 5000);
        };

        recognition.onspeechend = () => {
          setSpeechStatus("processing");
          clearSilenceTimer();
        };

        recognition.onresult = (event) => {
          clearSilenceTimer();
          const transcript =
            event.results && event.results[0] && event.results[0][0]
              ? event.results[0][0].transcript.trim()
              : "";

          if (transcript && onResultCallback) {
            onResultCallback(transcript);
          }
          stopListening();
        };

        recognition.onerror = (event) => {
          clearSilenceTimer();
          // Don't show toast on user abort
          if (event.error !== "no-speech" && event.error !== "aborted") {
            showToast(
              speechLang === "hi-IN"
                ? "आवाज़ पहचानी नहीं गई। कृपया दोबारा प्रयास करें।"
                : "Didn't catch that — please try again."
            );
          }
          stopListening();
        };

        recognition.onend = () => {
          clearSilenceTimer();
          setListeningField(null);
          setSpeechStatus("idle");
        };

        recognition.start();
      } catch (err) {
        clearSilenceTimer();
        setListeningField(null);
        setSpeechStatus("idle");
      }
    },
    [SpeechRecognition, listeningField, speechLang, stopListening, showToast, clearSilenceTimer]
  );

  // ----------------------------------------------------------------
  // Speech Synthesis (Read Aloud)
  // ----------------------------------------------------------------
  const stopSpeaking = useCallback(() => {
    if (hasSpeechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeakingSchemeId(null);
  }, []);

  const speakText = useCallback(
    (schemeId, text) => {
      if (!hasSpeechSynthesis) {
        showToast("Speech synthesis is not supported in this browser.");
        return;
      }

      // If already speaking this scheme, clicking stops it
      if (speakingSchemeId === schemeId) {
        stopSpeaking();
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const cleanSpokenText = text
        .replace(/[*_#`§]/g, "")
        .replace(/\s+/g, " ")
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanSpokenText);
      utterance.lang = speechLang;
      utterance.rate = 0.95; // Slightly measured rate for legal clarity

      setSpeakingSchemeId(schemeId);

      utterance.onend = () => {
        setSpeakingSchemeId(null);
      };

      utterance.onerror = () => {
        setSpeakingSchemeId(null);
      };

      window.speechSynthesis.speak(utterance);
    },
    [speakingSchemeId, speechLang, stopSpeaking, showToast]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearSilenceTimer();
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      if (hasSpeechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [clearSilenceTimer]);

  return {
    isRecognitionSupported: !!SpeechRecognition,
    isSynthesisSupported: hasSpeechSynthesis,
    speechLang,
    setSpeechLang,
    listeningField,
    speechStatus,
    toastMessage,
    showToast,
    startListening,
    stopListening,
    speakingSchemeId,
    speakText,
    stopSpeaking,
  };
}
