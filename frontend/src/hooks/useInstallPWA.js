// hooks/useInstallPWA.js
import { useEffect, useState } from "react";

export default function useInstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // hooks/useInstallPWA.js

  useEffect(() => {
    console.log("useInstallPWA mounted");

    const handler = (e) => {
      console.log("beforeinstallprompt fired");
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;

    deferredPrompt.prompt();

    const result = await deferredPrompt.userChoice;

    return result.outcome === "accepted";
  };

  return {
    canInstall: !!deferredPrompt,
    install,
  };
}
