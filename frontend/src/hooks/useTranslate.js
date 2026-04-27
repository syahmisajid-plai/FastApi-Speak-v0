// hooks/useTranslate.js
import { linkBackend } from "../config";

export default function useTranslate(userIdRef) {
  const translate = async ({
    text,
    source_lang = "auto",
    target_lang = "id",
  }) => {
    try {
      const userId = userIdRef?.current;

      const res = await fetch(`${linkBackend}/translate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          source_lang,
          target_lang,
          user_id: userId,
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
