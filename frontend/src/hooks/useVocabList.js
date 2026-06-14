import { useEffect, useState } from "react";
import { linkBackend } from "../config";

export default function useVocabList(userId) {
  const [vocabList, setVocabList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setVocabList([]);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);

      try {
        const res = await fetch(
          `${linkBackend}/vocab/saved/${userId}`
        );

        const json = await res.json();

        if (json.success) {
          setVocabList(json.data || []);
        } else {
          setVocabList([]);
        }
      } catch (err) {
        console.error("❌ Failed to fetch vocab:", err);
        setVocabList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  return {
    vocabList,
    loading,
  };
}