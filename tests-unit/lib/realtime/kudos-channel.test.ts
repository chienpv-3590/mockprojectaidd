import { describe, it, expect, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { subscribeToKudos, subscribeToHearts } from "@/lib/realtime/kudos-channel";

// ---------------------------------------------------------------------------
// Minimal channel mock (inline — shared mock does not include realtime)
// ---------------------------------------------------------------------------

function createChannelMock() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlers: Array<(payload: any) => void> = [];
  let subscribed = false;
  let unsubscribed = false;

  const channel = {
    on: vi.fn((_evt: string, _filter: unknown, handler: (p: unknown) => void) => {
      handlers.push(handler);
      return channel;
    }),
    subscribe: vi.fn(() => {
      subscribed = true;
      return channel;
    }),
    unsubscribe: vi.fn(() => {
      unsubscribed = true;
    }),
  };

  return {
    channel,
    handlers,
    isSubscribed: () => subscribed,
    isUnsubscribed: () => unsubscribed,
  };
}

function buildSupabaseStub(channel: ReturnType<typeof createChannelMock>["channel"]) {
  return {
    channel: vi.fn(() => channel),
  } as unknown as SupabaseClient;
}

// ---------------------------------------------------------------------------
// subscribeToKudos
// ---------------------------------------------------------------------------

describe("subscribeToKudos()", () => {
  it("calls supabase.channel with the realtime:kudos name", () => {
    const mock = createChannelMock();
    const supabase = buildSupabaseStub(mock.channel);

    subscribeToKudos(supabase, vi.fn());

    expect(supabase.channel).toHaveBeenCalledWith("realtime:kudos");
  });

  it("subscribes on the returned channel", () => {
    const mock = createChannelMock();
    const supabase = buildSupabaseStub(mock.channel);

    subscribeToKudos(supabase, vi.fn());

    expect(mock.isSubscribed()).toBe(true);
  });

  it("wires exactly one handler via .on()", () => {
    const mock = createChannelMock();
    const supabase = buildSupabaseStub(mock.channel);

    subscribeToKudos(supabase, vi.fn());

    expect(mock.channel.on).toHaveBeenCalledTimes(1);
  });

  it("registers handler for postgres_changes INSERT on kudos table", () => {
    const mock = createChannelMock();
    const supabase = buildSupabaseStub(mock.channel);

    subscribeToKudos(supabase, vi.fn());

    const [event, filter] = mock.channel.on.mock.calls[0] as [
      string,
      { event: string; schema: string; table: string },
      unknown,
    ];
    expect(event).toBe("postgres_changes");
    expect(filter.event).toBe("INSERT");
    expect(filter.schema).toBe("public");
    expect(filter.table).toBe("kudos");
  });

  it("returns the channel object (for caller unsubscribe)", () => {
    const mock = createChannelMock();
    const supabase = buildSupabaseStub(mock.channel);

    const result = subscribeToKudos(supabase, vi.fn());

    expect(result).toBe(mock.channel);
  });

  it("triggers onInsert callback with payload.new when INSERT fires", () => {
    const mock = createChannelMock();
    const supabase = buildSupabaseStub(mock.channel);
    const onInsert = vi.fn();

    subscribeToKudos(supabase, onInsert);

    const newRow = { id: "k1", message: "Great work!", from_user: "u1", to_user: "u2" };
    // Simulate realtime firing the registered handler
    mock.handlers[0]({ new: newRow });

    expect(onInsert).toHaveBeenCalledTimes(1);
    expect(onInsert).toHaveBeenCalledWith(newRow);
  });

  it("does NOT call onInsert before a payload is received", () => {
    const mock = createChannelMock();
    const supabase = buildSupabaseStub(mock.channel);
    const onInsert = vi.fn();

    subscribeToKudos(supabase, onInsert);

    expect(onInsert).not.toHaveBeenCalled();
  });

  it("forwards subsequent payloads independently", () => {
    const mock = createChannelMock();
    const supabase = buildSupabaseStub(mock.channel);
    const onInsert = vi.fn();

    subscribeToKudos(supabase, onInsert);

    mock.handlers[0]({ new: { id: "k1" } });
    mock.handlers[0]({ new: { id: "k2" } });

    expect(onInsert).toHaveBeenCalledTimes(2);
    expect(onInsert).toHaveBeenNthCalledWith(1, { id: "k1" });
    expect(onInsert).toHaveBeenNthCalledWith(2, { id: "k2" });
  });

  it("returned channel can be unsubscribed by caller", () => {
    const mock = createChannelMock();
    const supabase = buildSupabaseStub(mock.channel);

    const channel = subscribeToKudos(supabase, vi.fn());
    channel.unsubscribe();

    expect(mock.isUnsubscribed()).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// subscribeToHearts
// ---------------------------------------------------------------------------

describe("subscribeToHearts()", () => {
  it("calls supabase.channel with the realtime:kudos_hearts name", () => {
    const mock = createChannelMock();
    const supabase = buildSupabaseStub(mock.channel);

    subscribeToHearts(supabase, vi.fn());

    expect(supabase.channel).toHaveBeenCalledWith("realtime:kudos_hearts");
  });

  it("subscribes on the returned channel", () => {
    const mock = createChannelMock();
    const supabase = buildSupabaseStub(mock.channel);

    subscribeToHearts(supabase, vi.fn());

    expect(mock.isSubscribed()).toBe(true);
  });

  it("wires exactly two handlers via .on() — INSERT and DELETE", () => {
    const mock = createChannelMock();
    const supabase = buildSupabaseStub(mock.channel);

    subscribeToHearts(supabase, vi.fn());

    expect(mock.channel.on).toHaveBeenCalledTimes(2);
  });

  it("first handler targets INSERT on kudos_hearts", () => {
    const mock = createChannelMock();
    const supabase = buildSupabaseStub(mock.channel);

    subscribeToHearts(supabase, vi.fn());

    const [event, filter] = mock.channel.on.mock.calls[0] as [
      string,
      { event: string; schema: string; table: string },
      unknown,
    ];
    expect(event).toBe("postgres_changes");
    expect(filter.event).toBe("INSERT");
    expect(filter.schema).toBe("public");
    expect(filter.table).toBe("kudos_hearts");
  });

  it("second handler targets DELETE on kudos_hearts", () => {
    const mock = createChannelMock();
    const supabase = buildSupabaseStub(mock.channel);

    subscribeToHearts(supabase, vi.fn());

    const [event, filter] = mock.channel.on.mock.calls[1] as [
      string,
      { event: string; schema: string; table: string },
      unknown,
    ];
    expect(event).toBe("postgres_changes");
    expect(filter.event).toBe("DELETE");
    expect(filter.schema).toBe("public");
    expect(filter.table).toBe("kudos_hearts");
  });

  it("returns the channel object (for caller unsubscribe)", () => {
    const mock = createChannelMock();
    const supabase = buildSupabaseStub(mock.channel);

    const result = subscribeToHearts(supabase, vi.fn());

    expect(result).toBe(mock.channel);
  });

  it("INSERT payload triggers onChange with deleted:false and spreads payload.new", () => {
    const mock = createChannelMock();
    const supabase = buildSupabaseStub(mock.channel);
    const onChange = vi.fn();

    subscribeToHearts(supabase, onChange);

    const insertRow = { kudos_id: "k1", user_id: "u1", weight: 2 };
    // handlers[0] is the INSERT handler
    mock.handlers[0]({ new: insertRow });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({
      kudos_id: "k1",
      user_id: "u1",
      weight: 2,
      deleted: false,
    });
  });

  it("DELETE payload triggers onChange with deleted:true and spreads payload.old", () => {
    const mock = createChannelMock();
    const supabase = buildSupabaseStub(mock.channel);
    const onChange = vi.fn();

    subscribeToHearts(supabase, onChange);

    const deletedRow = { kudos_id: "k1", user_id: "u1", weight: 1 };
    // handlers[1] is the DELETE handler
    mock.handlers[1]({ old: deletedRow });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({
      kudos_id: "k1",
      user_id: "u1",
      weight: 1,
      deleted: true,
    });
  });

  it("INSERT and DELETE handlers are independent — each fires onChange once", () => {
    const mock = createChannelMock();
    const supabase = buildSupabaseStub(mock.channel);
    const onChange = vi.fn();

    subscribeToHearts(supabase, onChange);

    mock.handlers[0]({ new: { kudos_id: "k1", user_id: "u1", weight: 1 } });
    mock.handlers[1]({ old: { kudos_id: "k1", user_id: "u1", weight: 1 } });

    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange.mock.calls[0][0].deleted).toBe(false);
    expect(onChange.mock.calls[1][0].deleted).toBe(true);
  });

  it("does NOT call onChange before any payload fires", () => {
    const mock = createChannelMock();
    const supabase = buildSupabaseStub(mock.channel);
    const onChange = vi.fn();

    subscribeToHearts(supabase, onChange);

    expect(onChange).not.toHaveBeenCalled();
  });

  it("returned channel can be unsubscribed by caller", () => {
    const mock = createChannelMock();
    const supabase = buildSupabaseStub(mock.channel);

    const channel = subscribeToHearts(supabase, vi.fn());
    channel.unsubscribe();

    expect(mock.isUnsubscribed()).toBe(true);
  });
});
