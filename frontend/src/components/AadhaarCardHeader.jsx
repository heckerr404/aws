import React from "react";

/**
 * AadhaarTopStripe.jsx
 *
 * Renders the authentic top stripe matching the reference image:
 *  - Saffron/orange band (#FF9933 / #F48B55)
 *  - Thin cream/white gap
 *  - Green band (#138808 / #488463)
 *  - Triangle/zigzag mosaic pattern transition tapering toward the right
 *  - Haqdaar's dark navy scales-of-justice icon in the top-right corner (generic substitute, NO Aadhaar/sun logo)
 */
export function AadhaarTopStripe({ className = "" }) {
  return (
    <div className={`aadhaar-top-stripe-wrapper ${className}`}>
      {/* Stripe SVG with triangle taper */}
      <svg
        className="aadhaar-stripe-svg"
        viewBox="0 0 420 30"
        preserveAspectRatio="xMinYMid meet"
        aria-hidden="true"
      >
        {/* Top Saffron/Orange band */}
        <rect x="0" y="4" width="240" height="7" rx="1" fill="#FF9933" />
        {/* Orange mosaic triangles tapering right */}
        <g fill="#FF9933">
          <polygon points="240,11 243.5,4 247,11" />
          <polygon points="245,4 252,4 248.5,11" />
          <polygon points="250,11 253.5,4 257,11" />
          <polygon points="255,4 262,4 258.5,11" />
          <polygon points="260,11 263.5,4 267,11" />
          <polygon points="265,4 272,4 268.5,11" />
          <polygon points="270,11 273.5,4 277,11" />
          <polygon points="275,4 282,4 278.5,11" />
          <polygon points="280,11 283.5,4 287,11" />
          <polygon points="285,4 292,4 288.5,11" />
          <polygon points="290,11 293.5,4 297,11" />
          <polygon points="295,4 300,4 297.5,11" />
        </g>

        {/* Thin cream gap (4px: y=11 to y=15) */}

        {/* Bottom Green band */}
        <rect x="0" y="15" width="224" height="7" rx="1" fill="#138808" />
        {/* Green mosaic triangles tapering right */}
        <g fill="#138808">
          <polygon points="224,15 231,15 227.5,22" />
          <polygon points="229,22 232.5,15 236,22" />
          <polygon points="234,15 241,15 237.5,22" />
          <polygon points="239,22 242.5,15 246,22" />
          <polygon points="244,15 251,15 247.5,22" />
          <polygon points="249,22 252.5,15 256,22" />
          <polygon points="254,15 261,15 257.5,22" />
          <polygon points="259,22 262.5,15 266,22" />
          <polygon points="264,15 271,15 267.5,22" />
          <polygon points="269,22 272.5,15 276,22" />
          <polygon points="274,15 281,15 277.5,22" />
          <polygon points="279,22 282.5,15 286,22" />
          <polygon points="284,15 289,15 286.5,22" />
        </g>
      </svg>

      {/* Top-Right Logo Area: Haqdaar's dark navy scales-of-justice icon */}
      <div className="aadhaar-corner-logo" title="Haqdaar Sovereign Credential">
        <div className="aadhaar-corner-badge">
          <span className="aadhaar-corner-scales">⚖</span>
        </div>
      </div>
    </div>
  );
}

/**
 * AadhaarDotTexture.jsx
 *
 * Renders an abstract radial circular dot-pattern texture in the bottom-left corner,
 * fading smoothly outward towards the card center/top with low opacity.
 * (Abstract dot/wave matrix, NOT an actual fingerprint graphic).
 */
export function AadhaarDotTexture({ className = "" }) {
  return (
    <div className={`aadhaar-dot-texture-layer ${className}`} aria-hidden="true">
      <svg
        className="aadhaar-dot-svg"
        viewBox="0 0 280 280"
        fill="none"
        preserveAspectRatio="xMinYMax meet"
      >
        <defs>
          <radialGradient id="dotFade" cx="15%" cy="85%" r="75%">
            <stop offset="0%" stopColor="#C49B6E" stopOpacity="0.45" />
            <stop offset="45%" stopColor="#C49B6E" stopOpacity="0.25" />
            <stop offset="75%" stopColor="#C49B6E" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#C49B6E" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="lineFade" cx="15%" cy="85%" r="75%">
            <stop offset="0%" stopColor="#B38758" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#B38758" stopOpacity="0.15" />
            <stop offset="85%" stopColor="#B38758" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Concentric abstract wavy arcs (guilloche lines) */}
        <g stroke="url(#lineFade)" strokeWidth="0.85" strokeDasharray="3 3">
          <circle cx="35" cy="245" r="45" />
          <circle cx="35" cy="245" r="70" />
          <circle cx="35" cy="245" r="95" />
          <circle cx="35" cy="245" r="120" />
          <circle cx="35" cy="245" r="145" />
          <circle cx="35" cy="245" r="170" />
          <circle cx="35" cy="245" r="195" />
          <circle cx="35" cy="245" r="220" />
          <circle cx="35" cy="245" r="245" />
        </g>

        {/* Abstract radial dot rings */}
        <g fill="url(#dotFade)">
          {/* Ring 1 (r=55) */}
          {[0, 15, 30, 45, 60, 75, 90].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <circle
                key={`r1-${deg}`}
                cx={35 + 55 * Math.cos(rad)}
                cy={245 - 55 * Math.sin(rad)}
                r="1.4"
              />
            );
          })}

          {/* Ring 2 (r=80) */}
          {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <circle
                key={`r2-${deg}`}
                cx={35 + 80 * Math.cos(rad)}
                cy={245 - 80 * Math.sin(rad)}
                r="1.5"
              />
            );
          })}

          {/* Ring 3 (r=105) */}
          {[0, 8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <circle
                key={`r3-${deg}`}
                cx={35 + 105 * Math.cos(rad)}
                cy={245 - 105 * Math.sin(rad)}
                r="1.4"
              />
            );
          })}

          {/* Ring 4 (r=130) */}
          {[0, 7, 14, 21, 28, 35, 42, 49, 56, 63, 70, 77, 84, 91].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <circle
                key={`r4-${deg}`}
                cx={35 + 130 * Math.cos(rad)}
                cy={245 - 130 * Math.sin(rad)}
                r="1.3"
              />
            );
          })}

          {/* Ring 5 (r=155) */}
          {[0, 6, 12, 18, 24, 30, 36, 42, 48, 54, 60, 66, 72, 78, 84, 90].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <circle
                key={`r5-${deg}`}
                cx={35 + 155 * Math.cos(rad)}
                cy={245 - 155 * Math.sin(rad)}
                r="1.2"
              />
            );
          })}

          {/* Ring 6 (r=180) */}
          {[0, 6, 12, 18, 24, 30, 36, 42, 48, 54, 60, 66, 72, 78, 84].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <circle
                key={`r6-${deg}`}
                cx={35 + 180 * Math.cos(rad)}
                cy={245 - 180 * Math.sin(rad)}
                r="1.1"
              />
            );
          })}

          {/* Ring 7 (r=205) */}
          {[0, 7, 14, 21, 28, 35, 42, 48, 55, 62, 70, 78].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <circle
                key={`r7-${deg}`}
                cx={35 + 205 * Math.cos(rad)}
                cy={245 - 205 * Math.sin(rad)}
                r="1.0"
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}
