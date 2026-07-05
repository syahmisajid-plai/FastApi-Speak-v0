import { useEffect, useState } from "react";
import api from "../api";

export default function useBackendPing() {
  const [isBackendConnected, setIsBackendConnected] = useState(null);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await api.get("/api/ping");
        console.log("✅ Backend connected:", res.data);
        setIsBackendConnected(true);
      } catch (err) {
        console.error("❌ Backend NOT connected:", err);
        setIsBackendConnected(false);
      }
    };

    checkBackend();
  }, []);

  return isBackendConnected;
}
