"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import styles from "./PublicIntakeForm.module.css";

export function PublicIntakeForm({ token }) {
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [respondent, setRespondent] = useState("");
  const [anythingElse, setAnythingElse] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let active = true;
    api(`/intake/${encodeURIComponent(token)}`)
      .then((data) => { if (active) setForm(data); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);

  async function submit(event) {
    event.preventDefault();
    if (sending) return;
    setSending(true);
    setError("");
    const body = new FormData();
    body.append("respondent_name", respondent);
    body.append("answers", JSON.stringify(answers));
    body.append("anything_else", anythingElse);
    files.forEach((file) => body.append("files", file));
    try {
      await api(`/intake/${encodeURIComponent(token)}/submissions`, { method: "POST", body });
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.brand}><img src="/assets/nirun_v1.png" alt="Nirun" /><span>Secure data collection</span></header>
      <div className={styles.container}>
        {loading ? <section className={styles.card}><p>Loading the form…</p></section> : null}
        {!loading && !form ? <section className={styles.card}>
          <span className={styles.kicker}>FORM UNAVAILABLE</span>
          <h1>This form link cannot be opened</h1>
          <p>{error || "Ask the report owner for a current link."}</p>
        </section> : null}
        {form && submitted ? <section className={styles.success}>
          <span className={styles.successMark}>✓</span>
          <span className={styles.kicker}>RESPONSE RECEIVED</span>
          <h1>Thank you, {respondent.trim()}.</h1>
          <p>Your response and evidence have been saved for <strong>{form.point.code} · {form.point.name}</strong>. The report team can now review it.</p>
        </section> : null}
        {form && !submitted ? <>
          <section className={styles.heading}>
            <span className={styles.kicker}>DATA POINT · {form.point.code}</span>
            <h1>{form.point.name}</h1>
            <p>{form.project} · {form.period}{form.point.due ? ` · Due ${form.point.due}` : ""}</p>
            <div className={styles.aiNote}><span>✦</span><div><strong>AI suggested questions</strong><p>These questions are a starting point. Add context or explain when information is unavailable.</p></div></div>
          </section>
          <form className={styles.card} onSubmit={submit}>
            <label className={styles.field}>Your name or team<input value={respondent} onChange={(event) => setRespondent(event.target.value)} maxLength={160} required autoComplete="name" placeholder="Name or team" /></label>
            {form.questions.map((question, index) => (
              <label className={styles.field} key={question.id}>
                <span>{index + 1}. {question.label}{question.required ? <b>Required</b> : <small>Optional</small>}</span>
                <textarea
                  value={answers[question.id] || ""}
                  onChange={(event) => setAnswers((previous) => ({ ...previous, [question.id]: event.target.value }))}
                  maxLength={4000}
                  rows={3}
                  required={question.required}
                  placeholder={question.help}
                />
                <small>{question.help}</small>
              </label>
            ))}
            <label className={styles.field}>Supporting files <small>Up to {form.maxFiles} files, {Math.round(form.maxFileSize / 1024 / 1024)} MB each. Files stay private to the report team.</small>
              <input type="file" multiple onChange={(event) => setFiles(Array.from(event.target.files || []).slice(0, form.maxFiles))} />
            </label>
            {files.length ? <div className={styles.fileList}>{files.map((file, index) => <span key={`${file.name}-${index}`}>📎 {file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB</span>)}</div> : null}
            <label className={styles.field}>Anything else?<textarea value={anythingElse} onChange={(event) => setAnythingElse(event.target.value)} maxLength={10000} rows={4} placeholder="Add context, caveats, blockers, or questions for the report team." /></label>
            {error ? <p className={styles.error} role="alert">{error}</p> : null}
            <div className={styles.footer}><p>By submitting, your response is shared with the team preparing this report.</p><button type="submit" disabled={sending}>{sending ? "Sending…" : "Submit response"}</button></div>
          </form>
        </> : null}
        <p className={styles.footnote}>Oneput · Annual report data collection</p>
      </div>
    </main>
  );
}
