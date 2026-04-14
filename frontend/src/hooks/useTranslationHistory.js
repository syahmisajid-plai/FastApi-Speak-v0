import { useState, useEffect, useCallback } from "react";
import { linkBackend } from "../config";

export default function useTranslationHistory(userId, limit = 10) {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(
    async (pageNumber = 0, append = false) => {
      if (!userId) return;

      try {
        setLoading(true);
        setError(null);

        const offset = pageNumber * limit;

        const res = await fetch(
          `${linkBackend}/translation-history/${userId}?limit=${limit}&offset=${offset}`,
        );

        if (!res.ok) {
          throw new Error("Failed to fetch translation history");
        }

        const json = await res.json();

        const newData = json.data || [];

        setData((prev) => (append ? [...prev, ...newData] : newData));

        setHasMore(newData.length === limit);
      } catch (err) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    [userId, limit],
  );

  // initial load
  useEffect(() => {
    setPage(0);
    fetchHistory(0, false);
  }, [userId]);

  // next page
  const nextPage = () => {
    if (!hasMore || loading) return;

    const next = page + 1;
    setPage(next);
    fetchHistory(next, false);
  };

  // prev page (simple version: refetch)
  const prevPage = () => {
    if (page === 0 || loading) return;

    const prev = page - 1;
    setPage(prev);
    fetchHistory(prev, false);
  };

  // refresh
  const refresh = () => {
    fetchHistory(page, false);
  };

  // ================= FAVORIT =================
  const toggleFavorite = async (id, currentValue) => {
    try {
      // 🔥 Optimistic update dulu (biar UI langsung berubah)
      setData((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_favorite: !currentValue } : item,
        ),
      );

      const res = await fetch(
        `${linkBackend}/translation-history/${id}/favorite`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            is_favorite: !currentValue,
          }),
        },
      );

      if (!res.ok) {
        throw new Error("Failed to update favorite");
      }
    } catch (err) {
      console.error(err);

      // ❗ rollback kalau gagal
      setData((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_favorite: currentValue } : item,
        ),
      );
    }
  };

  return {
    data,
    page,
    loading,
    hasMore,
    error,
    nextPage,
    prevPage,
    refresh,
    toggleFavorite,
  };
}
