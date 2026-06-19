const LEGEND_ITEMS = [
  {
    label: "VIP Order",
    swatchClassName: "bg-yellow-100 border-yellow-400",
  },
  {
    label: "Normal Order",
    swatchClassName: "bg-blue-100 border-blue-400",
  },
  {
    label: "Bot Processing",
    swatchClassName: "bg-green-100 border-green-400",
  },
  {
    label: "Bot Idle",
    swatchClassName: "bg-gray-100 border-gray-400",
  },
] as const;

export const StatusLegend = () => {
  return (
    <div className="mt-8 bg-white rounded-lg shadow-md p-6">
      <h3 className="font-semibold text-gray-900 mb-3">Legend</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-800">
        {LEGEND_ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div
              className={`w-6 h-6 border-2 rounded ${item.swatchClassName}`}
            ></div>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
