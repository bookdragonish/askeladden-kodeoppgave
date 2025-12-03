export default function CarLoader() {
  return (
    <div className="flex items-center justify-center min-h-20 bg-white">
      {/* Outer box */}
      <div className="relative w-[320px] h-[60px] rounded-md bg-white overflow-hidden">
        {/* Road line at the bottom */}
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gray-300" />

        {/* Animated car */}
        <div className="absolute bottom-0 left-0 animate-[drive_4s_ease-in-out_infinite]">
          <svg
            width="80"
            height="50"
            viewBox="0 0 80 50"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Car body */}
            <path
              d="M 10 35 L 10 25 C 10 22 12 20 15 20 L 20 20 L 25 10 L 55 10 L 60 20 L 65 20 C 68 20 70 22 70 25 L 70 35 C 70 38 68 40 65 40 L 15 40 C 12 40 10 38 10 35 Z"
              stroke="black"
              strokeWidth="3"
              fill="white"
            />

            {/* Left wheel */}
            <circle
              cx="22"
              cy="43"
              r="7"
              fill="white"
              stroke="black"
              strokeWidth="3"
            />

            {/* Right wheel */}
            <circle
              cx="58"
              cy="43"
              r="7"
              fill="white"
              stroke="black"
              strokeWidth="3"
            />
          </svg>
        </div>
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes drive {
          0% {
            left: 0%;
            transform: scaleX(1);
          }
          48% {
            left: calc(100% - 80px);
            transform: scaleX(1);
          }
          52% {
            left: calc(100% - 80px);
            transform: scaleX(-1);
          }
          100% {
            left: 0%;
            transform: scaleX(-1);
          }
        }
      `}</style>
    </div>
  );
}
