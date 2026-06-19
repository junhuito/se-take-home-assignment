import { useCallback, useReducer, useRef } from "react";
import { Bot } from "../types";
import { eventBus } from "../lib/eventBus";

export const BOT_EVENTS = {
  BOT_ADDED: "BOT_ADDED",
  BOT_REMOVED: "BOT_REMOVED",
  BOT_COMPLETE_ORDER: "BOT_COMPLETE_ORDER",
};

type BotAction =
  | { type: "ADD_BOT"; payload: Bot }
  | { type: "REMOVE_BOT"; payload: number }
  | {
      type: "ASSIGN_ORDER";
      payload: { botId: number; orderId: number; dispose: () => void };
    }
  | { type: "COMPLETE_ORDER"; payload: number };

const botReducer = (state: Bot[], action: BotAction): Bot[] => {
  switch (action.type) {
    case "ADD_BOT":
      return [...state, action.payload];

    case "REMOVE_BOT":
      return state.filter((b) => {
        if (b.id === action.payload) {
          b.dispose?.();

          return false;
        }

        return true;
      });

    case "ASSIGN_ORDER":
      return state.map((b) =>
        b.id === action.payload.botId
          ? {
              ...b,
              status: "PROCESSING" as const,
              currentOrderId: action.payload.orderId,
              dispose: action.payload.dispose,
            }
          : b,
      );

    case "COMPLETE_ORDER":
      return state.map((b) =>
        b.id === action.payload
          ? {
              ...b,
              status: "IDLE" as const,
              currentOrderId: undefined,
              dispose: undefined,
            }
          : b,
      );

    default:
      return state;
  }
};

export const useBots = () => {
  const [bots, dispatch] = useReducer(botReducer, []);
  const botIdCounter = useRef(1);

  const removeBot = useCallback(() => {
    const lastBot = bots.length > 0 ? bots[bots.length - 1] : null;

    if (!lastBot) {
      return;
    }

    dispatch({
      type: "REMOVE_BOT",
      payload: lastBot.id,
    });

    eventBus.emit(BOT_EVENTS.BOT_REMOVED, lastBot);
  }, [bots]);

  const addBot = useCallback(() => {
    const newBot: Bot = {
      id: botIdCounter.current++,
      status: "IDLE",
    };

    dispatch({ type: "ADD_BOT", payload: newBot });

    eventBus.emit(BOT_EVENTS.BOT_ADDED, newBot);
  }, []);

  const getIdleBot = useCallback(() => {
    return bots.find((bot) => bot.status === "IDLE") || null;
  }, [bots]);

  const assignOrder = useCallback((bot: Bot, orderId: number) => {
    const timer = setTimeout(() => {
      dispatch({ type: "COMPLETE_ORDER", payload: bot.id });
      eventBus.emit(BOT_EVENTS.BOT_COMPLETE_ORDER, bot, orderId);
    }, 10000);

    dispatch({
      type: "ASSIGN_ORDER",
      payload: {
        botId: bot.id,
        orderId,
        dispose: () => clearTimeout(timer),
      },
    });
  }, []);

  return {
    bots,
    addBot,
    removeBot,
    getIdleBot,
    assignOrder,
  };
};
