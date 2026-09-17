import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import communityHero from "@/assets/community-workshop-hero.jpg";

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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
      <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-[var(--hero-surface)]">
        <img
          src={communityHero}
          alt="مجتمع البيدر يعمل معاً في ورشة فنية"
          width={1920}
          height={1080}
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover object-[35%_center]"
        />
        <div className="hero-scrim-rtl absolute inset-0" />
        <div className="hero-vignette absolute inset-0" />

        <header className="absolute inset-x-0 top-0 z-20 mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-6 sm:px-8 lg:px-12">
          <span className="min-w-0 truncate font-display text-2xl font-bold text-[var(--hero-foreground)]">البيدر</span>
          <span className="shrink-0 border border-[var(--hero-line)] px-3 py-1.5 text-xs text-[var(--hero-muted)]">
            مجتمع · ورشات · لقاءات
          </span>
        </header>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-28 pt-24 sm:px-8 lg:px-12">
          <div className="max-w-2xl animate-fade-up">
            <div className="mb-5 flex items-center gap-3 text-sm font-semibold text-secondary">
              <span className="h-px w-12 bg-secondary" />
              مساحة ثقافية مجتمعية
            </div>
            <h1 className="font-display text-6xl font-bold leading-[1.05] text-[var(--hero-foreground)] sm:text-8xl lg:text-9xl">
              البيدر
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--hero-muted)] sm:text-xl">
              مساحة تجمعنا حول ما نحب؛ ورشات صغيرة، حوارات مفتوحة، ولقاءات نتعلم فيها من بعضنا.
            </p>
          </div>
        </div>

        <Button asChild size="lg" className="absolute bottom-7 left-1/2 z-20 h-auto -translate-x-1/2 rounded-none px-6 py-4">
          <a href="#workshops" aria-label="اكتشف ورشنا وانتقل إلى قائمة الورشات">
            اكتشف ورشنا
            <ChevronDown className="animate-bounce" aria-hidden />
          </a>
        </Button>
      </section>

      {/* Workshops */}
      <main id="workshops" className="scroll-mt-0 px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-4xl">
        <div className="mb-9 flex items-end justify-between gap-6 border-b border-border pb-5">
          <div>
            <p className="mb-2 text-sm font-semibold text-primary">خطوتك التالية</p>
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">الورشات القادمة</h2>
          </div>
          <span className="hidden text-sm text-muted-foreground sm:block">اختر ما يشبهك</span>
        </div>

        <h2 className="sr-only">
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
                    <h3 className="mt-0.5 truncate text-base font-semibold text-foreground group-hover:text-primary">
                      {w.title}
                    </h3>
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
        </div>
      </main>
    </div>
  );
}
