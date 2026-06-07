import useSpeechRecognition from "./useSpeechRecognition";
import useWhisperSTT from "./useWhisperSTT";

export default function useSTTManager({
  supportSTTWeb,
  ...props
}) {
  const speechWeb = useSpeechRecognition(props);
  const speechWhisper = useWhisperSTT(props);

  return supportSTTWeb ? speechWeb : speechWhisper;
}