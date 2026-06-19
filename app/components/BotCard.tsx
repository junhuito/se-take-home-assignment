import { Bot } from "../types";

interface BotCardProps {
  bot: Bot;
}

export const BotCard = ({ bot }: BotCardProps) => {
  const isProcessing = bot.status === "PROCESSING";

  return (
    <div
      className={`p-3 rounded-lg border-2 ${
        isProcessing
          ? "bg-green-100 border-green-400 text-green-800"
          : "bg-gray-100 border-gray-400 text-gray-800"
      } shadow-sm`}
    >
      <div className="font-bold">Bot #{bot.id}</div>
      <div className="text-sm">{bot.status}</div>
      {bot.currentOrderId && (
        <div className="text-xs mt-1">
          Processing Order #{bot.currentOrderId}
        </div>
      )}
    </div>
  );
};
