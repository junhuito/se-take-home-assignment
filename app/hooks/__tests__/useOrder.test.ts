import { useOrder } from "../useOrder";
import { renderHook, act } from "@testing-library/react";
import { eventBus } from "../../lib/eventBus";

jest.mock("../../lib/eventBus", () => ({
  eventBus: {
    emit: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
  },
}));

describe("useOrder", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a normal order and add it to pending", () => {
    const { result } = renderHook(() => useOrder());

    act(() => {
      result.current.createOrder("NORMAL");
    });

    expect(result.current.pendingOrders).toHaveLength(1);
    expect(result.current.pendingOrders[0].type).toBe("NORMAL");
    expect(result.current.pendingOrders[0].id).toBe(1);
  });

  it("should create a VIP order and add it to pending", () => {
    const { result } = renderHook(() => useOrder());

    act(() => {
      result.current.createOrder("VIP");
    });

    expect(result.current.pendingOrders).toHaveLength(1);
    expect(result.current.pendingOrders[0].type).toBe("VIP");
  });

  it("should emit ORDER_CREATED event when creating an order", () => {
    const { result } = renderHook(() => useOrder());

    act(() => {
      result.current.createOrder("NORMAL");
    });

    expect(eventBus.emit).toHaveBeenCalledWith(
      "ORDER_CREATED",
      expect.objectContaining({ type: "NORMAL", id: 1 }),
    );
  });

  it("should prioritize VIP orders before NORMAL orders", () => {
    const { result } = renderHook(() => useOrder());

    act(() => {
      result.current.createOrder("NORMAL");
      result.current.createOrder("NORMAL");
      result.current.createOrder("VIP");
    });

    expect(result.current.pendingOrders).toHaveLength(3);
    expect(result.current.pendingOrders[0].type).toBe("VIP");
    expect(result.current.pendingOrders[1].type).toBe("NORMAL");
    expect(result.current.pendingOrders[2].type).toBe("NORMAL");
  });

  it("should maintain FIFO order within same order type", () => {
    const { result } = renderHook(() => useOrder());

    act(() => {
      result.current.createOrder("VIP"); // id 1
      result.current.createOrder("VIP"); // id 2
      result.current.createOrder("NORMAL"); // id 3
    });

    expect(result.current.pendingOrders[0].id).toBe(1); // First VIP
    expect(result.current.pendingOrders[1].id).toBe(2); // Second VIP
    expect(result.current.pendingOrders[2].id).toBe(3); // Normal
  });

  it("should move order from pending to processing", () => {
    const { result } = renderHook(() => useOrder());

    act(() => {
      result.current.createOrder("NORMAL");
    });

    const orderId = result.current.pendingOrders[0].id;

    act(() => {
      result.current.moveOrderFromPendingToProcess(orderId);
    });

    expect(result.current.pendingOrders).toHaveLength(0);
    expect(result.current.processingOrders).toHaveLength(1);
    expect(result.current.processingOrders[0].id).toBe(orderId);
  });

  it("should move order from processing to complete", () => {
    const { result } = renderHook(() => useOrder());

    act(() => {
      result.current.createOrder("NORMAL");
    });

    const orderId = result.current.pendingOrders[0].id;

    act(() => {
      result.current.moveOrderFromPendingToProcess(orderId);
      result.current.moveOrderFromProcessToComplete(orderId);
    });

    expect(result.current.processingOrders).toHaveLength(0);
    expect(result.current.completeOrders).toHaveLength(1);
    expect(result.current.completeOrders[0].id).toBe(orderId);
  });

  it("should move order from processing back to pending", () => {
    const { result } = renderHook(() => useOrder());

    act(() => {
      result.current.createOrder("NORMAL");
    });

    const orderId = result.current.pendingOrders[0].id;

    act(() => {
      result.current.moveOrderFromPendingToProcess(orderId);
      result.current.moveOrderFromProcessToPending(orderId);
    });

    expect(result.current.processingOrders).toHaveLength(0);
    expect(result.current.pendingOrders).toHaveLength(1);
    expect(result.current.pendingOrders[0].id).toBe(orderId);
  });

  it("should return next pending order", () => {
    const { result } = renderHook(() => useOrder());

    act(() => {
      result.current.createOrder("NORMAL");
      result.current.createOrder("VIP");
    });

    const nextOrder = result.current.getNextOrder();
    expect(nextOrder).not.toBeNull();
    expect(nextOrder?.type).toBe("VIP");
  });

  it("should return null when no pending orders", () => {
    const { result } = renderHook(() => useOrder());

    const nextOrder = result.current.getNextOrder();
    expect(nextOrder).toBeNull();
  });

  it("should assign unique incrementing IDs to orders", () => {
    const { result } = renderHook(() => useOrder());

    act(() => {
      result.current.createOrder("NORMAL");
      result.current.createOrder("NORMAL");
      result.current.createOrder("NORMAL");
    });

    expect(result.current.pendingOrders[0].id).toBe(1);
    expect(result.current.pendingOrders[1].id).toBe(2);
    expect(result.current.pendingOrders[2].id).toBe(3);
  });
});
