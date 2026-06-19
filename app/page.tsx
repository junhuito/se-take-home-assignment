"use client";

import { BotStatusSection } from "./components/BotStatusSection";
import { ControlPanel } from "./components/ControlPanel";
import { HowItWorks } from "./components/HowItWorks";
import { OrdersColumn } from "./components/OrdersColumn";
import { StatusLegend } from "./components/StatusLegend";
import { useOrderSystem } from "./hooks/useOrderSystem";

const ORDER_COLUMNS = [
  {
    key: "pending",
    title: "PENDING",
    titleClassName: "text-gray-700",
    emptyLabel: "No pending orders",
    selectOrders: (state: ReturnType<typeof useOrderSystem>) =>
      state.pendingOrders,
  },
  {
    key: "processing",
    title: "PROCESSING",
    titleClassName: "text-green-700",
    emptyLabel: "No orders being processed",
    selectOrders: (state: ReturnType<typeof useOrderSystem>) =>
      state.processingOrders,
  },
  {
    key: "complete",
    title: "COMPLETE",
    titleClassName: "text-gray-700",
    emptyLabel: "No completed orders yet",
    selectOrders: (state: ReturnType<typeof useOrderSystem>) =>
      state.completeOrders,
  },
] as const;

export default function Home() {
  const orderSystem = useOrderSystem();
  const { bots, createOrder, addBot, removeBot } = orderSystem;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            McDonald&apos;s Order Management System
          </h1>
          <p className="text-gray-700">
            Manage orders and cooking bots in real-time
          </p>
        </div>

        <ControlPanel
          botCount={bots.length}
          createOrder={createOrder}
          addBot={addBot}
          removeBot={removeBot}
        />

        <BotStatusSection bots={bots} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {ORDER_COLUMNS.map((column) => (
            <OrdersColumn
              key={column.key}
              title={column.title}
              titleClassName={column.titleClassName}
              emptyLabel={column.emptyLabel}
              orders={column.selectOrders(orderSystem)}
              showCountdown={column.key === "processing"}
            />
          ))}
        </div>

        <StatusLegend />
        <HowItWorks />
      </div>
    </div>
  );
}
