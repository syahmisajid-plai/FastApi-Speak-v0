import { useState, useRef, useCallback, useEffect } from "react";

/**
 * useIdle
 * @param {number} timeout Duration dalam ms sebelum dianggap idle
 * @returns {Object} { isIdle, resetIdle }
 */
export default function useIdle(timeout = 15000, enabled = true) {
  const [isIdle, setIsIdle] = useState(true);
  const idleTimerRef = useRef(null);

  if (!enabled) return;

  const resetIdle = useCallback(() => {
    setIsIdle(false);

    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    idleTimerRef.current = setTimeout(() => {
      setIsIdle(true);
    }, timeout);
  }, [timeout]);

  useEffect(() => {
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, []);

  return { isIdle, resetIdle };
}
