export default function ContextRenderer({ context }) {
  if (!context) return null;

  const { type, data } = context;

  // ================= OBJECT =================
  if (type === "object") {
    const labelMap = {
      ordered_item: { label: "Your Order", icon: "🧾" },
      received_item: { label: "Received Item", icon: "⚠️" },
      table_number: { label: "Table Number", icon: "🪑" },
    };

    const getLabel = (key) => {
      if (labelMap[key]) return labelMap[key];

      return {
        label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        icon: "📌",
      };
    };

    return (
      <div className="space-y-4">
        {Object.entries(data).map(([key, value]) => {
          const { label, icon } = getLabel(key);

          return (
            <div
              key={key}
              className="
                flex items-center gap-4
                p-4
                rounded-xl
                bg-gradient-to-r from-slate-500 to-slate-200
                shadow-sm
              "
            >
              {/* ICON */}
              <div className="text-2xl">{icon}</div>

              {/* TEXT */}
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  {label}
                </span>
                <span className="text-lg font-semibold text-gray-800">
                  {value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ================= LIST (MENU) =================
  if (type === "list") {
    return (
      <div className="space-y-3">
        {data.map((item, idx) => (
          <div
            key={idx}
            className="
              flex justify-between items-center
              p-4
              rounded-xl
              bg-white
              border border-gray-200
              shadow-sm
              hover:shadow-md
              transition
            "
          >
            {/* LEFT */}
            <div className="flex items-center gap-3">
              <span className="text-xl">🍽</span>
              <span className="font-medium text-gray-800">{item.name}</span>
            </div>

            {/* RIGHT */}
            <div className="text-sm font-semibold text-green-600">
              Rp{item.price}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}
