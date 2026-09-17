import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const workshopsQuery = queryOptions({
  queryKey: ["workshops"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("workshops")
      .select("*")
      .order("starts_at", { ascending: true });
    if (error) throw error;
    return data;
  },
});

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(workshopsQuery),
  head: () => ({
    meta: [
      { title: "البيدر — مجتمع وورشات" },
      {
        name: "description",
        content:
          "البيدر مساحة مجتمعية تجمع الناس حول ورشات ولقاءات في الفنون والثقافة والحِرف. تصفح الورشات القادمة واحجز مكانك.",
      },
      { property: "og:title", content: "البيدر — مجتمع وورشات" },
      {
        property: "og:description",
        content: "ورشات ولقاءات مجتمعية في الفنون والثقافة والحِرف. تصفح واحجز مكانك.",
      },
    ],
  }),
  component: HomePage,
});

const dateFmt = new Intl.DateTimeFormat("ar", {
  weekday: "long",
  day: "numeric",
  month: "long",
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

function HomePage() {
  const { data: workshops } = useSuspenseQuery(workshopsQuery);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="mx-auto flex max-w-2xl items-center justify-between px-5 pt-8">
        <span className="font-display text-2xl font-bold text-foreground">البيدر</span>
        <span className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
          مجتمع · ورشات · لقاءات
        </span>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-2xl px-5 pt-14 pb-10 animate-fade-up">
        <div className="cover-wheat relative overflow-hidden rounded-3xl border border-border p-8 sm:p-10">
          <p className="text-sm font-medium text-secondary-foreground/70">أهلاً بك في</p>
          <h1 className="font-display mt-1 text-5xl font-bold leading-tight text-foreground sm:text-6xl">
            البيدر
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-secondary-foreground">
            مساحة مجتمعية تجمعنا حول ما نحب: ورشات صغيرة، حوارات مفتوحة، ولقاءات نتعلم
            فيها من بعضنا. اختر ورشتك واحجز مكانك — بدون تسجيل، بدون تعقيد.
          </p>
        </div>
      </section>

      {/* Workshops */}
      <main className="mx-auto max-w-2xl px-5 pb-20">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-wide text-muted-foreground">
          <span className="inline-block h-2 w-2 rounded-full bg-accent" />
          الورشات القادمة
        </h2>

        <ul className="space-y-3">
          {workshops.map((w, i) => {
            const d = new Date(w.starts_at);
            return (
              <li key={w.id} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <Link
                  to="/workshop/$id"
                  params={{ id: w.id }}
                  className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_30px_oklch(0.5_0.05_70/0.12)]"
                >
                  <div
                    className={`${coverClass[w.cover] ?? "cover-wheat"} flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-2xl`}
                    aria-hidden
                  >
                    {coverEmoji[w.cover] ?? "🌾"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      {dateFmt.format(d)} · {timeFmt.format(d)}
                    </p>
                    <h3 className="mt-0.5 truncate text-base font-semibold text-foreground group-hover:text-primary">
                      {w.title}
                    </h3>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {w.host} · {w.location}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                    {w.category}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <footer className="mt-16 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          البيدر — مساحة تجمعنا 🌾
        </footer>
      </main>
    </div>
  );
}
