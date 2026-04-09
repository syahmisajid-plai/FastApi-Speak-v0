import { useEffect, useState } from "react";
import { linkBackend } from "../config";

export default function useVocabList() {
  const [vocabList, setVocabList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVocab = async () => {
      try {
        const res = await fetch(`${linkBackend}/vocab/all`);
        const json = await res.json();

        if (json?.data?.length) {
          setVocabList(json.data);
        }
      } catch (err) {
        console.log("❌ Failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVocab();
  }, []);

  return { vocabList, loading };
}
