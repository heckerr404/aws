/**
 * FaceVerify.jsx
 *
 * On-device Biometric Liveness Verification for Haqdaar:
 *  - 100% on-device processing via @mediapipe/tasks-vision FaceLandmarker
 *  - Circular mirrored video viewport with dynamic SVG progress ring
 *  - Inside-the-circle geometric bounds, brightness, and roll validation
 *  - 2 random challenges (blink, turn left/right, open mouth) with baseline
 *  - Live debug overlay (?debug=1) showing complete system telemetry
 *  - Zero data leaves the browser (no external network transmission)
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import { FilesetResolver, FaceLandmarker } from "@mediapipe/tasks-vision";
import { translations } from "../i18n";
import { useAuth } from "./AuthContext";

/* ------------------------------------------------------------------ */
/* Constants & Helpers                                                 */
/* ------------------------------------------------------------------ */
const CIRCUMFERENCE = 2 * Math.PI * 158; // Radius 158px (~992.74)
const CHALLENGE_POOL = ["blink", "open_mouth", "turn_left", "turn_right"];

// Mirrored camera coordinates:
// Nose = 1, Subject Right Cheek = 234 (camera low x), Subject Left Cheek = 454 (camera high x)
// Head turns left -> nose moves to camera right (high x) -> r >= 0.66
// Head turns right -> nose moves to camera left (low x) -> r <= 0.34
const TURN_THRESHOLDS = {
  turn_left: (r) => r >= 0.66,
  turn_right: (r) => r <= 0.34,
};

function pickTwoCryptoChallenges() {
  const arr = [...CHALLENGE_POOL];
  const rand = new Uint32Array(arr.length);
  crypto.getRandomValues(rand);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = rand[i] % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, 2);
}

// Convert video 4:3 normalized (x, y) to central cropped square (sx, sy)
function mapToSquare(pt, vw, vh) {
  if (vw >= vh) {
    const sx = (pt.x * vw - (vw - vh) / 2) / vh;
    const sy = pt.y;
    return { sx, sy };
  } else {
    const sx = pt.x;
    const sy = (pt.y * vh - (vh - vw) / 2) / vw;
    return { sx, sy };
  }
}

export default function FaceVerify({ onPass, onCancel, onSkip, lang }) {
  const { markFaceVerified } = useAuth();
  const currentLang = lang || document.documentElement.lang || "en";
  const t = translations[currentLang] || translations.en;
  const allowSkip = import.meta.env.VITE_ALLOW_FACE_SKIP !== "false";

  // Check ?debug=1
  const isDebug =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("debug") === "1";

  // DOM Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const sampleCanvasRef = useRef(null);

  // Engine Refs
  const streamRef = useRef(null);
  const landmarkerRef = useRef(null);
  const rafRef = useRef(null);
  const isMountedRef = useRef(true);
  const hiddenTimeoutRef = useRef(null);

  // Challenge & State Machine Refs
  const stateRef = useRef("starting"); // starting | aligning | challenging | verified | fail | error
  const challengesRef = useRef([]);
  const challengeIdxRef = useRef(0);
  const alignStartRef = useRef(null);
  const baselineStartRef = useRef(null);
  const challengeStartRef = useRef(null);
  const attemptStartRef = useRef(null);
  const prevCenterRef = useRef(null);
  const subStepRef = useRef(0); // For blink / mouth stages

  // React States for UI
  const [uiState, setUiState] = useState("starting");
  const [instructionKey, setInstructionKey] = useState("facePlaceInside");
  const [currentChallengeName, setCurrentChallengeName] = useState("");
  const [ringColor, setRingColor] = useState("#9ca3af"); // grey
  const [ringProgress, setRingProgress] = useState(0.05);
  const [errorMessage, setErrorMessage] = useState("");
  const [failedCount, setFailedCount] = useState(0);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  // Live Debug Overlay State
  const [debugData, setDebugData] = useState({
    isSecureContext: typeof window !== "undefined" ? !!window.isSecureContext : false,
    hasGetUserMedia: typeof navigator !== "undefined" ? !!navigator.mediaDevices?.getUserMedia : false,
    permission: "unknown",
    streamActive: false,
    trackCount: 0,
    readyState: 0,
    videoW: 0,
    videoH: 0,
    paused: true,
    modelLoaded: false,
    modelUrl: "/mediapipe/face_landmarker.task (HTTP 200)",
    fps: 0,
    facesFound: 0,
    blinkL: 0,
    blinkR: 0,
    jawOpen: 0,
    yawRatio: 0.5,
    rollDeg: 0,
    brightness: 120,
    stateName: "starting",
  });

  const fpsRef = useRef({ frames: 0, lastTime: performance.now(), fps: 0 });

  const logDebug = useCallback((state, details) => {
    if (isDebug) {
      console.log(`[face] ${state}`, details);
    }
  }, [isDebug]);

  // Clean stop for all camera tracks
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {}
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    logDebug("camera_stopped", { active: false });
  }, [logDebug]);

  // Simulate a verified pass (demo mode / no camera)
  const handleSimulatePass = useCallback(() => {
    stopCamera();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    stateRef.current = "verified";
    setUiState("verified");
    setRingColor("#22c55e");
    setRingProgress(1);
    markFaceVerified();
    setTimeout(() => {
      onPass?.();
    }, 1000);
  }, [markFaceVerified, onPass, stopCamera]);

  // Fail current attempt
  const triggerFail = useCallback(
    (reasonKey) => {
      stopCamera();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      stateRef.current = "fail";
      setUiState("fail");
      setRingColor("#ef4444"); // red
      setRingProgress(1);
      const msg = t[reasonKey] || t.faceErrTimeout;
      setErrorMessage(msg);
      logDebug("failed", { reason: reasonKey, msg });

      setFailedCount((prev) => {
        const next = prev + 1;
        if (next >= 3) {
          setCooldownRemaining(60);
        }
        return next;
      });
    },
    [stopCamera, t, logDebug]
  );

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const timer = setInterval(() => {
      setCooldownRemaining((c) => {
        if (c <= 1) {
          clearInterval(timer);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  // Handle visibility change: stop tracks if tab hidden > 10s
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        hiddenTimeoutRef.current = setTimeout(() => {
          if (stateRef.current === "aligning" || stateRef.current === "challenging") {
            triggerFail("faceErrTimeout");
          } else {
            stopCamera();
          }
        }, 10000);
      } else {
        if (hiddenTimeoutRef.current) {
          clearTimeout(hiddenTimeoutRef.current);
          hiddenTimeoutRef.current = null;
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      if (hiddenTimeoutRef.current) clearTimeout(hiddenTimeoutRef.current);
    };
  }, [triggerFail, stopCamera]);

  /* ------------------------------------------------------------------ */
  /* Main Camera & Detection Initialization                            */
  /* ------------------------------------------------------------------ */
  const startVerification = useCallback(async () => {
    if (cooldownRemaining > 0) return;

    // Clear previous canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    // Reset attempt states
    setUiState("starting");
    stateRef.current = "starting";
    setRingColor("#9ca3af");
    setRingProgress(0.05);
    setInstructionKey("facePlaceInside");
    setErrorMessage("");
    alignStartRef.current = null;
    baselineStartRef.current = null;
    challengeStartRef.current = null;
    attemptStartRef.current = null;
    prevCenterRef.current = null;
    subStepRef.current = 0;

    const chosenChallenges = pickTwoCryptoChallenges();
    challengesRef.current = chosenChallenges;
    challengeIdxRef.current = 0;
    setCurrentChallengeName(chosenChallenges[0]);
    logDebug("challenges_picked", chosenChallenges);

    // 1. Check secure context
    const isLocalhost =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname === "::1");

    if (!window.isSecureContext && !isLocalhost) {
      setUiState("error");
      stateRef.current = "error";
      setErrorMessage(t.faceErrInsecure || "Camera requires a secure context (HTTPS or localhost).");
      logDebug("error", "Not secure context");
      return;
    }

    // 2. Load Model if not already loaded
    try {
      if (!landmarkerRef.current) {
        logDebug("model_loading", "/mediapipe/wasm & /mediapipe/face_landmarker.task");
        const vision = await FilesetResolver.forVisionTasks("/mediapipe/wasm");
        let landmarker;
        try {
          landmarker = await FaceLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: "/mediapipe/face_landmarker.task",
              delegate: "GPU",
            },
            runningMode: "VIDEO",
            outputFaceBlendshapes: true,
            numFaces: 2,
          });
          logDebug("model_loaded", "GPU delegate active");
        } catch (gpuErr) {
          logDebug("gpu_delegate_fallback", gpuErr.message);
          landmarker = await FaceLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: "/mediapipe/face_landmarker.task",
              delegate: "CPU",
            },
            runningMode: "VIDEO",
            outputFaceBlendshapes: true,
            numFaces: 2,
          });
          logDebug("model_loaded", "CPU delegate active");
        }
        landmarkerRef.current = landmarker;
        setDebugData((prev) => ({ ...prev, modelLoaded: true }));
      }
    } catch (err) {
      logDebug("model_error", err);
      setUiState("error");
      stateRef.current = "error";
      setErrorMessage(t.faceErrModel || "Face model failed to load.");
      return;
    }

    // 3. Acquire camera stream
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("No mediaDevices support in this browser context.");
      }

      logDebug("requesting_camera", "user facingMode 640x480");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      if (!isMountedRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      streamRef.current = stream;
      setDebugData((prev) => ({
        ...prev,
        permission: "granted",
        streamActive: stream.active,
        trackCount: stream.getVideoTracks().length,
      }));

      const video = videoRef.current;
      if (!video) {
        throw new Error("Video ref missing in DOM");
      }

      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;

      try {
        await video.play();
      } catch (playErr) {
        logDebug("video_play_warn", playErr.message);
      }

      // Wait until video has valid dimensions
      if (video.videoWidth === 0) {
        await new Promise((resolve) => {
          video.onloadedmetadata = () => resolve();
        });
      }

      logDebug("camera_ready", {
        width: video.videoWidth,
        height: video.videoHeight,
      });

      stateRef.current = "aligning";
      setUiState("aligning");
      setRingColor("#f59e0b"); // amber
    } catch (err) {
      logDebug("camera_error", err.name + ": " + err.message);
      setUiState("error");
      stateRef.current = "error";
      setRingColor("#ef4444");

      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setErrorMessage(t.faceErrPermission);
        setDebugData((p) => ({ ...p, permission: "denied" }));
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setErrorMessage(t.faceErrNoCamera);
        setDebugData((p) => ({ ...p, permission: "no_camera" }));
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        setErrorMessage(t.faceErrInUse);
        setDebugData((p) => ({ ...p, permission: "in_use" }));
      } else {
        setErrorMessage(err.message || t.faceErrPermission);
        setDebugData((p) => ({ ...p, permission: err.name }));
      }
    }
  }, [cooldownRemaining, logDebug, t]);

  // Trigger on mount
  useEffect(() => {
    isMountedRef.current = true;
    startVerification();

    return () => {
      isMountedRef.current = false;
      stopCamera();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (landmarkerRef.current) {
        try {
          landmarkerRef.current.close();
        } catch (e) {}
        landmarkerRef.current = null;
      }
    };
  }, [startVerification, stopCamera]);

  /* ------------------------------------------------------------------ */
  /* Detection & Challenge Loop                                         */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    // Initialize 64x48 offscreen canvas for brightness check
    if (!sampleCanvasRef.current) {
      const off = document.createElement("canvas");
      off.width = 64;
      off.height = 48;
      sampleCanvasRef.current = off;
    }
    const sampleCtx = sampleCanvasRef.current.getContext("2d");

    let isRunning = true;

    function renderLoop() {
      if (!isRunning) return;

      const landmarker = landmarkerRef.current;
      const currentState = stateRef.current;

      if (
        !landmarker ||
        !video ||
        video.readyState < 2 ||
        video.videoWidth === 0 ||
        (currentState !== "aligning" && currentState !== "challenging")
      ) {
        rafRef.current = requestAnimationFrame(renderLoop);
        return;
      }

      const now = performance.now();

      // FPS tracking
      fpsRef.current.frames++;
      if (now - fpsRef.current.lastTime >= 1000) {
        fpsRef.current.fps = fpsRef.current.frames;
        fpsRef.current.frames = 0;
        fpsRef.current.lastTime = now;
      }

      // 1. Brightness check using 64x48 sample
      let avgBrightness = 120;
      if (sampleCtx) {
        sampleCtx.drawImage(video, 0, 0, 64, 48);
        const imgData = sampleCtx.getImageData(0, 0, 64, 48).data;
        let lumTotal = 0;
        for (let i = 0; i < imgData.length; i += 4) {
          lumTotal += 0.299 * imgData[i] + 0.587 * imgData[i + 1] + 0.114 * imgData[i + 2];
        }
        avgBrightness = lumTotal / (64 * 48);
      }

      // 2. Run Face Landmarker
      const result = landmarker.detectForVideo(video, now);
      const faces = result?.faceLandmarks || [];
      const blendshapes = result?.faceBlendshapes?.[0]?.categories || [];

      // Extract blendshape scores
      let blinkL = 0;
      let blinkR = 0;
      let jawOpen = 0;
      for (const b of blendshapes) {
        if (b.categoryName === "eyeBlinkLeft") blinkL = b.score;
        else if (b.categoryName === "eyeBlinkRight") blinkR = b.score;
        else if (b.categoryName === "jawOpen") jawOpen = b.score;
      }

      // Clear debug canvas
      if (ctx && canvas) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      // Handle zero faces
      if (faces.length === 0) {
        alignStartRef.current = null;
        setInstructionKey("facePlaceInside");
        setRingColor("#9ca3af");
        setRingProgress(0.08);

        setDebugData((p) => ({
          ...p,
          fps: fpsRef.current.fps,
          facesFound: 0,
          stateName: stateRef.current,
          brightness: Math.round(avgBrightness),
          videoW: video.videoWidth,
          videoH: video.videoHeight,
        }));

        rafRef.current = requestAnimationFrame(renderLoop);
        return;
      }

      // Handle multiple faces
      if (faces.length > 1) {
        alignStartRef.current = null;
        setInstructionKey("faceOnlyOne");
        setRingColor("#f59e0b");

        // Fail attempt if 2 persons detected during an active challenge
        if (currentState === "challenging") {
          triggerFail("faceOnlyOne");
          return;
        }

        rafRef.current = requestAnimationFrame(renderLoop);
        return;
      }

      // Single face detected: process landmarks
      const landmarks = faces[0];
      const vw = video.videoWidth;
      const vh = video.videoHeight;

      // Draw debug landmarks if ?debug=1
      if (isDebug && ctx) {
        ctx.fillStyle = "#A8D82B";
        for (let i = 0; i < landmarks.length; i += 8) {
          const pt = landmarks[i];
          ctx.beginPath();
          ctx.arc(pt.x * canvas.width, pt.y * canvas.height, 2, 0, 2 * Math.PI);
          ctx.fill();
        }
      }

      // Inside circle mapping: (sx, sy)
      let minSx = Infinity,
        maxSx = -Infinity,
        minSy = Infinity,
        maxSy = -Infinity;
      for (const pt of landmarks) {
        const { sx, sy } = mapToSquare(pt, vw, vh);
        if (sx < minSx) minSx = sx;
        if (sx > maxSx) maxSx = sx;
        if (sy < minSy) minSy = sy;
        if (sy > maxSy) maxSy = sy;
      }

      const cx = (minSx + maxSx) / 2;
      const cy = (minSy + maxSy) / 2;
      const faceW = maxSx - minSx;
      const distFromCenter = Math.hypot(cx - 0.5, cy - 0.5);

      // Roll check using landmarks 33 and 263
      const p33 = landmarks[33];
      const p263 = landmarks[263];
      const dx = (p263.x - p33.x) * vw;
      const dy = (p263.y - p33.y) * vh;
      const rollDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
      const isRollOk = Math.abs(rollDeg) <= 15;

      // Yaw ratio using landmarks 1 (nose), 234 (cheekA), 454 (cheekB)
      const noseX = landmarks[1].x;
      const cheekAX = landmarks[234].x;
      const cheekBX = landmarks[454].x;
      const yawRatio =
        Math.abs(cheekBX - cheekAX) > 0.001
          ? (noseX - cheekAX) / (cheekBX - cheekAX)
          : 0.5;

      // Sudden jump check (> 25% of frame between consecutive frames during challenge)
      if (currentState === "challenging" && prevCenterRef.current) {
        const jump = Math.hypot(
          cx - prevCenterRef.current.x,
          cy - prevCenterRef.current.y
        );
        if (jump > 0.25) {
          triggerFail("faceErrMovement");
          return;
        }
      }
      prevCenterRef.current = { x: cx, y: cy };

      // Update Debug Telemetry
      setDebugData({
        isSecureContext: window.isSecureContext,
        hasGetUserMedia: !!navigator.mediaDevices?.getUserMedia,
        permission: "granted",
        streamActive: !!streamRef.current?.active,
        trackCount: streamRef.current?.getVideoTracks().length || 0,
        readyState: video.readyState,
        videoW: vw,
        videoH: vh,
        paused: video.paused,
        modelLoaded: true,
        modelUrl: "/mediapipe/face_landmarker.task (HTTP 200)",
        fps: fpsRef.current.fps,
        facesFound: faces.length,
        blinkL: Number(blinkL.toFixed(2)),
        blinkR: Number(blinkR.toFixed(2)),
        jawOpen: Number(jawOpen.toFixed(2)),
        yawRatio: Number(yawRatio.toFixed(2)),
        rollDeg: Math.round(rollDeg),
        brightness: Math.round(avgBrightness),
        stateName: stateRef.current,
      });

      // Spatial and illumination constraints
      const isBrightnessOk = avgBrightness >= 55 && avgBrightness <= 210;
      const isPositionOk = distFromCenter <= 0.18;
      const isSizeOk = faceW >= 0.4 && faceW <= 0.8;

      /* -------------------------------------------------------------- */
      /* PHASE 1: ALIGNMENT (Hold inside circle for 700ms)              */
      /* -------------------------------------------------------------- */
      if (currentState === "aligning") {
        if (!isBrightnessOk) {
          alignStartRef.current = null;
          setInstructionKey("faceBetterLight");
          setRingColor("#f59e0b");
          setRingProgress(0.1);
        } else if (!isPositionOk) {
          alignStartRef.current = null;
          setInstructionKey("facePlaceInside");
          setRingColor("#f59e0b");
          setRingProgress(0.12);
        } else if (faceW < 0.4) {
          alignStartRef.current = null;
          setInstructionKey("faceMoveCloser");
          setRingColor("#f59e0b");
          setRingProgress(0.15);
        } else if (faceW > 0.8) {
          alignStartRef.current = null;
          setInstructionKey("faceMoveBack");
          setRingColor("#f59e0b");
          setRingProgress(0.15);
        } else if (!isRollOk) {
          alignStartRef.current = null;
          setInstructionKey("faceHoldStill");
          setRingColor("#f59e0b");
          setRingProgress(0.18);
        } else {
          // Inside circle criteria met!
          if (!alignStartRef.current) {
            alignStartRef.current = now;
            logDebug("aligning_started", { cx, cy, faceW });
          }
          const elapsedAlign = now - alignStartRef.current;
          const alignRatio = Math.min(1, elapsedAlign / 700);
          setRingProgress(0.2 * alignRatio);
          setRingColor("#f59e0b"); // amber while aligning
          setInstructionKey("faceHoldStill");

          if (elapsedAlign >= 700) {
            // Alignment passed! Transition to Challenge 1
            logDebug("alignment_complete", "Starting challenges");
            stateRef.current = "challenging";
            setUiState("challenging");
            setRingColor("#84cc16"); // lime
            challengeIdxRef.current = 0;
            const ch = challengesRef.current[0];
            setCurrentChallengeName(ch);
            attemptStartRef.current = now; // Give 25s total for challenges
            baselineStartRef.current = now;
            challengeStartRef.current = null;
            subStepRef.current = 0;
          }
        }
      }

      /* -------------------------------------------------------------- */
      /* PHASE 2: LIVENESS CHALLENGES (2 challenges with baseline)     */
      /* -------------------------------------------------------------- */
      else if (currentState === "challenging") {
        const cIdx = challengeIdxRef.current;
        const activeChallenge = challengesRef.current[cIdx];

        // Total attempt timeout: 25 seconds for the challenges
        if (attemptStartRef.current && now - attemptStartRef.current > 25000) {
          triggerFail("faceErrTimeout");
          return;
        }

        // If face drops out of view during challenge, fail attempt
        if (distFromCenter > 0.35 || faceW < 0.25) {
          triggerFail("faceErrMovement");
          return;
        }

        // Sub-phase A: Neutral baseline (face aligned & still for 400ms)
        if (!challengeStartRef.current) {
          setInstructionKey("faceHoldStill");

          // Ensure face is inside circle and reasonably still
          const isStill = distFromCenter <= 0.22 && isRollOk;
          if (!isStill) {
            baselineStartRef.current = now;
          } else {
            const baselineElapsed = now - (baselineStartRef.current || now);
            if (baselineElapsed >= 400) {
              // Baseline satisfied! Start challenge execution
              challengeStartRef.current = now;
              subStepRef.current = 0;
              logDebug("challenge_started", {
                challenge: activeChallenge,
                index: cIdx,
              });
            }
          }
          rafRef.current = requestAnimationFrame(renderLoop);
          return;
        }

        // Sub-phase B: Active Challenge Evaluation (7s timeout)
        const challengeElapsed = now - challengeStartRef.current;
        if (challengeElapsed > 7000) {
          triggerFail("faceErrTimeout");
          return;
        }

        // Calculate progress ring animation
        const baseRingProgress = cIdx === 0 ? 0.2 : 0.6;
        let challengeSubProgress = 0;
        let challengePassed = false;

        if (activeChallenge === "blink") {
          setInstructionKey("faceBlinkSlowly");
          if (subStepRef.current === 0) {
            // Waiting for blink (eyes closing/closed)
            if ((blinkL > 0.48 && blinkR > 0.48) || blinkL > 0.55 || blinkR > 0.55) {
              subStepRef.current = 1;
              logDebug("blink_closed", { blinkL, blinkR });
            }
            challengeSubProgress = 0.4;
          } else if (subStepRef.current === 1) {
            // Eyes reopened
            if (blinkL < 0.35 && blinkR < 0.35) {
              challengePassed = true;
              logDebug("blink_complete", { blinkL, blinkR });
            }
            challengeSubProgress = 0.9;
          }
        } else if (activeChallenge === "open_mouth") {
          setInstructionKey("faceOpenMouth");
          if (subStepRef.current === 0) {
            // Waiting for mouth to open
            if (jawOpen > 0.45) {
              subStepRef.current = 1;
              logDebug("mouth_opened", { jawOpen });
            }
            challengeSubProgress = 0.5;
          } else if (subStepRef.current === 1) {
            // Mouth closed again
            if (jawOpen < 0.25) {
              challengePassed = true;
              logDebug("mouth_closed", { jawOpen });
            }
            challengeSubProgress = 0.9;
          }
        } else if (activeChallenge === "turn_left" || activeChallenge === "turn_right") {
          setInstructionKey(
            activeChallenge === "turn_left" ? "faceTurnLeft" : "faceTurnRight"
          );
          const isTurned = TURN_THRESHOLDS[activeChallenge](yawRatio);
          if (isTurned) {
            challengePassed = true;
            logDebug("turn_complete", { activeChallenge, yawRatio });
            challengeSubProgress = 1.0;
          } else {
            challengeSubProgress = 0.3;
          }
        }

        setRingColor("#84cc16"); // lime while challenging
        setRingProgress(baseRingProgress + 0.4 * challengeSubProgress);

        // Challenge Completion Handler
        if (challengePassed) {
          logDebug("challenge_passed", { challenge: activeChallenge, index: cIdx });
          if (cIdx === 0) {
            // Move to second challenge
            challengeIdxRef.current = 1;
            const nextCh = challengesRef.current[1];
            setCurrentChallengeName(nextCh);
            baselineStartRef.current = now;
            challengeStartRef.current = null;
            subStepRef.current = 0;
            setRingProgress(0.6);
          } else {
            /* -------------------------------------------------------------- */
            /* PHASE 3: VERIFIED SUCCESS                                      */
            /* -------------------------------------------------------------- */
            stateRef.current = "verified";
            setUiState("verified");
            setRingColor("#16a34a"); // solid green
            setRingProgress(1);
            setInstructionKey("faceVerified");
            logDebug("verified_success", "All challenges passed");

            // Hold success screen for 1 second, stop camera, then call onPass
            setTimeout(() => {
              stopCamera();
              markFaceVerified();
              onPass?.();
            }, 1000);
            return;
          }
        }
      }

      rafRef.current = requestAnimationFrame(renderLoop);
    }

    rafRef.current = requestAnimationFrame(renderLoop);

    return () => {
      isRunning = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isDebug, logDebug, markFaceVerified, onPass, triggerFail, stopCamera]);

  /* ------------------------------------------------------------------ */
  /* Render UI                                                          */
  /* ------------------------------------------------------------------ */
  const strokeOffset = CIRCUMFERENCE * (1 - Math.min(1, Math.max(0, ringProgress)));

  return (
    <div className="face-modal-backdrop" role="dialog" aria-modal="true">
      {/* Debug Telemetry Overlay (?debug=1) - Fixed top-left floating so it NEVER covers modal */}
      {isDebug && (
        <div className="face-debug-overlay">
          <div><strong>[DEBUG OVERLAY]</strong></div>
          <div>secureCtx: {debugData.isSecureContext ? "yes" : "NO"} | getUserMedia: {debugData.hasGetUserMedia ? "yes" : "NO"}</div>
          <div>camPerm: {debugData.permission} | streamActive: {debugData.streamActive ? "yes" : "no"} (tracks: {debugData.trackCount})</div>
          <div>video: ready:{debugData.readyState} ({debugData.videoW}x{debugData.videoH}) paused:{debugData.paused ? "yes" : "no"}</div>
          <div>model: {debugData.modelLoaded ? "Loaded" : "Loading"} | {debugData.modelUrl}</div>
          <div>fps: {debugData.fps} | faces: {debugData.facesFound} | state: {debugData.stateName}</div>
          <div>blink: L:{debugData.blinkL} R:{debugData.blinkR} | jawOpen: {debugData.jawOpen}</div>
          <div>yaw: {debugData.yawRatio} | roll: {debugData.rollDeg}° | bright: {debugData.brightness}</div>
        </div>
      )}

      <div className="face-verify-card">
        <h2 className="face-title">{t.faceModalTitle || "Face Liveness Check"}</h2>
        <p className="face-subtitle">{t.faceModalSubtitle || "On-device biometric verification"}</p>

        {/* Camera Privacy Disclaimer */}
        <p className="face-privacy-banner">{t.faceCameraPrivacy}</p>

        {/* Streaming indicator */}
        {streamRef.current?.active && (
          <div className="face-camera-status-row">
            <span className="face-camera-dot" />
            <span>{t.faceCameraOn}</span>
          </div>
        )}

        {/* Circular Camera Preview & Animated SVG Ring */}
        <div className="face-circle-container">
          <svg className="face-svg-ring" viewBox="0 0 340 340">
            <circle
              className="face-svg-ring-bg"
              cx="170"
              cy="170"
              r="158"
            />
            <circle
              className="face-svg-ring-circle"
              cx="170"
              cy="170"
              r="158"
              stroke={ringColor}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeOffset}
            />
          </svg>

          {/* Video element is unconditionally mounted in DOM before getUserMedia resolves */}
          <div className="face-video-circle">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
            />
            <canvas ref={canvasRef} />

            {/* Success Overlay Checkmark */}
            {uiState === "verified" && (
              <div className="face-pass-overlay">
                <span className="face-pass-icon">✅</span>
                <p>{t.faceVerified}</p>
              </div>
            )}
          </div>
        </div>

        {/* Instruction Text */}
        <div
          className="face-instruction-text"
          aria-live="polite"
        >
          {uiState === "fail" || uiState === "error" ? (
            <span style={{ color: "#dc2626" }}>{errorMessage}</span>
          ) : (
            <span>{t[instructionKey] || t.facePlaceInside}</span>
          )}
        </div>

        {/* Challenge Step Counter */}
        {uiState === "challenging" && (
          <div className="face-challenge-badge">
            Challenge {challengeIdxRef.current + 1} of 2
          </div>
        )}

        {/* Failure & Retry / Cooldown Controls */}
        {(uiState === "fail" || uiState === "error") && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%", marginTop: "0.5rem" }}>
            {cooldownRemaining > 0 ? (
              <p className="login-hint" style={{ color: "#dc2626" }}>
                {t.faceErrCooldown.replace("{seconds}", cooldownRemaining)}
              </p>
            ) : (
              <button
                type="button"
                className="btn-pill-black"
                onClick={startVerification}
                style={{ width: "100%" }}
              >
                🔄 {t.faceTryAgain}
              </button>
            )}

            {allowSkip && (
              <>
                <button
                  type="button"
                  className="login-btn-primary"
                  onClick={handleSimulatePass}
                  style={{ fontSize: "0.85rem", padding: "0.5rem 1rem", width: "100%" }}
                >
                  ⚡ Simulate Verified Face (Demo Pass)
                </button>
                <button
                  type="button"
                  className="login-btn-ghost"
                  onClick={onSkip}
                  style={{ fontSize: "0.8rem" }}
                >
                  {t.faceSkipDemo}
                </button>
              </>
            )}
          </div>
        )}

        {/* Quick demo pass option during starting/aligning */}
        {uiState !== "fail" && uiState !== "error" && uiState !== "verified" && (
          <div style={{ marginTop: "0.65rem", width: "100%" }}>
            <button
              type="button"
              className="login-btn-ghost"
              onClick={handleSimulatePass}
              style={{ fontSize: "0.76rem", color: "var(--muted)", textDecoration: "underline" }}
            >
              Demo mode: Click to instantly simulate verified face
            </button>
          </div>
        )}

        {/* Cancel Button */}
        <div className="face-actions" style={{ marginTop: "0.75rem" }}>
          <button
            type="button"
            className="login-btn-ghost"
            onClick={() => {
              stopCamera();
              onCancel ? onCancel() : onSkip?.();
            }}
          >
            {t.faceCancel}
          </button>
        </div>
      </div>
    </div>
  );
}
