import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const workshopQuery = (id: string) =>
  queryOptions({
    queryKey: ["workshop", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workshops")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data;
    },
  });

export const Route = createFileRoute("/workshop/$id")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(workshopQuery(params.id)),
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.title} — البيدر` : "ورشة — البيدر" },
      {
        name: "description",
        content: loaderData?.description ?? "ورشة من ورشات مجتمع البيدر.",
      },
      { property: "og:title", content: loaderData ? `${loaderData.title} — البيدر` : "البيدر" },
      { property: "og:description", content: loaderData?.description ?? "" },
    ],
  }),
  component: WorkshopPage,
});

const dateFmt = new Intl.DateTimeFormat("ar", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});
const timeFmt = new Intl.DateTimeFormat("ar", { hour: "numeric", minute: "2-digit" });

const coverClass: Record<string, string> = {
  calligraphy: "cover-calligraphy",
  dialogue: "cover-dialogue",
  coffee: "cover-coffee",
  books: "cover-books",
  camera: "cover-camera",
  wheat: "cover-wheat",
};

const coverEmoji: Record<string, string> = {
  calligraphy: "✒️",
  dialogue: "💬",
  coffee: "☕",
  books: "📚",
  camera: "📷",
  wheat: "🌾",
};

const bookingSchema = z.object({
  name: z.string().trim().min(2, "الرجاء إدخال الاسم الكامل").max(100),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d][\d\s-]{6,18}$/, "الرجاء إدخال رقم هاتف صحيح"),
  email: z.string().trim().email("الرجاء إدخال بريد إلكتروني صحيح").max(255),
});

type BookingErrors = Partial<Record<"name" | "phone" | "email", string>>;

function WorkshopPage() {
  const { id } = Route.useParams();
  const { data: w } = useSuspenseQuery(workshopQuery(id));
  const d = new Date(w.starts_at);

  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [errors, setErrors] = useState<BookingErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = bookingSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: BookingErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof BookingErrors;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setStatus("submitting");
    const { error } = await supabase.from("bookings").insert({
      workshop_id: w.id,
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email,
    });
    setStatus(error ? "error" : "done");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-2xl items-center justify-between px-5 pt-8">
        <Link to="/" className="font-display text-2xl font-bold text-foreground">
          البيدر
        </Link>
        <Link
          to="/"
          className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary"
        >
          ← كل الورشات
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-5 pt-10 pb-20">
        <div className="animate-fade-up">
          <div
            className={`${coverClass[w.cover] ?? "cover-wheat"} relative flex h-44 items-end overflow-hidden rounded-3xl border border-border p-6 sm:h-56`}
          >
            <span className="text-5xl" aria-hidden>
              {coverEmoji[w.cover] ?? "🌾"}
            </span>
          </div>

          <div className="mt-6">
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              {w.category}
            </span>
            <h1 className="mt-3 text-3xl font-bold leading-snug text-foreground">{w.title}</h1>

            <dl className="mt-5 space-y-3 rounded-2xl border border-border bg-card p-5 text-sm">
              <div className="flex items-center gap-3">
                <span aria-hidden>🗓️</span>
                <div>
                  <dt className="sr-only">التاريخ</dt>
                  <dd className="font-medium text-foreground">{dateFmt.format(d)}</dd>
                  <dd className="text-xs text-muted-foreground">{timeFmt.format(d)}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span aria-hidden>📍</span>
                <div>
                  <dt className="sr-only">المكان</dt>
                  <dd className="font-medium text-foreground">{w.location}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span aria-hidden>🎙️</span>
                <div>
                  <dt className="sr-only">المقدّم</dt>
                  <dd className="font-medium text-foreground">{w.host}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span aria-hidden>🪑</span>
                <div>
                  <dt className="sr-only">المقاعد</dt>
                  <dd className="font-medium text-foreground">
                    {w.capacity} مقعداً — الأماكن محدودة
                  </dd>
                </div>
              </div>
            </dl>

            <p className="mt-6 leading-relaxed text-secondary-foreground">{w.description}</p>
          </div>

          {/* Booking */}
          <section className="mt-10 rounded-3xl border border-border bg-card p-6 sm:p-8">
            {status === "done" ? (
              <div className="py-6 text-center animate-fade-up">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-2xl">
                  🎉
                </div>
                <h2 className="mt-4 text-xl font-bold text-foreground">تم حجز مكانك!</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  شكراً {form.name}. سنرسل تفاصيل الورشة إلى بريدك الإلكتروني قريباً.
                  <br />
                  نراك في البيدر 🌾
                </p>
                <Link
                  to="/"
                  className="mt-6 inline-flex items-center justify-center rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  تصفح ورشات أخرى
                </Link>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-bold text-foreground">احجز مكانك</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  بدون تسجيل أو حساب — فقط اترك معلوماتك وسنحفظ مقعدك.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                  <Field
                    label="الاسم الكامل"
                    name="name"
                    type="text"
                    placeholder="مثال: نور أحمد"
                    value={form.name}
                    error={errors.name}
                    onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                  />
                  <Field
                    label="رقم الهاتف"
                    name="phone"
                    type="tel"
                    placeholder="05xxxxxxxx"
                    value={form.phone}
                    error={errors.phone}
                    onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
                  />
                  <Field
                    label="البريد الإلكتروني"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    value={form.email}
                    error={errors.email}
                    onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                  />

                  {status === "error" && (
                    <p className="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
                      حدث خطأ أثناء الحجز. الرجاء المحاولة مرة أخرى.
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {status === "submitting" ? "جارٍ الحجز…" : "تأكيد الحجز"}
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function Field({
  label,
  name,
  type,
  placeholder,
  value,
  error,
  onChange,
}: {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  value: string;
  error?: string | undefined;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/40"
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
