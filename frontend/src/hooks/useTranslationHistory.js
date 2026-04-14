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
      console.log("🚀 fetchHistory called");

      if (!userId) {
        console.log("❌ userId tidak ada:", userId);
        return;
      }

      console.log("👤 userId:", userId);
      console.log("📄 pageNumber:", pageNumber);
      console.log("➕ append:", append);

      try {
        setLoading(true);
        setError(null);

        const offset = pageNumber * limit;

        console.log("📦 limit:", limit);
        console.log("📍 offset:", offset);

        const url = `${linkBackend}/translation-history/${userId}?limit=${limit}&offset=${offset}`;
        console.log("🌐 fetch URL:", url);

        const res = await fetch(url);

        console.log("📡 response status:", res.status);

        if (!res.ok) {
          throw new Error("Failed to fetch translation history");
        }

        const json = await res.json();

        console.log("📥 raw response:", json);

        const newData = json.data || [];

        console.log("📊 newData length:", newData.length);
        console.log("📊 newData sample:", newData[0]);

        setData((prev) => {
          const result = append ? [...prev, ...newData] : newData;
          console.log("🧠 updated data length:", result.length);
          return result;
        });

        setHasMore(newData.length === limit);
        console.log("🔁 hasMore:", newData.length === limit);
      } catch (err) {
        console.log("🔥 ERROR:", err);
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
        console.log("✅ fetch selesai");
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
    fetchHistory(next, true);
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

  return {
    data,
    page,
    loading,
    hasMore,
    error,
    nextPage,
    prevPage,
    refresh,
  };
}
