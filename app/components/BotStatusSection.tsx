import { Bot } from "../types";
import { BotCard } from "./BotCard";

interface BotStatusSectionProps {
  bots: Bot[];
}

export const BotStatusSection = ({ bots }: BotStatusSectionProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Cooking Bots ({bots.length})
      </h2>
      {bots.length === 0 ? (
        <p className="text-gray-700 italic">
          No bots available. Click &quot;+ Bot&quot; to add one.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {bots.map((bot) => (
            <BotCard key={bot.id} bot={bot} />
          ))}
        </div>
      )}
    </div>
  );
};
