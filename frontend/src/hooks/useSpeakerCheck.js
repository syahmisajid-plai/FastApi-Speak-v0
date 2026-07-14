// features/onboarding/hooks/useSpeakerCheck.js

import { useRef, useState } from "react";

export default function useSpeakerCheck() {
  const audioRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [passed, setPassed] = useState(false);

  const playSample = () => {
    if (!audioRef.current) return;

    audioRef.current.currentTime = 0;

    setPassed(false);

    audioRef.current.play();
  };

  const confirmHeard = () => {
    setPassed(true);
  };

  return {
    audioRef,

    isPlaying,
    passed,

    playSample,
    confirmHeard,

    setIsPlaying,
  };
}
