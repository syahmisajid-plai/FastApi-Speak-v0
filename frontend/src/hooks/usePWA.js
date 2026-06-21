// hooks/usePWA.js
import { useEffect, useState } from "react";

export default function usePWA() {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    const checkPWA = () => {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true;

      setIsPWA(standalone);
    };

    checkPWA();

    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    mediaQuery.addEventListener?.("change", checkPWA);

    return () => {
      mediaQuery.removeEventListener?.("change", checkPWA);
    };
  }, []);

  return isPWA;
}
