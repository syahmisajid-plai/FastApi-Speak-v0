import { useEffect, useState } from "react";
import { linkBackend } from "../config";

export const useCostSummary = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCostSummary = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${linkBackend}/cost/summary`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const result = await res.json();
      setData(result);
    } catch (err) {
      setError(err.message || "Failed to fetch cost summary");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (linkBackend) {
      fetchCostSummary();
    }
  }, [linkBackend]);

  return {
    data,
    loading,
    error,
    refetch: fetchCostSummary,
  };
};
