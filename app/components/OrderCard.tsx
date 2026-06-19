import { Order } from "../types";

interface OrderCardProps {
  order: Order;
}

export const OrderCard = ({ order }: OrderCardProps) => {
  const bgColor =
    order.type === "VIP"
      ? "bg-yellow-100 border-yellow-400"
      : "bg-blue-100 border-blue-400";
  const textColor = order.type === "VIP" ? "text-yellow-800" : "text-blue-800";

  return (
    <div
      className={`p-4 rounded-lg border-2 ${bgColor} ${textColor} shadow-sm`}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="font-bold text-lg">Order #{order.id}</div>
          <div className="text-sm font-semibold">{order.type}</div>
        </div>
        {order.botId && (
          <div className="text-xs bg-white px-2 py-1 rounded">
            Bot #{order.botId}
          </div>
        )}
      </div>
      <div className="text-xs mt-2 opacity-75">
        Created: {order.createdAt.toLocaleTimeString()}
      </div>
      {order.completedAt && (
        <div className="text-xs opacity-75">
          Completed: {order.completedAt.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};
