import { useEffect, useState } from "react";

import { updateInfo } from "../config/updateInfo";
import { linkBackend } from "../config";

export function useCheckUpdate() {
  const [hasUpdate, setHasUpdate] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${linkBackend}/version?t=${Date.now()}`);
        const data = await res.json();

        const currentVersion = updateInfo.version;

        console.log("Backend version:", data.version);
        console.log("Frontend version:", currentVersion);
        console.log("Is update available:", data.version !== currentVersion);

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