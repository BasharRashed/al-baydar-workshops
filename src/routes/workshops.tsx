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

export const Route = createFileRoute("/workshops")({
  loader: ({ context }) => context.queryClient.ensureQueryData(workshopsQuery),
  head: () => ({
    meta: [
      { title: "كل الورشات — البيدر" },
      {
        name: "description",
        content: "تصفح جميع ورشات ولقاءات مجتمع البيدر في الفنون والثقافة والحِرف، واحجز مكانك.",
      },
      { property: "og:title", content: "كل الورشات — البيدر" },
      {
        property: "og:description",
        content: "تصفح جميع ورشات ولقاءات مجتمع البيدر في الفنون والثقافة والحِرف، واحجز مكانك.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WorkshopsPage,
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

function WorkshopsPage() {
  const { data: workshops } = useSuspenseQuery(workshopsQuery);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/60">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-5 sm:px-8">
          <Link to="/" className="font-display text-2xl font-bold text-foreground">
            البيدر
          </Link>
          <span className="border border-border px-3 py-1.5 text-xs text-muted-foreground">
            مجتمع · ورشات · لقاءات
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-14 sm:px-8">
        <div className="mb-9 border-b border-border pb-5">
          <p className="mb-2 text-sm font-semibold text-primary">كل المواعيد</p>
          <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
            جميع الورشات
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            تصفح كل ورشاتنا ولقاءاتنا القادمة واختر ما يشبهك.
          </p>
        </div>

        <ul className="space-y-3">
          {workshops.map((w, i) => {
            const d = new Date(w.starts_at);
            return (
              <li key={w.id} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <Link
                  to="/workshop/$id"
                  params={{ id: w.id }}
                  className="group grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 border-b border-border bg-card p-4 transition-all hover:bg-secondary/25 sm:grid-cols-[auto_minmax(0,1fr)_auto]"
                >
                  <div
                    className={`${coverClass[w.cover] ?? "cover-wheat"} flex h-16 w-16 shrink-0 items-center justify-center rounded-md text-2xl`}
                    aria-hidden
                  >
                    {coverEmoji[w.cover] ?? "🌾"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      {dateFmt.format(d)} · {timeFmt.format(d)}
                    </p>
                    <h2 className="mt-0.5 truncate text-base font-semibold text-foreground group-hover:text-primary">
                      {w.title}
                    </h2>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {w.host} · {w.location}
                    </p>
                  </div>
                  <span className="col-start-2 w-fit shrink-0 bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground sm:col-start-auto">
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
