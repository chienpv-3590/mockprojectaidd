"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Department, Hashtag, UserProfile } from "@/lib/data/types";
import { RecipientPicker } from "./recipient-picker";
import {
  FeatureHashtagSelect, SmallHashtagPicker, MessageArea, ImageStrip,
} from "./submit-kudos-dialog-fields";
import { DialogHeader, DialogActions } from "./submit-kudos-dialog-chrome";

/* ------------------------------------------------------------------ */
/* Public types                                                         */
/* ------------------------------------------------------------------ */

export type SubmitKudosDialogProps = {
  open: boolean;
  onClose: () => void;
  departments: Department[];
  featureHashtags: Hashtag[];
  smallHashtags: Hashtag[];
  sunnerSearch: (q: string) => Promise<UserProfile[]>;
  onUpload: (file: File) => Promise<string>;
  onSubmit: (input: {
    to_user: string;
    message: string;
    feature_hashtag_id: string;
    small_hashtag_ids: string[];
    image_paths: string[];
  }) => Promise<void>;
};

type FormErrors = {
  recipient?: string; featureHashtag?: string; message?: string; images?: string;
};

/* ------------------------------------------------------------------ */
/* Component                                                            */
/* ------------------------------------------------------------------ */

export function SubmitKudosDialog({
  open, onClose, featureHashtags, smallHashtags, sunnerSearch, onUpload, onSubmit,
}: SubmitKudosDialogProps) {
  const [recipient, setRecipient] = useState<UserProfile | null>(null);
  const [featureHashtagId, setFeatureHashtagId] = useState("");
  const [smallHashtagIds, setSmallHashtagIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [imagePaths, setImagePaths] = useState<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  /* Reset on close */
  useEffect(() => {
    if (!open) {
      setRecipient(null); setFeatureHashtagId(""); setSmallHashtagIds([]);
      setMessage(""); setImagePaths([]); setImagePreviews([]);
      setErrors({}); setSubmitting(false);
    }
  }, [open]);

  /* Focus trap + Escape */
  useEffect(() => { if (open) dialogRef.current?.focus(); }, [open]);
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onClose]);

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!recipient) e.recipient = "Vui lòng chọn người nhận.";
    if (!featureHashtagId) e.featureHashtag = "Vui lòng chọn hạng mục.";
    const t = message.trim();
    if (t.length < 1) e.message = "Lời cảm ơn không được để trống.";
    else if (t.length > 2000) e.message = "Lời cảm ơn tối đa 2000 ký tự.";
    return e;
  };

  const canSubmit = !!recipient && !!featureHashtagId && message.trim().length >= 1
    && !submitting && !uploading;

  const handleAddImage = useCallback(async (file: File) => {
    if (imagePaths.length >= 5) return;
    const preview = URL.createObjectURL(file);
    setUploading(true);
    try {
      const path = await onUpload(file);
      setImagePaths((p) => [...p, path]);
      setImagePreviews((p) => [...p, preview]);
    } catch {
      setErrors((e) => ({ ...e, images: "Tải ảnh thất bại, vui lòng thử lại." }));
    } finally {
      setUploading(false);
    }
  }, [imagePaths.length, onUpload]);

  const handleRemoveImage = useCallback((idx: number) => {
    setImagePaths((p) => p.filter((_, i) => i !== idx));
    setImagePreviews((p) => { URL.revokeObjectURL(p[idx]); return p.filter((_, i) => i !== idx); });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    try {
      await onSubmit({
        to_user: recipient!.user_id,
        message: message.trim(),
        feature_hashtag_id: featureHashtagId,
        small_hashtag_ids: smallHashtagIds,
        image_paths: imagePaths,
      });
      onClose();
    } catch (err: unknown) {
      setErrors({ message: err instanceof Error ? err.message : "Gửi thất bại, vui lòng thử lại." });
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(2px)" }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="presentation">

      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="dialog-title"
        tabIndex={-1}
        className="flex w-full flex-col overflow-hidden outline-none"
        style={{ maxWidth: "672px", maxHeight: "90vh", background: "#071828",
          border: "1px solid #2E3940", borderRadius: "16px" }}>

        <DialogHeader onClose={onClose} />

        <form onSubmit={handleSubmit} noValidate
          className="flex flex-col gap-5 overflow-y-auto"
          style={{ padding: "24px", flex: 1 }}>

          <RecipientPicker value={recipient} onChange={setRecipient}
            sunnerSearch={sunnerSearch} error={errors.recipient} />

          <FeatureHashtagSelect hashtags={featureHashtags} value={featureHashtagId}
            onChange={setFeatureHashtagId} error={errors.featureHashtag} />

          {smallHashtags.length > 0 && (
            <SmallHashtagPicker hashtags={smallHashtags} selected={smallHashtagIds}
              onChange={setSmallHashtagIds} />
          )}

          <MessageArea value={message} onChange={setMessage} error={errors.message} />

          <ImageStrip paths={imagePaths} previews={imagePreviews} uploading={uploading}
            onAdd={handleAddImage} onRemove={handleRemoveImage} error={errors.images} />

          <DialogActions onClose={onClose} submitting={submitting} canSubmit={canSubmit} />
        </form>
      </div>
    </div>
  );
}
