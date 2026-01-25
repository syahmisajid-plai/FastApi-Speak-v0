import { useEffect } from "react";
import api from "../api";

export default function useBackendPing() {
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await api.get("/api/ping");
        console.log("✅ Backend connected:", res.data);
      } catch (err) {
        console.error("❌ Backend NOT connected:", err);
      }
    };
    checkBackend();
  }, []);
}
