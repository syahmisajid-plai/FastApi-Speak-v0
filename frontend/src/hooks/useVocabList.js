import { useEffect, useState, useMemo } from "react";
import { linkBackend } from "../config";

export default function useVocabList(userId) {
  const [vocabList, setVocabList] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true); // penting supaya reset tiap userId berubah

      try {
        const [vocabRes, completedRes] = await Promise.all([
          fetch(`${linkBackend}/vocab/all`),
          fetch(`${linkBackend}/vocab/completed-ids/${userId}`),
        ]);

        const vocabJson = await vocabRes.json();
        const completedJson = await completedRes.json();

        setVocabList(vocabJson.data || []);
        const map = {};
        (completedJson.completed_vocab_ids || []).forEach((item) => {
          map[item.vocab_id] = item.status;
        });

        setStatusMap(map);
      } catch (err) {
        console.log("❌ Failed:", err);
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
