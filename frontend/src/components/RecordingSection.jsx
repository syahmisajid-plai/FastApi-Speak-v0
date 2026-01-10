export default function RecordingSection() {
  return (
    <div className="flex flex-col items-center mb-2">
      <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center animate-pulse shadow-lg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 1v11m0 0a3 3 0 003-3V2a3 3 0 00-6 0v7a3 3 0 003 3zm0 0v4m0 4h4m-4 0H8"
          />
        </svg>
      </div>

      <div className="flex space-x-2 items-end h-16 mt-2">
        <span className="w-2 bg-red-500 rounded animate-wave"></span>
        <span className="w-2 bg-red-500 rounded animate-wave delay-200"></span>
        <span className="w-2 bg-red-500 rounded animate-wave delay-400"></span>
        <span className="w-2 bg-red-500 rounded animate-wave delay-600"></span>
        <span className="w-2 bg-red-500 rounded animate-wave delay-800"></span>
      </div>

      <p className="text-white font-semibold mt-1">Recording...</p>
    </div>
  );
}
