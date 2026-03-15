import RecordingSection from "./RecordingSection";
import SuggestionSection from "./SuggestionSection";
import ControlSection from "./ControlSection";
import LupaKataOverlay from "./LupaKataOverlay"; // ← WAJIB

export default function BottomActions({
  isRecording,
  showSuggestions,
  suggestions,
  speakText,
  controlProps,
  lupaKata,
}) {
  return (
    <div className="fixed bottom-20 lg:bottom-20 left-0 w-full px-4 space-y-4">
      {lupaKata.isLupaKataActive && <LupaKataOverlay />}
      {isRecording && !lupaKata.isLupaKataActive && <RecordingSection />}
      {showSuggestions && (
        <SuggestionSection suggestions={suggestions} playAudio={speakText} />
      )}
      <ControlSection {...controlProps} />
    </div>
  );
}
