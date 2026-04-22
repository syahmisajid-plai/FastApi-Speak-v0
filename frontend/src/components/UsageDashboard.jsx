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
    const keyword = search?.toLowerCase() || "";

    return formattedData.filter((d) => {
      if (!d?.user) return false;
      return d.user.toLowerCase().includes(keyword);
    });
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
    <div className="p-3 md:p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white min-h-screen">
      {/* ================= HEADER ================= */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">
            📊 Usage Dashboard
          </h1>
          <p className="text-xs md:text-sm text-gray-400">
            Monitor API usage & cost (LLM + TTS)
          </p>
        </div>

        <input
          type="text"
          placeholder="Search user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-64 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none focus:ring-2 focus:ring-white/20"
        />
      </div>

      {/* ================= SUMMARY ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        {[
          {
            label: "Total Cost",
            value: totalCost,
          },
          {
            label: "LLM Cost",
            value: totalLLM,
          },
          {
            label: "TTS Cost",
            value: totalTTS,
          },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white/5 border border-white/10 rounded-xl p-3 md:p-4 backdrop-blur"
          >
            <p className="text-xs md:text-sm text-gray-400">{item.label}</p>
            <h2 className="text-lg md:text-2xl font-semibold mt-1 break-all">
              ${item.value.toFixed(8)}
            </h2>
          </div>
        ))}
      </div>

      {/* ================= BAR CHART ================= */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-3 md:p-4 mb-5">
        <h2 className="text-base md:text-lg font-semibold mb-3">
          Cost per User
        </h2>

        <div className="space-y-2">
          {filteredData.map((item, i) => {
            const max = Math.max(...filteredData.map((d) => d.totalCost || 0));
            const width = max ? (item.totalCost / max) * 100 : 0;

            return (
              <div key={i}>
                <div className="flex justify-between text-[10px] md:text-xs text-gray-300 mb-1">
                  <span className="truncate max-w-[60%]">{item.user}</span>
                  <span>${item.totalCost.toFixed(6)}</span>
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

      {/* DESKTOP TABLE */}
      <div className="hidden md:block bg-white/5 border border-white/10 rounded-xl p-4">
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

      {/* MOBILE CARD */}
      <div className="md:hidden space-y-3">
        {filteredData.map((item, index) => (
          <div
            key={index}
            className="bg-white/5 border border-white/10 rounded-xl p-3"
          >
            <p className="text-sm font-semibold truncate">{item.user}</p>

            <div className="mt-2 text-xs text-gray-300 space-y-1">
              <div className="flex justify-between">
                <span>LLM</span>
                <span>${item.llmCost.toFixed(6)}</span>
              </div>
              <div className="flex justify-between">
                <span>TTS</span>
                <span>${item.ttsCost.toFixed(6)}</span>
              </div>
              <div className="flex justify-between font-semibold text-white">
                <span>Total</span>
                <span>${item.totalCost.toFixed(6)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
