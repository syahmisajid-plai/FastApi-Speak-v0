import { useEffect, useState } from "react";

export function useCheckUpdate() {
  const [hasUpdate, setHasUpdate] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`/version?t=${Date.now()}`);
        const data = await res.json();

        const currentVersion = "1.0.0"; // versi frontend build kamu

        if (data.version !== currentVersion) {
          setHasUpdate(true);
        }
      } catch (err) {
        console.error("version check failed", err);
      }
    };

    check();

    const interval = setInterval(check, 60000);

    return () => clearInterval(interval);
  }, []);

  return hasUpdate;
}