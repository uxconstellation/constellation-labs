/**
 * Shared SVG filters and textures for every product patch. Rendered once in App.
 * emb:   raised embroidery, a fuzzy thread edge lit from the top left
 * lift:  the patch body sitting on the board
 * satin / satin2 / twill: thread textures
 */
export default function PatchDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
      <defs>
        <filter id="pt-emb" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2" seed="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.6" xChannelSelector="R" yChannelSelector="G" result="fuzzy" />
          <feGaussianBlur in="SourceAlpha" stdDeviation="2.2" result="blur" />
          <feSpecularLighting in="blur" surfaceScale="2.6" specularConstant=".55" specularExponent="16" lightingColor="#ffffff" result="spec">
            <fePointLight x="-60" y="-120" z="220" />
          </feSpecularLighting>
          <feComposite in="spec" in2="SourceAlpha" operator="in" result="specIn" />
          <feComposite in="fuzzy" in2="specIn" operator="arithmetic" k1="0" k2="1" k3=".5" k4="0" result="lit" />
          <feDropShadow in="lit" dx="0" dy="1.2" stdDeviation=".8" floodColor="#160C15" floodOpacity=".28" />
        </filter>
        <filter id="pt-lift" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="10" stdDeviation="9" floodColor="#160C15" floodOpacity=".22" />
        </filter>
        <pattern id="pt-satin" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
          <rect width="1.6" height="5" fill="#fff" opacity=".22" />
        </pattern>
        <pattern id="pt-satin2" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-52)">
          <rect width="1.6" height="5" fill="#000" opacity=".1" />
        </pattern>
        <pattern id="pt-twill" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="2" height="6" fill="#000" opacity=".05" />
        </pattern>
        <radialGradient id="pt-sheen">
          <stop offset="0" stopColor="#fff" stopOpacity=".55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}
