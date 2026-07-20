"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import styles from "./card-manager.module.css";

const initialValues = {
  name: "",
  company: "",
  title: "",
  email: "",
  phone: "",
  website: "",
  notes: "",
};

type Card = {
  id: string;
  name: string;
  company: string;
  title: string;
  email: string;
  phone: string;
  website: string;
  notes: string;
  image_url: string;
  created_at: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default function CardManager() {
  const [cards, setCards] = useState<Card[]>([]);
  const [values, setValues] = useState(initialValues);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  const isFormValid = useMemo(
    () => values.name.trim().length > 0 && image !== null,
    [values.name, image]
  );

  async function loadCards() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/cards");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "一覧の取得に失敗しました");
      setCards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!image) return;
    setStatus("保存中...");
    setError("");

    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("company", values.company);
    formData.append("title", values.title);
    formData.append("email", values.email);
    formData.append("phone", values.phone);
    formData.append("website", values.website);
    formData.append("notes", values.notes);
    formData.append("image", image);

    try {
      const response = await fetch("/api/cards", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "保存に失敗しました");
      setCards((prev) => [data, ...prev]);
      setValues(initialValues);
      setImage(null);
      setPreview("");
      setStatus("保存しました。");
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
      setStatus("");
    }
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setValues((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setImage(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview("");
    }
  }

  return (
    <main className="card-manager-shell">
      <div className={styles["card-manager-grid"]}>
        <section className={styles["card-manager-form"]}>
          <h1>名刺管理</h1>
          <form onSubmit={handleSubmit}>
            <div className={styles["field-group"]}>
              <label htmlFor="name">氏名</label>
              <input id="name" name="name" value={values.name} onChange={handleInputChange} required />
            </div>
            <div className={styles["field-group"]}>
              <label htmlFor="company">会社名</label>
              <input id="company" name="company" value={values.company} onChange={handleInputChange} />
            </div>
            <div className="field-group">
              <label htmlFor="title">役職</label>
              <input id="title" name="title" value={values.title} onChange={handleInputChange} />
            </div>
            <div className="field-group">
              <label htmlFor="email">メール</label>
              <input id="email" name="email" value={values.email} onChange={handleInputChange} type="email" />
            </div>
            <div className="field-group">
              <label htmlFor="phone">電話</label>
              <input id="phone" name="phone" value={values.phone} onChange={handleInputChange} />
            </div>
            <div className="field-group">
              <label htmlFor="website">Webサイト</label>
              <input id="website" name="website" value={values.website} onChange={handleInputChange} />
            </div>
            <div className="field-group">
              <label htmlFor="notes">メモ</label>
              <textarea id="notes" name="notes" value={values.notes} onChange={handleInputChange} rows={4} />
            </div>
            <div className="field-group">
              <label htmlFor="image">名刺画像</label>
              <input id="image" name="image" type="file" accept="image/*" onChange={handleFileChange} />
            </div>
            {preview && <div className="preview"><img src={preview} alt="preview" /></div>}
            <button type="submit" disabled={!isFormValid}>保存</button>
          </form>
          {status && <p className="notice">{status}</p>}
          {error && <p className="error">{error}</p>}
        </section>

        <section className={styles["card-manager-list"]}>
          <h2>保存済み名刺</h2>
          <button type="button" onClick={loadCards} disabled={loading}>{loading ? "更新中..." : "一覧更新"}</button>
          <div className="cards">
            {cards.map((card) => (
              <article key={card.id} className="card-item">
                <div className="card-thumb">
                  {card.image_url ? <img src={card.image_url} alt={card.name} /> : <div className="placeholder">画像なし</div>}
                </div>
                <div className="card-body">
                  <p><strong>{escapeHtml(card.name)}</strong></p>
                  <p>{escapeHtml(card.company)}</p>
                  <p>{escapeHtml(card.title)}</p>
                  <p>{escapeHtml(card.email)}</p>
                  <p>{escapeHtml(card.phone)}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
