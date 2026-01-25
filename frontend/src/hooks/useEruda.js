import { useEffect } from "react";

export default function useEruda() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/eruda";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.eruda.init();
      console.log("🛠️ Eruda Loaded!");
    };
  }, []);
}
