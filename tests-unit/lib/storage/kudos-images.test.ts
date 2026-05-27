import { describe, it, expect } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  uploadKudosImage,
  getKudosImageSignedUrl,
  createSignedUrlsBatch,
} from "@/lib/storage/kudos-images";
import { createSupabaseMock } from "../../_helpers/supabase-mock";

// ---------------------------------------------------------------------------
// uploadKudosImage
// ---------------------------------------------------------------------------

describe("uploadKudosImage()", () => {
  it("happy path: returns path matching kudosId/<timestamp>.<ext>", async () => {
    const { supabase, storageCalls } = createSupabaseMock();
    const before = Date.now();

    const result = await uploadKudosImage(
      supabase as unknown as SupabaseClient,
      "kudos-123",
      new Uint8Array([1, 2, 3]),
      "image/png"
    );

    const after = Date.now();

    // Path must start with the kudosId segment
    expect(result.path).toMatch(/^kudos-123\/\d+\.png$/);

    // Timestamp embedded in path must be within the test's execution window
    const ts = parseInt(result.path.split("/")[1].split(".")[0], 10);
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);

    // Storage was called with the correct bucket
    expect(storageCalls).toHaveLength(1);
    expect(storageCalls[0].bucket).toBe("kudos-images");
    expect(storageCalls[0].method).toBe("upload");
  });

  it("uses .jpg extension for image/jpeg content-type", async () => {
    const { supabase } = createSupabaseMock();
    const { path } = await uploadKudosImage(
      supabase as unknown as SupabaseClient,
      "kudos-abc",
      new Uint8Array([0xff, 0xd8]),
      "image/jpeg"
    );
    expect(path).toMatch(/\.jpg$/);
  });

  it("uses .webp extension for image/webp content-type", async () => {
    const { supabase } = createSupabaseMock();
    const { path } = await uploadKudosImage(
      supabase as unknown as SupabaseClient,
      "kudos-abc",
      new Uint8Array([]),
      "image/webp"
    );
    expect(path).toMatch(/\.webp$/);
  });

  it("falls back to .jpg for unknown content-type", async () => {
    const { supabase } = createSupabaseMock();
    const { path } = await uploadKudosImage(
      supabase as unknown as SupabaseClient,
      "kudos-xyz",
      new Uint8Array([]),
      "application/octet-stream"
    );
    expect(path).toMatch(/\.jpg$/);
  });

  it("passes upsert:false in upload options", async () => {
    const { supabase, storageCalls } = createSupabaseMock();
    await uploadKudosImage(
      supabase as unknown as SupabaseClient,
      "kudos-opts",
      new ArrayBuffer(4),
      "image/png"
    );
    const opts = storageCalls[0].args[2] as { contentType: string; upsert: boolean };
    expect(opts.upsert).toBe(false);
    expect(opts.contentType).toBe("image/png");
  });

  it("throws when storage returns an error", async () => {
    const storageError = { code: "storage/unauthorized", message: "Unauthorized" };
    const { supabase } = createSupabaseMock({
      storage: {
        upload: () => ({ data: null, error: storageError }),
      },
    });

    await expect(
      uploadKudosImage(
        supabase as unknown as SupabaseClient,
        "kudos-err",
        new Uint8Array([]),
        "image/png"
      )
    ).rejects.toEqual(storageError);
  });
});

// ---------------------------------------------------------------------------
// getKudosImageSignedUrl
// ---------------------------------------------------------------------------

describe("getKudosImageSignedUrl()", () => {
  it("happy path: returns signed URL from storage", async () => {
    const { supabase } = createSupabaseMock();
    const url = await getKudosImageSignedUrl(
      supabase as unknown as SupabaseClient,
      "kudos-123/1700000000000.png"
    );
    // Default mock returns `signed://<path>`
    expect(url).toBe("signed://kudos-123/1700000000000.png");
  });

  it("calls createSignedUrl on the kudos-images bucket with correct args", async () => {
    const { supabase, storageCalls } = createSupabaseMock();
    await getKudosImageSignedUrl(
      supabase as unknown as SupabaseClient,
      "kudos-123/img.png",
      7200
    );
    expect(storageCalls).toHaveLength(1);
    expect(storageCalls[0].bucket).toBe("kudos-images");
    expect(storageCalls[0].method).toBe("createSignedUrl");
    expect(storageCalls[0].args[0]).toBe("kudos-123/img.png");
    expect(storageCalls[0].args[1]).toBe(7200);
  });

  it("uses default expiresIn of 3600 when not specified", async () => {
    const { supabase, storageCalls } = createSupabaseMock();
    await getKudosImageSignedUrl(
      supabase as unknown as SupabaseClient,
      "kudos-123/img.png"
    );
    expect(storageCalls[0].args[1]).toBe(3600);
  });

  it("throws when storage returns an error", async () => {
    const storageError = { code: "not-found", message: "Object not found" };
    const { supabase } = createSupabaseMock({
      storage: {
        createSignedUrl: () => ({ data: null, error: storageError }),
      },
    });
    await expect(
      getKudosImageSignedUrl(
        supabase as unknown as SupabaseClient,
        "kudos-123/missing.png"
      )
    ).rejects.toEqual(storageError);
  });

  it("throws when data has no signedUrl", async () => {
    const { supabase } = createSupabaseMock({
      storage: {
        createSignedUrl: () => ({ data: { signedUrl: "" }, error: null }),
      },
    });
    await expect(
      getKudosImageSignedUrl(
        supabase as unknown as SupabaseClient,
        "kudos-123/empty.png"
      )
    ).rejects.toThrow("No signed URL returned for path: kudos-123/empty.png");
  });

  it("throws when data is null", async () => {
    const { supabase } = createSupabaseMock({
      storage: {
        createSignedUrl: () => ({ data: null, error: null }),
      },
    });
    await expect(
      getKudosImageSignedUrl(
        supabase as unknown as SupabaseClient,
        "kudos-123/null.png"
      )
    ).rejects.toThrow(/No signed URL returned/);
  });
});

// ---------------------------------------------------------------------------
// createSignedUrlsBatch
// ---------------------------------------------------------------------------

describe("createSignedUrlsBatch()", () => {
  it("returns empty array immediately for empty input — no storage call", async () => {
    const { supabase, storageCalls } = createSupabaseMock();
    const result = await createSignedUrlsBatch(
      supabase as unknown as SupabaseClient,
      []
    );
    expect(result).toEqual([]);
    expect(storageCalls).toHaveLength(0);
  });

  it("happy path: returns signed URLs in the same order as input paths", async () => {
    const paths = ["kudos/k1/a.jpg", "kudos/k1/b.png", "kudos/k1/c.webp"];
    const { supabase } = createSupabaseMock();
    const result = await createSignedUrlsBatch(
      supabase as unknown as SupabaseClient,
      paths
    );
    // Default mock returns `signed://<path>` for each
    expect(result).toEqual([
      "signed://kudos/k1/a.jpg",
      "signed://kudos/k1/b.png",
      "signed://kudos/k1/c.webp",
    ]);
  });

  it("calls createSignedUrls on kudos-images bucket with all paths", async () => {
    const paths = ["kudos/k1/x.jpg", "kudos/k1/y.jpg"];
    const { supabase, storageCalls } = createSupabaseMock();
    await createSignedUrlsBatch(supabase as unknown as SupabaseClient, paths);
    expect(storageCalls).toHaveLength(1);
    expect(storageCalls[0].bucket).toBe("kudos-images");
    expect(storageCalls[0].method).toBe("createSignedUrls");
    expect(storageCalls[0].args[0]).toEqual(paths);
  });

  it("uses default expiresIn of 3600", async () => {
    const { supabase, storageCalls } = createSupabaseMock();
    await createSignedUrlsBatch(
      supabase as unknown as SupabaseClient,
      ["kudos/k1/z.jpg"]
    );
    expect(storageCalls[0].args[1]).toBe(3600);
  });

  it("falls back to empty string for paths missing from the response", async () => {
    const paths = ["kudos/k1/present.jpg", "kudos/k1/missing.jpg"];
    const { supabase } = createSupabaseMock({
      storage: {
        createSignedUrls: () => ({
          // Only returns one item; the second path is absent
          data: [{ path: "kudos/k1/present.jpg", signedUrl: "https://cdn/present.jpg", error: null }],
          error: null,
        }),
      },
    });
    const result = await createSignedUrlsBatch(
      supabase as unknown as SupabaseClient,
      paths
    );
    expect(result[0]).toBe("https://cdn/present.jpg");
    expect(result[1]).toBe("");
  });

  it("falls back to empty string when an item has no signedUrl", async () => {
    const paths = ["kudos/k1/a.jpg"];
    const { supabase } = createSupabaseMock({
      storage: {
        createSignedUrls: () => ({
          data: [{ path: "kudos/k1/a.jpg", signedUrl: null, error: { message: "Forbidden" } }],
          error: null,
        }),
      },
    });
    const result = await createSignedUrlsBatch(
      supabase as unknown as SupabaseClient,
      paths
    );
    expect(result[0]).toBe("");
  });

  it("throws when storage returns a top-level error", async () => {
    const storageError = { code: "bucket-not-found", message: "Bucket not found" };
    const { supabase } = createSupabaseMock({
      storage: {
        createSignedUrls: () => ({ data: null, error: storageError }),
      },
    });
    await expect(
      createSignedUrlsBatch(
        supabase as unknown as SupabaseClient,
        ["kudos/k1/img.jpg"]
      )
    ).rejects.toEqual(storageError);
  });

  it("preserves original order even when response order differs", async () => {
    const paths = ["kudos/k1/first.jpg", "kudos/k1/second.jpg", "kudos/k1/third.jpg"];
    const { supabase } = createSupabaseMock({
      storage: {
        createSignedUrls: () => ({
          // Response is in reverse order
          data: [
            { path: "kudos/k1/third.jpg", signedUrl: "https://cdn/third", error: null },
            { path: "kudos/k1/first.jpg", signedUrl: "https://cdn/first", error: null },
            { path: "kudos/k1/second.jpg", signedUrl: "https://cdn/second", error: null },
          ],
          error: null,
        }),
      },
    });
    const result = await createSignedUrlsBatch(
      supabase as unknown as SupabaseClient,
      paths
    );
    expect(result).toEqual([
      "https://cdn/first",
      "https://cdn/second",
      "https://cdn/third",
    ]);
  });
});
