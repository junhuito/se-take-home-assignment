const INSTRUCTIONS = [
  {
    label: "New Normal Order:",
    description:
      "Creates a regular order that goes to the back of the pending queue",
  },
  {
    label: "New VIP Order:",
    description:
      "Creates a VIP order that jumps ahead of all normal orders but queues behind existing VIP orders",
  },
  {
    label: "+ Bot:",
    description:
      "Adds a cooking bot that immediately starts processing pending orders (10 seconds per order)",
  },
  {
    label: "- Bot:",
    description:
      "Removes the newest bot. If it's processing an order, that order returns to its original position in the pending queue",
  },
] as const;

export const HowItWorks = () => {
  return (
    <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
      <h3 className="font-semibold text-blue-900 mb-3">How it works:</h3>
      <ul className="space-y-2 text-sm text-blue-800">
        {INSTRUCTIONS.map((instruction) => (
          <li key={instruction.label}>
            • <strong>{instruction.label}</strong> {instruction.description}
          </li>
        ))}
      </ul>
    </div>
  );
};
