import { useEffect, useState, useMemo } from "react";
import { linkBackend } from "../config";

export default function useVocabList(userId) {
  const [vocabList, setVocabList] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      setLoading(true);

      try {
        const res = await fetch(
          `${linkBackend}/vocab/saved/${userId}`
        );

        const json = await res.json();

        setVocabList(json.data || []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // 🔥 merge status
  const enrichedVocabList = useMemo(() => {
    return vocabList.map((v) => ({
      ...v,
      status: statusMap[v.id] || "learning",
    }));
  }, [vocabList, statusMap]);

  return {
    vocabList: enrichedVocabList,
    loading,
  };
}
