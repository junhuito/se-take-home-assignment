import { Order } from "../types";
import { OrderCard } from "./OrderCard";

interface OrdersColumnProps {
  title: string;
  titleClassName: string;
  emptyLabel: string;
  orders: Order[];
}

export const OrdersColumn = ({
  title,
  titleClassName,
  emptyLabel,
  orders,
}: OrdersColumnProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className={`text-xl font-semibold mb-4 ${titleClassName}`}>
        {title} ({orders.length})
      </h2>
      <div className="space-y-3 max-h-150 overflow-y-auto">
        {orders.length === 0 ? (
          <p className="text-gray-700 italic text-center py-8">{emptyLabel}</p>
        ) : (
          orders.map((order) => <OrderCard key={order.id} order={order} />)
        )}
      </div>
    </div>
  );
};
