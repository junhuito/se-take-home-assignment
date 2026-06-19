export type OrderType = "NORMAL" | "VIP";
export type BotStatus = "IDLE" | "PROCESSING";

export interface Order {
  id: number;
  type: OrderType;
  botId?: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface Bot {
  id: number;
  status: BotStatus;
  currentOrderId?: number;
  dispose?: () => void;
}
