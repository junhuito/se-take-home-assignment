import { OrderType } from "../types";

interface ControlPanelProps {
  botCount: number;
  createOrder: (type: OrderType) => void;
  addBot: () => void;
  removeBot: () => void;
}

export const ControlPanel = ({
  botCount,
  createOrder,
  addBot,
  removeBot,
}: ControlPanelProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Control Panel
      </h2>
      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => createOrder("NORMAL")}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold shadow-sm"
        >
          New Normal Order
        </button>
        <button
          onClick={() => createOrder("VIP")}
          className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-semibold shadow-sm"
        >
          New VIP Order
        </button>
        <button
          onClick={addBot}
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold shadow-sm"
        >
          + Bot
        </button>
        <button
          onClick={removeBot}
          disabled={botCount === 0}
          className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          - Bot
        </button>
      </div>
    </div>
  );
};
