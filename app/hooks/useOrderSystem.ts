import { useEffect, useEffectEvent } from "react";
import { useBots, BOT_EVENTS } from "./useBots";
import { useOrder, ORDER_EVENTS } from "./useOrder";
import { eventBus } from "../lib/eventBus";
import { Bot, Order } from "../types";

export const useOrderSystem = () => {
  const { bots, getIdleBot, assignOrder, addBot, removeBot } = useBots();
  const {
    pendingOrders,
    processingOrders,
    completeOrders,
    getNextOrder,
    createOrder,
    moveOrderFromPendingToProcess,
    moveOrderFromProcessToPending,
    moveOrderFromProcessToComplete,
  } = useOrder();

  const handleOrderCreated = useEffectEvent((order: Order) => {
    const idleBot = getIdleBot();
    if (!idleBot) return;

    assignOrder(idleBot, order.id);
    moveOrderFromPendingToProcess(order.id);
  });

  const handleBotAdded = useEffectEvent((bot: Bot) => {
    const order = getNextOrder();
    if (!order) return;

    assignOrder(bot, order.id);
    moveOrderFromPendingToProcess(order.id);
  });

  const handleBotRemoved = useEffectEvent((bot: Bot) => {
    if (!bot.currentOrderId) return;

    moveOrderFromProcessToPending(bot.currentOrderId);
  });

  const handleBotComplete = useEffectEvent((bot: Bot, orderId: number) => {
    moveOrderFromProcessToComplete(orderId);

    const nextOrder = getNextOrder();
    if (!nextOrder) return;

    assignOrder(bot, nextOrder.id);
    moveOrderFromPendingToProcess(nextOrder.id);
  });

  useEffect(() => {
    eventBus.on(ORDER_EVENTS.ORDER_CREATED, handleOrderCreated);
    eventBus.on(ORDER_EVENTS.ORDER_MOVED_TO_PENDING, handleOrderCreated);
    eventBus.on(BOT_EVENTS.BOT_ADDED, handleBotAdded);
    eventBus.on(BOT_EVENTS.BOT_REMOVED, handleBotRemoved);
    eventBus.on(BOT_EVENTS.BOT_COMPLETE_ORDER, handleBotComplete);

    return () => {
      eventBus.off(ORDER_EVENTS.ORDER_CREATED, handleOrderCreated);
      eventBus.off(ORDER_EVENTS.ORDER_MOVED_TO_PENDING, handleOrderCreated);
      eventBus.off(BOT_EVENTS.BOT_ADDED, handleBotAdded);
      eventBus.off(BOT_EVENTS.BOT_REMOVED, handleBotRemoved);
      eventBus.off(BOT_EVENTS.BOT_COMPLETE_ORDER, handleBotComplete);
    };
  }, []);

  return {
    bots,
    addBot,
    removeBot,
    pendingOrders,
    processingOrders,
    completeOrders,
    createOrder,
  };
};
