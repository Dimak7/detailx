"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

export type PromotionTemplate = {
  label: string;
  subject: string;
  message: string;
};

export function ClientEmailForm({
  client,
  returnTo,
  templates,
}: {
  client: {
    name: string;
    email: string;
  };
  returnTo: string;
  templates: PromotionTemplate[];
}) {
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
  const [subject, setSubject] = useState(templates[0]?.subject || "");
  const [message, setMessage] = useState(templates[0]?.message || "");

  function chooseTemplate(template: PromotionTemplate) {
    setSelectedTemplate(template);
    setSubject(template.subject);
    setMessage(template.message);
  }

  return (
    <form className="mt-4 grid gap-4" action="/api/admin/actions" method="post">
      <input type="hidden" name="action" value="send-client-promotion" />
      <input type="hidden" name="returnTo" value={returnTo} />
      <input type="hidden" name="name" value={client.name} />
      <input type="hidden" name="email" value={client.email} />
      <input type="hidden" name="template" value={selectedTemplate?.label || "Custom"} />

      <div>
        <p className="mb-2 text-xs font-black uppercase tracking-[0.12em] text-steel">Choose a template</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {templates.map((template) => {
            const active = selectedTemplate?.label === template.label;
            return (
              <button
                className={`rounded-lg border px-3 py-3 text-left transition ${active ? "border-red bg-red text-white" : "border-ink/10 bg-smoke text-ink hover:border-red/60"}`}
                key={template.label}
                onClick={() => chooseTemplate(template)}
                type="button"
              >
                <span className="block text-xs font-black uppercase">{template.label}</span>
                <span className={`mt-1 block text-[11px] font-bold leading-4 ${active ? "text-white/80" : "text-steel"}`}>{template.subject}</span>
              </button>
            );
          })}
        </div>
      </div>

      <label className="grid gap-2 text-xs font-black uppercase tracking-[0.12em] text-steel">
        Subject
        <input className="admin-input" name="subject" onChange={(event) => setSubject(event.target.value)} placeholder="Subject" required value={subject} />
      </label>

      <label className="grid gap-2 text-xs font-black uppercase tracking-[0.12em] text-steel">
        Message
        <textarea className="admin-input min-h-36 resize-y leading-6" name="message" onChange={(event) => setMessage(event.target.value)} placeholder="Message" required value={message} />
      </label>

      <div className="rounded-lg bg-smoke p-3 text-xs font-bold leading-5 text-steel">
        Sending to <span className="font-black text-ink">{client.email || "missing email"}</span>. You can edit the subject and message before sending.
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <SubmitButton disabled={!client.email || !subject.trim() || !message.trim()} />
        <button className="rounded-lg border border-ink/10 bg-white px-5 py-3 font-black uppercase text-ink" type="reset" onClick={() => chooseTemplate(templates[0])}>
          Reset
        </button>
      </div>
    </form>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button className="rounded-lg bg-red px-5 py-3 font-black uppercase text-white disabled:cursor-not-allowed disabled:bg-steel" disabled={disabled || pending} type="submit">
      {pending ? "Sending..." : "Send Email"}
    </button>
  );
}
