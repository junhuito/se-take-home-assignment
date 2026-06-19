import { useEffect, useState } from "react";
import { Order } from "../types";
import { ORDER_PROCESSING_MS } from "../hooks/useBots";

interface OrderCardProps {
  order: Order;
  showCountdown?: boolean;
}

export const OrderCard = ({ order, showCountdown = false }: OrderCardProps) => {
  const [remainingMs, setRemainingMs] = useState(ORDER_PROCESSING_MS);
  const bgColor =
    order.type === "VIP"
      ? "bg-yellow-100 border-yellow-400"
      : "bg-blue-100 border-blue-400";
  const textColor = order.type === "VIP" ? "text-yellow-800" : "text-blue-800";

  useEffect(() => {
    if (!showCountdown) return;

    const startTime = performance.now();
    let frameId = 0;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const nextRemaining = Math.max(ORDER_PROCESSING_MS - elapsed, 0);
      setRemainingMs(nextRemaining);

      if (nextRemaining > 0) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [showCountdown]);

  const secondsLeft = Math.ceil(remainingMs / 1000);
  const progress = remainingMs / ORDER_PROCESSING_MS;
  const ringRadius = 11;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - progress);
  const countdownTone =
    secondsLeft <= 3
      ? "text-red-700"
      : secondsLeft <= 6
        ? "text-amber-700"
        : "text-green-700";

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
      {showCountdown && (
        <div className="mt-2 flex items-center justify-between rounded-md border border-white/70 bg-white/70 px-2.5 py-2">
          <div
            className={`flex items-center gap-2 text-xs font-semibold ${countdownTone}`}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <circle
                cx="12"
                cy="13"
                r="8"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M12 9V13L15 15"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 3h6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            Time left
          </div>
          <div className="relative h-7 w-7">
            <svg className="h-7 w-7 -rotate-90" viewBox="0 0 28 28" aria-hidden>
              <circle
                cx="14"
                cy="14"
                r={ringRadius}
                fill="none"
                stroke="rgb(187 247 208)"
                strokeWidth="3"
              />
              <circle
                cx="14"
                cy="14"
                r={ringRadius}
                fill="none"
                stroke="rgb(21 128 61)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
              />
            </svg>
            <span
              className={`absolute inset-0 grid place-items-center text-[10px] font-bold ${countdownTone}`}
            >
              {secondsLeft}
            </span>
          </div>
        </div>
      )}
      {order.completedAt && (
        <div className="text-xs opacity-75">
          Completed: {order.completedAt.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};
