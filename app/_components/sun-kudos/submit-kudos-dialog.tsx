"use client";

/**
 * submit-kudos-dialog.tsx
 * Modal dialog for creating a Kudos ("Gửi lời chúc Kudos").
 * Light/cream theme — MoMorph screen JsTvi8KVQA.
 *
 * Phase 04/05 scope: static layout + local form state only.
 * Phase 06 wires submit logic, Tiptap, @mention data source, and server actions.
 *
 * Integration contract (Phase 06):
 *   Payload type  → KudosFormPayload (= SubmitKudosInput from lib/data/types)
 *   onSubmit prop → (payload: KudosFormPayload) => Promise<void>
 *   message field → "message" key carries the raw HTML string from the editor
 *   Callback props that must NOT change signatures:
 *     sunnerSearch, onUpload, onSubmit, onClose, initialRecipient
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { Department, Hashtag, SubmitKudosInput, UserProfile } from "@/lib/data/types";
import { RecipientPicker } from "./recipient-picker";
import {
  DanhHieuInput, SmallHashtagPicker, ImageStrip, AnonymousBlock,
} from "./submit-kudos-dialog-fields";
import { DialogHeader, DialogActions, C, FM } from "./submit-kudos-dialog-chrome";
import { KudosRichEditor } from "./kudos-rich-editor";

/* ------------------------------------------------------------------ */
/* Public payload type                                                  */
/* Alias of SubmitKudosInput so callers import one name from here.    */
/* "message" carries the raw HTML string from the rich editor.        */
/* ------------------------------------------------------------------ */

export type KudosFormPayload = SubmitKudosInput;

/* ------------------------------------------------------------------ */
/* Public props                                                         */
/* ------------------------------------------------------------------ */

export type SubmitKudosDialogProps = {
  open: boolean;
  onClose: () => void;
  /** Hashtags for the small chip picker (required ≥1). */
  smallHashtags: Hashtag[];
  /**
   * Optional — accepted for forward-compatibility with live-board-client
   * which still passes them. Not rendered until Phase 06.
   */
  featureHashtags?: Hashtag[];
  departments?: Department[];
  /** Debounced autocomplete sunner search. */
  sunnerSearch: (q: string) => Promise<UserProfile[]>;
  /** Upload a single image file, return its storage path. */
  onUpload: (file: File) => Promise<string>;
  /**
   * Submit handler — Phase 06 wires to server action.
   * Receives KudosFormPayload (= SubmitKudosInput).
   */
  onSubmit: (payload: KudosFormPayload) => Promise<void>;
  /** Pre-fill recipient (e.g. opened via ?compose=<userId> deep-link). */
  initialRecipient?: UserProfile | null;
};

/* ------------------------------------------------------------------ */
/* Form-error shape                                                     */
/* ------------------------------------------------------------------ */

type FormErrors = {
  recipient?: string;
  title?: string;
  message?: string;
  hashtags?: string;
  images?: string;
  nickname?: string;
};

/* ------------------------------------------------------------------ */
/* Component                                                            */
/* ------------------------------------------------------------------ */

export function SubmitKudosDialog({
  open,
  onClose,
  smallHashtags,
  sunnerSearch,
  onUpload,
  onSubmit,
  initialRecipient,
}: SubmitKudosDialogProps) {
  /* ---- form state ---- */
  const [recipient, setRecipient] = useState<UserProfile | null>(initialRecipient ?? null);
  const [title, setTitle] = useState("");
  /* "messageHtml" maps to the "message" key in SubmitKudosInput (raw HTML) */
  const [messageHtml, setMessageHtml] = useState("");
  const [smallHashtagIds, setSmallHashtagIds] = useState<string[]>([]);
  const [imagePaths, setImagePaths] = useState<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [anonymousNickname, setAnonymousNickname] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);

  /* Reset on close */
  useEffect(() => {
    if (!open) {
      setRecipient(initialRecipient ?? null);
      setTitle("");
      setMessageHtml("");
      setSmallHashtagIds([]);
      setImagePaths([]);
      setImagePreviews([]);
      setIsAnonymous(false);
      setAnonymousNickname("");
      setErrors({});
      setSubmitting(false);
    }
  }, [open, initialRecipient]);

  /* Focus + Escape */
  useEffect(() => { if (open) dialogRef.current?.focus(); }, [open]);
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onClose]);

  /* Validation */
  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!recipient) e.recipient = "Vui lòng chọn người nhận.";
    if (!title.trim()) e.title = "Vui lòng nhập danh hiệu.";
    const plainText = messageHtml.replace(/<[^>]+>/g, "").trim();
    if (plainText.length < 1) e.message = "Lời cảm ơn không được để trống.";
    else if (plainText.length > 1000) e.message = "Lời cảm ơn tối đa 1.000 ký tự.";
    if (smallHashtagIds.length < 1) e.hashtags = "Vui lòng chọn ít nhất 1 hashtag.";
    if (isAnonymous && !anonymousNickname.trim()) {
      e.nickname = "Vui lòng nhập nickname ẩn danh.";
    }
    return e;
  };

  const canSubmit =
    !!recipient &&
    title.trim().length > 0 &&
    messageHtml.replace(/<[^>]+>/g, "").trim().length > 0 &&
    smallHashtagIds.length >= 1 &&
    !submitting &&
    !uploading;

  /* Image handlers */
  const handleAddImage = useCallback(async (file: File) => {
    if (imagePaths.length >= 5) return;
    const preview = URL.createObjectURL(file);
    setUploading(true);
    try {
      const path = await onUpload(file);
      setImagePaths((p) => [...p, path]);
      setImagePreviews((p) => [...p, preview]);
    } catch (err) {
      URL.revokeObjectURL(preview);
      console.error("Kudos image upload failed:", err);
      setErrors((e) => ({ ...e, images: "Tải ảnh thất bại, vui lòng thử lại." }));
    } finally {
      setUploading(false);
    }
  }, [imagePaths.length, onUpload]);

  const handleRemoveImage = useCallback((idx: number) => {
    setImagePaths((p) => p.filter((_, i) => i !== idx));
    setImagePreviews((p) => {
      URL.revokeObjectURL(p[idx]);
      return p.filter((_, i) => i !== idx);
    });
  }, []);

  /* Submit */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    try {
      await onSubmit({
        to_user: recipient!.user_id,
        title: title.trim(),
        message: messageHtml,           /* SubmitKudosInput.message = raw HTML */
        small_hashtag_ids: smallHashtagIds,
        image_paths: imagePaths,
        is_anonymous: isAnonymous,
        anonymous_nickname: isAnonymous ? anonymousNickname.trim() : null,
        mention_user_ids: [],           /* Phase 06: filled by Tiptap Mention */
      });
      onClose();
    } catch (err: unknown) {
      setErrors({
        message: err instanceof Error ? err.message : "Gửi thất bại, vui lòng thử lại.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)" }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="presentation"
    >
      {/* Card — rgba(255,248,225,1), border #998C5F, radius 24px */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        tabIndex={-1}
        className="flex w-full flex-col overflow-hidden outline-none"
        style={{
          maxWidth: "752px",
          maxHeight: "90vh",
          background: C.cardBg,
          border: `1px solid ${C.border}`,
          borderRadius: "24px",
        }}
      >
        <DialogHeader onClose={onClose} />

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-8 overflow-y-auto"
          style={{ padding: "32px 40px", flex: 1 }}
        >
          {/* Người nhận* */}
          <RecipientPicker
            value={recipient}
            onChange={setRecipient}
            sunnerSearch={sunnerSearch}
            error={errors.recipient}
          />

          {/* Danh hiệu* */}
          <DanhHieuInput
            value={title}
            onChange={setTitle}
            error={errors.title}
          />

          {/* Message editor (KudosRichEditor shell — Phase 05) */}
          <div>
            <label
              style={{
                display: "flex", alignItems: "center", gap: "2px",
                marginBottom: "8px",
                fontFamily: FM, fontWeight: 700, fontSize: "22px", lineHeight: "28px",
                color: C.textPrimary,
              }}
            >
              Nội dung
              <span style={{ color: C.errorRed, marginLeft: "1px" }}>*</span>
            </label>
            <KudosRichEditor
              value={messageHtml}
              onChange={setMessageHtml}
              maxChars={1000}
              error={errors.message}
            />
          </div>

          {/* Hashtag* chips */}
          {smallHashtags.length > 0 && (
            <SmallHashtagPicker
              hashtags={smallHashtags}
              selected={smallHashtagIds}
              onChange={setSmallHashtagIds}
              error={errors.hashtags}
            />
          )}

          {/* Image strip */}
          <ImageStrip
            paths={imagePaths}
            previews={imagePreviews}
            uploading={uploading}
            onAdd={handleAddImage}
            onRemove={handleRemoveImage}
            error={errors.images}
          />

          {/* Anonymous block */}
          <AnonymousBlock
            isAnonymous={isAnonymous}
            onToggle={setIsAnonymous}
            nickname={anonymousNickname}
            onNicknameChange={setAnonymousNickname}
            nicknameError={errors.nickname}
          />

          {/* Actions */}
          <DialogActions
            onClose={onClose}
            submitting={submitting}
            canSubmit={canSubmit}
          />
        </form>
      </div>
    </div>
  );
}
