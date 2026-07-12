import RecordingSection from "./RecordingSection";
import SuggestionSection from "./SuggestionSection";
import ControlSection from "./ControlSection";
import LupaKataOverlay from "./LupaKataOverlay";

export default function BottomActions({
  isRecording,
  showSuggestions,
  suggestions,
  speakText,
  controlProps,
  lupaKata,
  isSpeaking,
}) {
  return (
    <div className="fixed bottom-22 lg:bottom-22 left-0 w-full px-4 space-y-4">
      {lupaKata.isLupaKataActive && <LupaKataOverlay />}
      {isRecording && !isSpeaking && !lupaKata.isLupaKataActive && (
        <RecordingSection />
      )}
      {showSuggestions && (
        <SuggestionSection suggestions={suggestions} playAudio={speakText} />
      )}
      <ControlSection {...controlProps} />
    </div>
  );
}
