import { renderHook, act } from "@testing-library/react";
import { useOrderSystem } from "../useOrderSystem";

// Real in-memory event bus so events propagate between hooks
const handlers: Record<string, Array<(...args: unknown[]) => void>> = {};

jest.mock("../../lib/eventBus", () => ({
  eventBus: {
    emit: jest.fn((event: string, ...args: unknown[]) => {
      (handlers[event] || []).forEach((h) => h(...args));
    }),
    on: jest.fn((event: string, handler: (...args: unknown[]) => void) => {
      if (!handlers[event]) handlers[event] = [];
      handlers[event].push(handler);
    }),
    off: jest.fn((event: string, handler: (...args: unknown[]) => void) => {
      handlers[event] = (handlers[event] || []).filter((h) => h !== handler);
    }),
    removeAllListeners: jest.fn(),
  },
}));

describe("useOrderSystem", () => {
  beforeEach(() => {
    Object.keys(handlers).forEach((k) => delete handlers[k]);
    jest.clearAllMocks();
  });

  it("should handle normal order creation", () => {
    const { result } = renderHook(() => useOrderSystem());

    expect(result.current.pendingOrders).toHaveLength(0);

    act(() => {
      result.current.createOrder("NORMAL");
    });

    expect(result.current.pendingOrders).toHaveLength(1);
    expect(result.current.pendingOrders[0].type).toBe("NORMAL");
  });

  it("should prioritize VIP orders", () => {
    const { result } = renderHook(() => useOrderSystem());

    act(() => {
      result.current.createOrder("NORMAL");
      result.current.createOrder("NORMAL");
      result.current.createOrder("VIP");
    });

    expect(result.current.pendingOrders[0].type).toBe("VIP");
    expect(result.current.pendingOrders[1].type).toBe("NORMAL");
    expect(result.current.pendingOrders[2].type).toBe("NORMAL");
  });

  it("should add bots that process orders", () => {
    const { result } = renderHook(() => useOrderSystem());

    act(() => {
      result.current.createOrder("NORMAL");
    });

    expect(result.current.bots).toHaveLength(0);
    expect(result.current.pendingOrders).toHaveLength(1);

    act(() => {
      result.current.addBot();
    });

    expect(result.current.bots).toHaveLength(1);
  });

  it("should remove the newest bot", () => {
    const { result } = renderHook(() => useOrderSystem());

    act(() => {
      result.current.addBot();
      result.current.addBot();
      result.current.addBot();
    });

    expect(result.current.bots).toHaveLength(3);

    act(() => {
      result.current.removeBot();
    });

    expect(result.current.bots).toHaveLength(2);
    expect(result.current.bots.every((bot) => bot.id !== 3)).toBe(true);
  });

  it("should handle multiple order types in correct order", () => {
    const { result } = renderHook(() => useOrderSystem());

    act(() => {
      result.current.createOrder("NORMAL");
      result.current.createOrder("VIP");
      result.current.createOrder("NORMAL");
      result.current.createOrder("VIP");
      result.current.createOrder("VIP");
    });

    expect(result.current.pendingOrders[0].type).toBe("VIP");
    expect(result.current.pendingOrders[1].type).toBe("VIP");
    expect(result.current.pendingOrders[2].type).toBe("VIP");
    expect(result.current.pendingOrders[3].type).toBe("NORMAL");
    expect(result.current.pendingOrders[4].type).toBe("NORMAL");
  });

  it("should not allow removal when no bots exist", () => {
    const { result } = renderHook(() => useOrderSystem());

    expect(result.current.bots).toHaveLength(0);

    act(() => {
      result.current.removeBot();
    });

    expect(result.current.bots).toHaveLength(0);
  });

  it("should move order to processing when a bot is added", () => {
    const { result } = renderHook(() => useOrderSystem());

    act(() => {
      result.current.createOrder("NORMAL");
    });

    expect(result.current.pendingOrders).toHaveLength(1);
    expect(result.current.processingOrders).toHaveLength(0);

    act(() => {
      result.current.addBot();
    });

    expect(result.current.pendingOrders).toHaveLength(0);
    expect(result.current.processingOrders).toHaveLength(1);
    expect(result.current.bots[0].status).toBe("PROCESSING");
  });

  it("should move order to complete after bot finishes processing", () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useOrderSystem());

    act(() => {
      result.current.createOrder("NORMAL");
    });
    act(() => {
      result.current.addBot();
    });

    expect(result.current.processingOrders).toHaveLength(1);
    expect(result.current.completeOrders).toHaveLength(0);

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(result.current.processingOrders).toHaveLength(0);
    expect(result.current.completeOrders).toHaveLength(1);
    expect(result.current.bots[0].status).toBe("IDLE");

    jest.useRealTimers();
  });

  it("should bot automatically pick up next order after completing one", () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useOrderSystem());

    act(() => {
      result.current.createOrder("NORMAL");
      result.current.createOrder("NORMAL");
    });
    act(() => {
      result.current.addBot();
    });

    expect(result.current.processingOrders).toHaveLength(1);
    expect(result.current.pendingOrders).toHaveLength(1);

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(result.current.completeOrders).toHaveLength(1);
    expect(result.current.processingOrders).toHaveLength(1);
    expect(result.current.pendingOrders).toHaveLength(0);

    jest.useRealTimers();
  });
});
