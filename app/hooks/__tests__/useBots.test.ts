import { useBots, BOT_EVENTS } from "../useBots";
import { renderHook, act } from "@testing-library/react";
import { eventBus } from "../../lib/eventBus";

jest.mock("../../lib/eventBus", () => ({
  eventBus: {
    emit: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
  },
}));

describe("useBots", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should add a bot", () => {
    const { result } = renderHook(() => useBots());

    act(() => {
      result.current.addBot();
    });

    expect(result.current.bots).toHaveLength(1);
    expect(result.current.bots[0].id).toBe(1);
    expect(result.current.bots[0].status).toBe("IDLE");
  });

  it("should emit BOT_ADDED event when adding bot", () => {
    const { result } = renderHook(() => useBots());

    act(() => {
      result.current.addBot();
    });

    expect(eventBus.emit).toHaveBeenCalledWith(
      BOT_EVENTS.BOT_ADDED,
      expect.objectContaining({ id: 1, status: "IDLE" }),
    );
  });

  it("should assign unique incrementing IDs to bots", () => {
    const { result } = renderHook(() => useBots());

    act(() => {
      result.current.addBot();
      result.current.addBot();
      result.current.addBot();
    });

    expect(result.current.bots[0].id).toBe(1);
    expect(result.current.bots[1].id).toBe(2);
    expect(result.current.bots[2].id).toBe(3);
  });

  it("should remove the last added bot", () => {
    const { result } = renderHook(() => useBots());

    act(() => {
      result.current.addBot();
      result.current.addBot();
    });

    expect(result.current.bots).toHaveLength(2);

    act(() => {
      result.current.removeBot();
    });

    expect(result.current.bots).toHaveLength(1);
    expect(result.current.bots[0].id).toBe(1);
  });

  it("should emit BOT_REMOVED event when removing bot", () => {
    const { result } = renderHook(() => useBots());

    act(() => {
      result.current.addBot();
    });

    jest.clearAllMocks();

    act(() => {
      result.current.removeBot();
    });

    expect(eventBus.emit).toHaveBeenCalledWith(
      BOT_EVENTS.BOT_REMOVED,
      expect.objectContaining({ id: 1, status: "IDLE" }),
    );
  });

  it("should do nothing when removing bot with no bots", () => {
    const { result } = renderHook(() => useBots());

    act(() => {
      result.current.removeBot();
    });

    expect(result.current.bots).toHaveLength(0);
  });

  it("should find idle bot", () => {
    const { result } = renderHook(() => useBots());

    act(() => {
      result.current.addBot();
    });

    const idleBot = result.current.getIdleBot();
    expect(idleBot).not.toBeNull();
    expect(idleBot?.status).toBe("IDLE");
  });

  it("should return null when no idle bots exist", () => {
    const { result } = renderHook(() => useBots());

    act(() => {
      result.current.addBot();
    });

    const bot = result.current.bots[0];

    act(() => {
      result.current.assignOrder(bot, 1);
    });

    const idleBot = result.current.getIdleBot();
    expect(idleBot).toBeNull();
  });

  it("should assign order to bot and mark as PROCESSING", () => {
    const { result } = renderHook(() => useBots());

    act(() => {
      result.current.addBot();
    });

    const bot = result.current.bots[0];

    act(() => {
      result.current.assignOrder(bot, 123);
    });

    expect(result.current.bots[0].status).toBe("PROCESSING");
    expect(result.current.bots[0].currentOrderId).toBe(123);
  });

  it("should complete order after 10 seconds", async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useBots());

    act(() => {
      result.current.addBot();
    });

    const bot = result.current.bots[0];

    act(() => {
      result.current.assignOrder(bot, 123);
    });

    expect(result.current.bots[0].status).toBe("PROCESSING");

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(result.current.bots[0].status).toBe("IDLE");
    expect(result.current.bots[0].currentOrderId).toBeUndefined();
    expect(eventBus.emit).toHaveBeenCalledWith(
      BOT_EVENTS.BOT_COMPLETE_ORDER,
      expect.objectContaining({ id: 1 }),
      123,
    );

    jest.useRealTimers();
  });

  it("should clear timer when bot is removed while processing", () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useBots());

    act(() => {
      result.current.addBot();
    });

    const bot = result.current.bots[0];

    act(() => {
      result.current.assignOrder(bot, 123);
    });

    act(() => {
      result.current.removeBot();
    });

    jest.clearAllMocks();

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    // BOT_COMPLETE_ORDER should not be emitted because timer was cleared
    expect(eventBus.emit).not.toHaveBeenCalledWith(
      BOT_EVENTS.BOT_COMPLETE_ORDER,
      expect.anything(),
      123,
    );

    jest.useRealTimers();
  });
});
