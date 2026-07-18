// hooks/useUser.js

import { useState } from "react";
import { linkBackend } from "../config";

export default function useUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // =============================
  // UPDATE USER AVATAR
  // =============================
  const updateUserAvatar = async ({ user_id, avatar_id }) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${linkBackend}/user/avatar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id,
          avatar_id,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const result = await res.json();

      console.log("UPDATE AVATAR RESULT:", result);

      return result.user;
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update avatar");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,

    updateUserAvatar,
  };
}
