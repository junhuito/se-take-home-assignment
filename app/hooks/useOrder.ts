"use client";

import { useReducer, useCallback, useRef } from "react";
import { Order, OrderType } from "../types";
import { eventBus } from "../lib/eventBus";

export const ORDER_EVENTS = {
  ORDER_CREATED: "ORDER_CREATED",
  ORDER_MOVED_TO_PENDING: "ORDER_MOVED_TO_PENDING",
};

interface OrderState {
  pending: Order[];
  processing: Order[];
  complete: Order[];
}

type OrderAction =
  | { type: "ADD_PENDING"; payload: Order }
  | { type: "MOVE_TO_PROCESSING"; payload: number }
  | { type: "MOVE_TO_COMPLETE"; payload: number }
  | { type: "MOVE_TO_PENDING"; payload: number }
  | { type: "SET_COMPLETE"; payload: Order[] };

const priorityMap: Record<OrderType, number> = {
  VIP: 1,
  NORMAL: 2,
};

const sortPendingQueue = (orders: Order[]): Order[] => {
  return [...orders].sort((a, b) => {
    if (a.type === b.type) {
      return a.id - b.id; // If same type, sort by ID (FIFO)
    }

    return priorityMap[a.type] - priorityMap[b.type];
  });
};

const orderReducer = (state: OrderState, action: OrderAction): OrderState => {
  switch (action.type) {
    case "ADD_PENDING":
      return {
        ...state,
        pending: sortPendingQueue([...state.pending, action.payload]),
      };

    case "MOVE_TO_PROCESSING": {
      const order = state.pending.find((o) => o.id === action.payload);
      if (!order) return state;

      return {
        ...state,
        pending: state.pending.filter((o) => o.id !== action.payload),
        processing: [...state.processing, order],
      };
    }

    case "MOVE_TO_COMPLETE": {
      const order = state.processing.find((o) => o.id === action.payload);
      if (!order) return state;

      return {
        ...state,
        processing: state.processing.filter((o) => o.id !== action.payload),
        complete: [...state.complete, order],
      };
    }

    case "MOVE_TO_PENDING": {
      const order = state.processing.find((o) => o.id === action.payload);
      if (!order) return state;

      return {
        ...state,
        processing: state.processing.filter((o) => o.id !== action.payload),
        pending: sortPendingQueue([...state.pending, order]),
      };
    }

    case "SET_COMPLETE":
      return {
        ...state,
        complete: action.payload,
      };

    default:
      return state;
  }
};

const initialState: OrderState = {
  pending: [],
  processing: [],
  complete: [],
};

export const useOrder = () => {
  const [state, dispatch] = useReducer(orderReducer, initialState);
  const orderIdCounter = useRef(1);

  const createOrder = useCallback((type: OrderType) => {
    const newOrder: Order = {
      id: orderIdCounter.current++,
      type,
      createdAt: new Date(),
    };

    dispatch({ type: "ADD_PENDING", payload: newOrder });
    eventBus.emit(ORDER_EVENTS.ORDER_CREATED, newOrder);
  }, []);

  const getNextOrder = useCallback(() => {
    return state.pending.length > 0 ? state.pending[0] : null;
  }, [state.pending]);

  const moveOrderFromPendingToProcess = useCallback((orderId: number) => {
    dispatch({ type: "MOVE_TO_PROCESSING", payload: orderId });
  }, []);

  const moveOrderFromProcessToComplete = useCallback((orderId: number) => {
    dispatch({ type: "MOVE_TO_COMPLETE", payload: orderId });
  }, []);

  const moveOrderFromProcessToPending = useCallback((orderId: number) => {
    dispatch({ type: "MOVE_TO_PENDING", payload: orderId });
    const order = state.processing.find((o) => o.id === orderId);
    if (!order) return;
    eventBus.emit(ORDER_EVENTS.ORDER_MOVED_TO_PENDING, order);
  }, [state.processing]);

  const setCompleteOrders = useCallback((orders: Order[]) => {
    dispatch({ type: "SET_COMPLETE", payload: orders });
  }, []);

  return {
    createOrder,
    getNextOrder,
    moveOrderFromProcessToComplete,
    moveOrderFromProcessToPending,
    moveOrderFromPendingToProcess,
    setCompleteOrders,
    pendingOrders: state.pending,
    processingOrders: state.processing,
    completeOrders: state.complete,
  };
};
