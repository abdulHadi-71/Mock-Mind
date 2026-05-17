import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BarChart3, CheckCircle2, Mic, Sparkles, Shield, Star } from 'lucide-react';
import { SiteHeader } from '@/components/layout/SiteHeader';

const features = [
  {
    icon: Mic,
    title: 'AI-Powered Sessions',
    description: 'Realistic mock interviews tailored to your role and experience level.',
  },
  {
    icon: Sparkles,
    title: 'Structured Feedback',
    description: 'Detailed reports with strengths, improvements, and category scores.',
  },
  {
    icon: BarChart3,
    title: 'Performance Tracking',
    description: 'Track your progress over time with historical scores and insights.',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'JWT authentication with refresh tokens and encrypted sessions.',
  },
];

const benefits = [
  'Role-aware questions tailored to your target job.',
  'Instant feedback with strengths, gaps, and next steps.',
  'Voice-first practice with a modern conversational UI.',
  'Track progress over multiple sessions and scores.',
];

const testimonials = [
  {
    name: 'Amina',
    role: 'Frontend Developer',
    quote: 'The sessions feel surprisingly real. The feedback helped me tighten answers fast.',
  },
  {
    name: 'Bilal',
    role: 'Backend Engineer',
    quote: 'The dashboard made it easy to see weak spots and focus my practice.',
  },
  {
    name: 'Sara',
    role: 'Product Analyst',
    quote: 'The flow is polished and the interview prompts are actually useful.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteHeader />
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.20),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.18),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#08101f_48%,_#0b1220_100%)]" />
        <div className="absolute inset-x-0 top-0 -z-10 h-[520px] opacity-90">
          <div className="absolute left-6 top-10 h-32 w-32 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute right-8 top-24 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
        </div>

        <div className="mx-auto grid max-w-6xl gap-14 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20 lg:px-8">
          <section className="animate-slide-up">
            <span className="inline-flex items-center rounded-full border border-cyan-400/20 bg-white/5 px-4 py-1 text-sm font-medium text-cyan-200 backdrop-blur">
              Production-grade SaaS
            </span>
            <h1 className="mt-6 max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-7xl">
              Ace your next interview with{' '}
              <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-300 bg-clip-text text-transparent">
                AI coaching
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300 lg:mx-0">
              MockMind delivers realistic mock interviews, instant structured feedback, and
              performance analytics built for serious job seekers and high-volume teams.
            </p>
            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-start sm:gap-4">
              <Link
                href="/register"
                prefetch={false}
                className="w-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 text-center text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition-transform duration-200 hover:-translate-y-0.5 sm:w-auto"
              >
                Start Free Practice
              </Link>
              <Link
                href="/login"
                prefetch={false}
                className="w-full rounded-full border border-white/10 bg-white/5 px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
              >
                Sign In
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-3 text-sm text-slate-300">
              <div className="flex -space-x-2">
                <span className="h-8 w-8 rounded-full border border-white/10 bg-cyan-400/20" />
                <span className="h-8 w-8 rounded-full border border-white/10 bg-blue-400/20" />
                <span className="h-8 w-8 rounded-full border border-white/10 bg-emerald-400/20" />
              </div>
              <span>Trusted by candidates building confidence before real interviews.</span>
            </div>
          </section>

          <section className="relative">
            <div className="absolute inset-0 -z-10 rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl shadow-slate-950/40 backdrop-blur-xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/60 p-4 shadow-2xl shadow-slate-950/50 lg:p-5">
              <div className="absolute inset-0 opacity-80">
                <Image
                  src="/hero-bg.svg"
                  alt="Mock interview background"
                  fill
                  priority
                  className="object-cover"
                />
              </div>
              <div className="relative grid gap-4 rounded-[1.5rem] bg-slate-950/45 p-4 ring-1 ring-white/10 sm:grid-cols-[1.05fr_0.95fr] sm:p-6">
                <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/70 p-5 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-cyan-200">Live session</span>
                    <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-medium text-emerald-200">
                      AI ready
                    </span>
                  </div>
                  <div className="mt-6 space-y-3">
                    <div className="h-4 w-2/3 rounded-full bg-white/10" />
                    <div className="h-4 w-full rounded-full bg-white/10" />
                    <div className="h-4 w-5/6 rounded-full bg-white/10" />
                  </div>
                  <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
                    <p className="text-sm font-medium text-cyan-100">Question 1</p>
                    <p className="mt-2 text-sm leading-6 text-slate-200">
                      Tell me about a time you improved a slow user experience under pressure.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Feedback</p>
                    <p className="mt-3 text-sm leading-6 text-slate-200">
                      Strong structure, solid examples, and clear impact metrics. Improve brevity.
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Score</p>
                      <p className="mt-2 text-3xl font-bold text-white">92</p>
                    </div>
                    <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Questions</p>
                      <p className="mt-2 text-3xl font-bold text-white">12</p>
                    </div>
                  </div>
                  <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/60 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Next focus</p>
                    <p className="mt-3 text-sm leading-6 text-slate-200">
                      Practice behavioral answers, then move into role-specific technical probes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-6 sm:px-6 lg:grid-cols-3 lg:px-8">
          {benefits.map((item, index) => (
            <div
              key={item}
              className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
                <p className="text-sm leading-6 text-slate-200">{item}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-6 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl shadow-slate-950/20 backdrop-blur-xl sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Inside the platform</p>
                <h2 className="mt-2 text-2xl font-bold text-white">Practice with context, not generic scripts</h2>
              </div>
              <Star className="h-10 w-10 text-cyan-300/80" />
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                'Adaptive question generation',
                'Structured answer scoring',
                'Voice and text input',
                'Session history and replay',
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-0 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
            <div className="relative h-64 sm:h-full min-h-[320px]">
              <Image
                src="/hero-bg.svg"
                alt="MockMind visual preview"
                fill
                className="object-cover opacity-90"
              />
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto grid max-w-6xl gap-4 px-4 pb-16 sm:px-6 lg:grid-cols-4 lg:px-8">
          {features.map(({ icon: Icon, title, description }, index) => (
            <div
              key={title}
              className="animate-fade-in rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-950/20 backdrop-blur-xl"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 ring-1 ring-white/10">
                <Icon className="h-5 w-5 text-cyan-200" />
              </div>
              <h3 className="font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
            </div>
          ))}
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="grid gap-4 lg:grid-cols-3">
            {testimonials.map((item, index) => (
              <div
                key={item.name}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-500/20 text-sm font-bold text-cyan-200">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{item.name}</p>
                    <p className="text-xs text-slate-400">{item.role}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-300">“{item.quote}”</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="border-t border-white/10 bg-slate-950/80">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div>
              <p className="text-sm font-semibold text-white">MockMind</p>
              <p className="mt-1 text-sm text-slate-400">
                AI mock interviews with structured feedback, practice history, and focused growth.
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <Link href="/about" prefetch={false} className="transition-colors hover:text-white">
                About
              </Link>
              <span className="text-white/20">•</span>
              <Link href="/register" prefetch={false} className="transition-colors hover:text-white">
                Get Started
              </Link>
              <span className="text-white/20">•</span>
              <Link href="/login" prefetch={false} className="transition-colors hover:text-white">
                Sign In
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
