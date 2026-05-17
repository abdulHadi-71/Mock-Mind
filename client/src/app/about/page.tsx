import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Compass, Medal, Sparkles, Users } from 'lucide-react';
import { SiteHeader } from '@/components/layout/SiteHeader';

const pillars = [
  {
    icon: Sparkles,
    title: 'Realistic Practice',
    description:
      'Sessions are generated from your role, level, and interview type so every run feels relevant.',
  },
  {
    icon: Compass,
    title: 'Clear Direction',
    description:
      'Feedback is structured into strengths, improvement areas, and next-step guidance you can use immediately.',
  },
  {
    icon: Medal,
    title: 'Progress Tracking',
    description:
      'See how your answers improve over time with score history, interview summaries, and session output.',
  },
];

const timeline = [
  'Choose a target role, difficulty, and interview style.',
  'Answer questions with voice or text in a guided session.',
  'Review the AI feedback report and re-run with better answers.',
];

const stats = [
  { label: 'Interview styles', value: '3+' },
  { label: 'Question depth', value: 'Adaptive' },
  { label: 'Feedback focus', value: 'Structured' },
  { label: 'Practice mode', value: 'Voice + text' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteHeader />
      <main className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.16),_transparent_24%),linear-gradient(180deg,_#020617_0%,_#0b1220_100%)]" />

        <section className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20 lg:px-8">
          <div className="animate-slide-up">
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm font-medium text-cyan-200 backdrop-blur">
              About MockMind
            </span>
            <h1 className="mt-6 max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Practice interviews with clarity, structure, and momentum.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              MockMind is built to help candidates run focused mock interviews, understand their
              weak spots, and sharpen answers through repeated practice. It is intentionally simple
              to use, but the experience is designed to feel close to a real interview loop.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="mt-1 text-sm text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                prefetch={false}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 text-sm font-semibold text-slate-950 transition-transform duration-200 hover:-translate-y-0.5"
              >
                Start Practicing <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/"
                prefetch={false}
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Back to Home
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl shadow-slate-950/40 backdrop-blur-xl" />
            <div className="relative overflow-hidden rounded-[2rem] p-4 sm:p-6">
              <div className="relative h-[320px] overflow-hidden rounded-[1.5rem] border border-white/10">
                <Image src="/hero-bg.svg" alt="About MockMind visual" fill className="object-cover" />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {pillars.map(({ icon: Icon, title, description }, index) => (
                  <div
                    key={title}
                    className="animate-fade-in rounded-2xl border border-white/10 bg-slate-950/60 p-4"
                    style={{ animationDelay: `${index * 90}ms` }}
                  >
                    <Icon className="h-5 w-5 text-cyan-300" />
                    <h3 className="mt-3 font-semibold text-white">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">How it works</p>
              <h2 className="mt-2 text-2xl font-bold text-white">A simple loop that keeps improving results</h2>
              <div className="mt-6 space-y-4">
                {timeline.map((step, index) => (
                  <div key={step} className="flex gap-4 rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-400/15 text-sm font-semibold text-cyan-200">
                      {index + 1}
                    </div>
                    <p className="text-sm leading-6 text-slate-300">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                'Role-specific prompts',
                'Feedback summaries',
                'Better answer structure',
                'Repeated practice cycles',
              ].map((item, index) => (
                <div
                  key={item}
                  className="animate-fade-in rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                  <p className="mt-3 text-sm font-medium text-white">{item}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Designed to help candidates practice smarter, not just longer.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="grid gap-4 lg:grid-cols-3">
            {[
              {
                name: 'Focused',
                body: 'Only the information you need is surfaced during the session.',
              },
              {
                name: 'Adaptive',
                body: 'Questions shift based on your role, level, and answer flow.',
              },
              {
                name: 'Practical',
                body: 'Reports and history are presented in a way you can act on quickly.',
              },
            ].map((item, index) => (
              <div
                key={item.name}
                className="animate-fade-in rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Users className="h-5 w-5 text-cyan-300" />
                <h3 className="mt-3 text-lg font-semibold text-white">{item.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{item.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
