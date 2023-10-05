const EntryLoading = () => {
  return (
    <svg
      aria-labelledby="loading-4-aria"
      role="img"
      viewBox="0 0 265 230"
      style={{ width: "100%", height: "100%" }}
    >
      <title id="loading-4-aria">Loading...</title>
      <rect
        role="presentation"
        x="0"
        y="0"
        width="100%"
        height="100%"
        clipPath="url(#loading-4-diff)"
        style={{ fill: 'url("#loading-4-animated-diff")' }}
      ></rect>
      <defs>
        <clipPath id="loading-4-diff">
          <rect x="15" y="15" rx="4" ry="4" width="350" height="25"></rect>
          <rect x="15" y="50" rx="2" ry="2" width="350" height="150"></rect>
          <rect x="15" y="230" rx="2" ry="2" width="170" height="20"></rect>
          <rect x="60" y="230" rx="2" ry="2" width="170" height="20"></rect>
        </clipPath>
        <linearGradient id="loading-4-animated-diff">
          <stop offset="0%" stopColor="#f5f6f7" stopOpacity="1">
            <animate
              attributeName="offset"
              values="-2; -2; 1"
              keyTimes="0; 0.25; 1"
              dur="1.2s"
              repeatCount="indefinite"
            ></animate>
          </stop>
          <stop offset="50%" stopColor="var(--white-600)" stopOpacity="1">
            <animate
              attributeName="offset"
              values="-1; -1; 2"
              keyTimes="0; 0.25; 1"
              dur="1.2s"
              repeatCount="indefinite"
            ></animate>
          </stop>
          <stop offset="100%" stopColor="#f5f6f7" stopOpacity="1">
            <animate
              attributeName="offset"
              values="0; 0; 3"
              keyTimes="0; 0.25; 1"
              dur="1.2s"
              repeatCount="indefinite"
            ></animate>
          </stop>
        </linearGradient>
      </defs>
    </svg>
  );
};

export default EntryLoading;
