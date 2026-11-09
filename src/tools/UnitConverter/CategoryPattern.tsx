import React from "react";

export interface CategoryPatternProps {
  categoryId: string;
  className?: string;
  idPrefix?: string;
  testId?: string;
}

export const CategoryPattern: React.FC<CategoryPatternProps> = ({
  categoryId,
  className = "",
  idPrefix,
  testId,
}) => {
  const patternId = idPrefix
    ? `geom-pat-${idPrefix}-${categoryId}`
    : `geom-pat-${categoryId}`;

  const resolvedTestId =
    testId ||
    (idPrefix
      ? `category-pattern-${idPrefix}-${categoryId}`
      : `category-pattern-${categoryId}`);

  const renderPatternDef = () => {
    switch (categoryId) {
      case "distance":
        // Precision ruler tick grid with calibration diagonal hashes
        return (
          <pattern
            id={patternId}
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="0"
              y1="20"
              x2="40"
              y2="20"
              stroke="currentColor"
              strokeWidth="0.8"
              strokeDasharray="1 3"
            />
            <line x1="0" y1="10" x2="0" y2="30" stroke="currentColor" strokeWidth="1.5" />
            <line x1="10" y1="15" x2="10" y2="25" stroke="currentColor" strokeWidth="1" />
            <line x1="20" y1="12" x2="20" y2="28" stroke="currentColor" strokeWidth="1.2" />
            <line x1="30" y1="15" x2="30" y2="25" stroke="currentColor" strokeWidth="1" />
            <path
              d="M0,0 L40,40 M40,0 L0,40"
              stroke="currentColor"
              strokeWidth="0.5"
              strokeOpacity="0.4"
            />
          </pattern>
        );

      case "temperature":
        // Hexagonal thermal lattice with sinusoidal thermodynamic waves
        return (
          <pattern
            id={patternId}
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M24,4 L42,14 L42,34 L24,44 L6,34 L6,14 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <circle cx="24" cy="24" r="5" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <path
              d="M0,24 Q12,14 24,24 T48,24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeOpacity="0.6"
            />
            <path
              d="M0,12 Q12,22 24,12 T48,12"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
              strokeOpacity="0.4"
            />
          </pattern>
        );

      case "area":
        // Cartesian quadrilateral blueprint grid with crosshairs and subdividing tiles
        return (
          <pattern
            id={patternId}
            width="36"
            height="36"
            patternUnits="userSpaceOnUse"
          >
            <rect x="2" y="2" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1" />
            <rect
              x="10"
              y="10"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
              strokeDasharray="2 2"
            />
            <path
              d="M18,0 L18,36 M0,18 L36,18"
              stroke="currentColor"
              strokeWidth="0.6"
              strokeOpacity="0.5"
            />
            <circle cx="18" cy="18" r="2" fill="currentColor" fillOpacity="0.4" />
          </pattern>
        );

      case "volume":
        // 3D Isometric wireframe cubes / voxels
        return (
          <pattern
            id={patternId}
            width="50"
            height="86.6"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M25,0 L50,14.43 L50,43.3 L25,57.74 L0,43.3 L0,14.43 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
            <path
              d="M25,28.87 L25,57.74 M25,28.87 L50,14.43 M25,28.87 L0,14.43"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
              strokeDasharray="2 2"
            />
            <path
              d="M25,86.6 L50,72.17 L50,43.3 L25,28.87 L0,43.3 L0,72.17 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.6"
              strokeOpacity="0.5"
            />
          </pattern>
        );

      case "mass":
        // Triangular balance lattice & tetrahedral center-of-mass geometry
        return (
          <pattern
            id={patternId}
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <polygon
              points="20,4 36,36 4,36"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <polygon
              points="20,36 36,4 4,4"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.6"
              strokeDasharray="2 2"
              strokeOpacity="0.5"
            />
            <circle cx="20" cy="24" r="3" fill="currentColor" fillOpacity="0.4" />
          </pattern>
        );

      case "speed":
        // Aerodynamic streamlines, velocity vectors, and supersonic chevrons
        return (
          <pattern
            id={patternId}
            width="48"
            height="32"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M6,6 L18,16 L6,26 M18,6 L30,16 L18,26 M30,6 L42,16 L30,26"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="0"
              y1="16"
              x2="48"
              y2="16"
              stroke="currentColor"
              strokeWidth="0.7"
              strokeDasharray="6 4"
              strokeOpacity="0.6"
            />
          </pattern>
        );

      case "digital":
        // Orthogonal microchip circuit board traces, solder pads & logic bus
        return (
          <pattern
            id={patternId}
            width="44"
            height="44"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0,12 H18 L26,20 H44 M12,0 V18 L20,26 V44 M32,0 V12 M0,32 H12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
            <circle cx="18" cy="12" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="26" cy="20" r="2" fill="currentColor" fillOpacity="0.4" />
            <circle cx="32" cy="32" r="3" fill="none" stroke="currentColor" strokeWidth="1" />
            <rect x="8" y="28" width="4" height="4" fill="currentColor" fillOpacity="0.3" />
          </pattern>
        );

      case "time":
        // Concentric astrolabe clock rings, radial ticks, and hour angles
        return (
          <pattern
            id={patternId}
            width="50"
            height="50"
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <circle cx="25" cy="25" r="12" fill="none" stroke="currentColor" strokeWidth="0.8" />
            <circle cx="25" cy="25" r="3" fill="currentColor" fillOpacity="0.5" />
            <line x1="25" y1="5" x2="25" y2="9" stroke="currentColor" strokeWidth="1.5" />
            <line x1="25" y1="41" x2="25" y2="45" stroke="currentColor" strokeWidth="1.5" />
            <line x1="5" y1="25" x2="9" y2="25" stroke="currentColor" strokeWidth="1.5" />
            <line x1="41" y1="25" x2="45" y2="25" stroke="currentColor" strokeWidth="1.5" />
            <path d="M25,25 L34,16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </pattern>
        );

      case "pressure":
        // Barometric isobar rings with converging force vectors
        return (
          <pattern
            id={patternId}
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx="24"
              cy="24"
              r="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.6"
              strokeDasharray="2 3"
            />
            <circle cx="24" cy="24" r="16" fill="none" stroke="currentColor" strokeWidth="0.8" />
            <circle cx="24" cy="24" r="9" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <path
              d="M24,2 L24,7 M24,46 L24,41 M2,24 L7,24 M46,24 L41,24"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <polygon points="24,9 21,5 27,5" fill="currentColor" fillOpacity="0.5" />
            <polygon points="24,39 21,43 27,43" fill="currentColor" fillOpacity="0.5" />
            <polygon points="9,24 5,21 5,27" fill="currentColor" fillOpacity="0.5" />
            <polygon points="39,24 43,21 43,27" fill="currentColor" fillOpacity="0.5" />
          </pattern>
        );

      case "energy":
        // High-voltage quantum ray lattice & radiant spark polygon bursts
        return (
          <pattern
            id={patternId}
            width="42"
            height="42"
            patternUnits="userSpaceOnUse"
          >
            <polygon
              points="21,3 26,16 39,21 26,26 21,39 16,26 3,21 16,16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <path
              d="M0,0 L14,14 M42,0 L28,14 M0,42 L14,28 M42,42 L28,28"
              stroke="currentColor"
              strokeWidth="0.8"
              strokeDasharray="2 2"
              strokeOpacity="0.6"
            />
            <circle cx="21" cy="21" r="2.5" fill="currentColor" fillOpacity="0.6" />
          </pattern>
        );

      default:
        // Universal geometric dot & diamond matrix fallback
        return (
          <pattern
            id={patternId}
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="16" cy="16" r="1.5" fill="currentColor" fillOpacity="0.5" />
            <path
              d="M0,16 H32 M16,0 V32"
              stroke="currentColor"
              strokeWidth="0.5"
              strokeOpacity="0.3"
              strokeDasharray="2 2"
            />
          </pattern>
        );
    }
  };

  return (
    <svg
      className={`category-geometric-pattern pattern-${categoryId} ${className}`}
      aria-hidden="true"
      data-testid={resolvedTestId}
      preserveAspectRatio="none"
    >
      <defs>{renderPatternDef()}</defs>
      <rect
        className="category-pattern-rect"
        width="100%"
        height="100%"
        fill={`url(#${patternId})`}
      />
    </svg>
  );
};

export default CategoryPattern;
