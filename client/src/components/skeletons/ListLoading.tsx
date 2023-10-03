const ListLoadingSkeleton = () => (
  <svg
    role="img"
    width="400"
    height="400"
    aria-labelledby="loading-aria"
    viewBox="0 0 400 400"
    preserveAspectRatio="none"
  >
    <title id="loading-aria">Loading...</title>
    <rect
      x="0"
      y="0"
      width="100%"
      height="100%"
      clip-path="url(#clip-path)"
      style="fill: url(#fill);"
    ></rect>
    <defs>
      <clipPath id="clip-path">
        <rect x="0" y="8" rx="3" ry="3" width="100" height="6" />
        <rect x="0" y="26" rx="3" ry="3" width="100" height="6" />
        <rect x="0" y="47" rx="3" ry="3" width="410" height="6" />
        <rect x="0" y="66" rx="3" ry="3" width="400" height="6" />
        <rect x="0" y="82" rx="0" ry="0" width="547" height="1" />
        <rect x="0" y="90" rx="3" ry="3" width="100" height="6" />
        <rect x="0" y="108" rx="3" ry="3" width="100" height="6" />
        <rect x="0" y="129" rx="3" ry="3" width="410" height="6" />
        <rect x="0" y="148" rx="3" ry="3" width="400" height="6" />
        <rect x="0" y="164" rx="0" ry="0" width="547" height="1" />
        <rect x="0" y="175" rx="3" ry="3" width="100" height="6" />
        <rect x="0" y="193" rx="3" ry="3" width="100" height="6" />
        <rect x="0" y="214" rx="3" ry="3" width="410" height="6" />
        <rect x="0" y="233" rx="3" ry="3" width="400" height="6" />
        <rect x="0" y="249" rx="0" ry="0" width="547" height="1" />
      </clipPath>
      <linearGradient id="fill">
        <stop offset="0.599964" stop-color="#f3f3f3" stop-opacity="1">
          <animate
            attributeName="offset"
            values="-2; -2; 1"
            keyTimes="0; 0.25; 1"
            dur="2s"
            repeatCount="indefinite"
          ></animate>
        </stop>
        <stop offset="1.59996" stop-color="#ecebeb" stop-opacity="1">
          <animate
            attributeName="offset"
            values="-1; -1; 2"
            keyTimes="0; 0.25; 1"
            dur="2s"
            repeatCount="indefinite"
          ></animate>
        </stop>
        <stop offset="2.59996" stop-color="#f3f3f3" stop-opacity="1">
          <animate
            attributeName="offset"
            values="0; 0; 3"
            keyTimes="0; 0.25; 1"
            dur="2s"
            repeatCount="indefinite"
          ></animate>
        </stop>
      </linearGradient>
    </defs>
  </svg>
);

export default ListLoadingSkeleton;
