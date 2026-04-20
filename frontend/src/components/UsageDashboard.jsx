import React, { useMemo, useState } from "react";
import { useCostSummary } from "../hooks/useCostSummary";

export default function UsageDashboard() {
  const [search, setSearch] = useState("");

  const { data, loading, error, refetch } = useCostSummary();

  // =========================
  // FORMAT DATA DARI BACKEND
  // =========================
  const formattedData = useMemo(() => {
    return (data || []).map((d) => ({
      user: d.user_id,
      llmCost: d.llm_cost,
      ttsCost: d.tts_cost,
      totalCost: d.total_cost,
    }));
  }, [data]);

  // =========================
  // FILTER SEARCH
  // =========================
  const filteredData = useMemo(() => {
    return formattedData.filter((d) =>
      d.user.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, formattedData]);

  // =========================
  // SUMMARY METRICS
  // =========================
  const totalCost = filteredData.reduce((acc, d) => acc + d.totalCost, 0);
  const totalLLM = filteredData.reduce((acc, d) => acc + d.llmCost, 0);
  const totalTTS = filteredData.reduce((acc, d) => acc + d.ttsCost, 0);

  const topUser = [...filteredData].sort(
    (a, b) => b.totalCost - a.totalCost,
  )[0];

  // =========================
  // LOADING STATE
  // =========================
  if (loading) {
    return (
      <div className="p-4 text-white">
        <p>Loading usage data...</p>
      </div>
    );
  }

  // =========================
  // ERROR STATE
  // =========================
  if (error) {
    return (
      <div className="p-4 text-red-400">
        <p>Error: {error}</p>
        <button onClick={refetch} className="underline">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-h-[80vh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* ================= HEADER ================= */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">📊 Usage Dashboard</h1>
          <p className="text-sm text-gray-400">
            Monitor API usage & cost (LLM + TTS)
          </p>
        </div>

        <input
          type="text"
          placeholder="Search user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none focus:ring-2 focus:ring-white/20"
        />
      </div>

      {/* ================= SUMMARY ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur">
          <p className="text-sm text-gray-400">Total Cost</p>
          <h2 className="text-2xl font-semibold mt-1">
            ${totalCost.toFixed(8)}
          </h2>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur">
          <p className="text-sm text-gray-400">LLM Cost</p>
          <h2 className="text-2xl font-semibold mt-1">
            ${totalLLM.toFixed(8)}
          </h2>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur">
          <p className="text-sm text-gray-400">TTS Cost</p>
          <h2 className="text-2xl font-semibold mt-1">
            ${totalTTS.toFixed(8)}
          </h2>
        </div>
      </div>

      {/* ================= BAR CHART ================= */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Cost per User</h2>

        <div className="space-y-3">
          {filteredData.map((item, i) => {
            const max = Math.max(...filteredData.map((d) => d.totalCost || 0));

            const width = max ? (item.totalCost / max) * 100 : 0;

            return (
              <div key={i}>
                <div className="flex justify-between text-xs text-gray-300 mb-1">
                  <span>{item.user}</span>
                  <span>${item.totalCost.toFixed(8)}</span>
                </div>

                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-400 transition-all duration-500"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
        <h2 className="text-lg font-semibold mb-4">User Usage</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-gray-400">
                <th className="py-2">User</th>
                <th className="py-2">LLM</th>
                <th className="py-2">TTS</th>
                <th className="py-2">Total</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-white/5 hover:bg-white/5 transition"
                >
                  <td className="py-2">{item.user}</td>
                  <td className="py-2">${item.llmCost.toFixed(8)}</td>
                  <td className="py-2">${item.ttsCost.toFixed(8)}</td>
                  <td className="py-2 font-semibold">
                    ${item.totalCost.toFixed(8)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
