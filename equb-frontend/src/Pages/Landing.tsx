import { Link } from "react-router-dom";
import {
  Gem,
  Shield,
  Users,
  Trophy,
  TrendingUp,
  ChevronRight,
  ArrowRight,
  Star,
  Zap,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const FEATURES = [
  {
    icon: Gem,
    title: "Gold-Denominated",
    desc: "Track contributions in grams and karats, not just currency. Real value that lasts.",
  },
  {
    icon: Shield,
    title: "Transparent & Secure",
    desc: "Every contribution is logged and verified. Full accountability for every member.",
  },
  {
    icon: Trophy,
    title: "Fair Draws",
    desc: "Animated wheel ensures completely random and transparent winner selection each round.",
  },
  {
    icon: TrendingUp,
    title: "Live Gold Prices",
    desc: "Know the real-time value of your pool with live gold market pricing.",
  },
  {
    icon: Users,
    title: "Group Management",
    desc: "Manage multiple Equb groups, members, and rounds all from one dashboard.",
  },
  {
    icon: Zap,
    title: "Round Tracking",
    desc: "Automatic round progression with countdown timers and payment status per member.",
  },
];

const STATS = [
  { value: "100%", label: "Transparent" },
  { value: "24K", label: "Gold Standard" },
  { value: "Multi", label: "Group Support" },
  { value: "Real-time", label: "Gold Pricing" },
];

function AnimatedGoldBar({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className="h-1 rounded-full bg-linear-to-r from-amber-500 via-yellow-400 to-amber-600 animate-pulse"
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="theme-hero-bg min-h-screen overflow-x-hidden text-foreground">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-amber-500/8 blur-[120px]" />
        <div className="absolute top-1/2 -right-40 h-[500px] w-[500px] rounded-full bg-emerald-500/8 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-amber-500/6 blur-[100px]" />
      </div>

      <nav className="theme-transition fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-br from-amber-500 to-yellow-600 shadow-lg shadow-amber-500/30">
              <Gem className="h-4 w-4 text-black" />
            </div>
            <span className="text-lg font-bold tracking-tight">GoldEqub</span>
          </div>

          <Link
            to={user ? "/dashboard" : "/login"}
            className="theme-brand-button inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-lg shadow-amber-500/20 transition-all hover:-translate-y-0.5"
          >
            {user ? "Go to Dashboard" : "Get Started"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      <section className="relative px-4 pt-32 pb-24 text-center sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-medium text-amber-500">
            <Star className="h-3 w-3 fill-amber-500" />
            Ethiopia's Gold-Based Digital Equb Platform
          </div>

          <h1 className="mb-6 text-4xl leading-tight font-black sm:text-5xl md:text-6xl">
            Save Together in{" "}
            <span className="relative inline-block">
              <span className="gold-shimmer">Real Gold</span>
              <div className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-linear-to-r from-amber-400 to-yellow-500 opacity-60" />
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            The modern Equb system that tracks your community savings in grams
            of gold — not just money. Transparent, fair, and built for trust.
          </p>

          <div className="mx-auto mb-10 flex max-w-xs justify-center gap-1.5">
            {[0, 200, 400, 600, 800].map((d) => (
              <div key={d} className="flex-1">
                <AnimatedGoldBar delay={d} />
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/dashboard"
              className="theme-brand-button inline-flex w-full items-center justify-center gap-2 rounded-2xl px-8 py-4 text-base font-bold shadow-2xl shadow-amber-500/25 transition-all hover:-translate-y-0.5 hover:shadow-amber-500/40 sm:w-auto"
            >
              Get Started Free
              <ChevronRight className="h-5 w-5" />
            </Link>

            <a
              href="#features"
              className="theme-transition inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card/70 px-8 py-4 text-base font-medium text-card-foreground backdrop-blur-sm hover:bg-muted/80 sm:w-auto"
            >
              See How It Works
            </a>
          </div>
        </div>

        <div className="relative mx-auto mt-20 max-w-3xl">
          <div
            className="theme-hero-overlay absolute inset-0 z-10 pointer-events-none"
            style={{ top: "60%" }}
          />
          <div className="theme-glass overflow-hidden rounded-2xl shadow-2xl">
            <div className="flex items-center gap-3 border-b border-border px-6 py-4">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500/60" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                <div className="h-3 w-3 rounded-full bg-green-500/60" />
              </div>
              <div className="mx-auto h-5 max-w-xs flex-1 rounded-full bg-muted/70" />
            </div>

            <div className="grid grid-cols-2 gap-3 p-6 sm:grid-cols-4">
              {[
                { label: "Active Groups", val: "3", color: "text-amber-500" },
                {
                  label: "Current Round",
                  val: "#3",
                  color: "text-emerald-500",
                },
                { label: "Pool Size", val: "60g", color: "text-amber-500" },
                { label: "Members Paid", val: "9/12", color: "text-blue-500" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-border bg-card/60 p-3 text-center"
                >
                  <p className={`text-xl font-bold ${s.color}`}>{s.val}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex h-24 items-end gap-2 px-6 pb-6">
              {[40, 65, 50, 80, 60, 90, 70, 85, 55, 75, 95, 60].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm bg-gradient-to-t from-amber-600/40 to-amber-400/20"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border px-4 py-16 sm:px-6">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 text-center sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-3xl font-black text-transparent sm:text-4xl">
                {s.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold tracking-widest text-amber-500 uppercase">
              Features
            </p>
            <h2 className="text-3xl font-black sm:text-4xl">
              Everything your Equb group needs
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Built specifically for gold-based rotating savings communities in
              Ethiopia and beyond.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => {
              const Icon = f.icon;

              return (
                <div
                  key={f.title}
                  className="theme-transition rounded-2xl border border-border bg-card/55 p-6 hover:border-amber-500/20 hover:bg-card/80"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 transition-colors group-hover:bg-amber-500/20">
                    <Icon className="h-5 w-5 text-amber-500" />
                  </div>
                  <h3 className="mb-2 text-base font-bold">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-transparent via-amber-500/5 to-transparent px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold tracking-widest text-amber-500 uppercase">
              How It Works
            </p>
            <h2 className="text-3xl font-black sm:text-4xl">
              Simple. Transparent. Powerful.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Create a Group",
                desc: "Set up your Equb group with gold contribution amount, karat, and round schedule.",
              },
              {
                step: "02",
                title: "Track Contributions",
                desc: "Log each member's gold contribution by weight and purity every round.",
              },
              {
                step: "03",
                title: "Draw the Winner",
                desc: "Spin the wheel for a fair, transparent draw to select the round's winner.",
              },
            ].map((s) => (
              <div key={s.step} className="relative text-center">
                <div className="mb-3 text-6xl font-black text-amber-500/12">
                  {s.step}
                </div>
                <h3 className="-mt-4 mb-2 text-lg font-bold">{s.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-yellow-600/5 p-10">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
            <div className="relative">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 shadow-xl shadow-amber-500/30">
                <Gem className="h-7 w-7 text-black" />
              </div>

              <h2 className="mb-4 text-2xl font-black sm:text-3xl">
                Ready to start saving in gold?
              </h2>
              <p className="mb-8 text-muted-foreground">
                Join your community and grow wealth together the trusted Equb
                way.
              </p>

              <Link
                to="/dashboard"
                className="theme-brand-button inline-flex items-center gap-2 rounded-2xl px-8 py-4 font-bold shadow-xl shadow-amber-500/25 transition-all hover:-translate-y-0.5"
              >
                Launch Dashboard
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-4 py-8 text-center sm:px-6">
        <div className="mb-3 flex items-center justify-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600">
            <Gem className="h-3.5 w-3.5 text-black" />
          </div>
          <span className="text-sm font-bold">GoldEqub</span>
        </div>
        <p className="text-xs text-muted-foreground">
          © 2026 GoldEqub. Secure, transparent gold savings for communities.
        </p>
      </footer>
    </div>
  );
}
