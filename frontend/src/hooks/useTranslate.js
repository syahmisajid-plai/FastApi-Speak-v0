import { linkBackend } from "../config";

export default function useTranslate() {
  const translate = async (text) => {
    try {
      const res = await fetch(`${linkBackend}/translate/en-id`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
        }),
      });

      const data = await res.json();
      return data;
    } catch (err) {
      console.error("❌ Translate error:", err);
      return null;
    }
  };

  return { translate };
}
