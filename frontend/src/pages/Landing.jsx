import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--bg)", color: "var(--ink)" }}>
      <Navbar />

      {/* Hero Section */}
      <section className="py-20 px-6 max-w-5xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-[var(--line-bright)] bg-[var(--brass-light)] text-[var(--brass)] text-xs font-mono">
          <span>⚖️ Consumer Protection Act, 2019</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-serif leading-tight">
          AI-Powered Multi-Agent <br />
          <span className="text-[var(--brass)]">Consumer Dispute Adjudication</span>
        </h1>
        <p className="text-lg md:text-xl text-[var(--ink-muted)] max-w-2xl mx-auto font-sans leading-relaxed">
          LexAgent employs adversarial legal intelligence (Petitioner Counsel vs. Respondent Counsel) grounded by a 2-layer statutory validator and judicial bench verdict.
        </p>

        <div className="flex items-center justify-center space-x-4 pt-4">
          <Link
            to="/new-case"
            className="px-8 py-3.5 rounded-lg font-mono text-sm font-semibold bg-[var(--brass)] text-[var(--bg)] hover:bg-[var(--brass-hover)] transition shadow-lg"
          >
            Start a Case →
          </Link>
          <Link
            to="/how-it-works"
            className="px-8 py-3.5 rounded-lg font-mono text-sm font-semibold border border-[var(--line)] text-[var(--ink)] hover:border-[var(--brass)] transition"
          >
            How It Works
          </Link>
        </div>
      </section>

      {/* 5-Step Flow */}
      <section className="py-16 border-t border-[var(--line)] bg-[var(--surface)]">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-serif">5-Stage Adjudication Architecture</h2>
            <p className="text-sm font-mono text-[var(--ink-muted)]">From dispute intake to statutory verdict export</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              { step: "01", title: "Intent & Category", desc: "Classifies dispute into CPA 2019 jurisdiction" },
              { step: "02", title: "Hybrid RAG", desc: "Retrieves statutory sections & precedents via FAISS" },
              { step: "03", title: "Adversarial Debate", desc: "Petitioner vs Respondent counsel arguments" },
              { step: "04", title: "Semantic Grounding", desc: "Layer-1 NLI entailment fact-checking" },
              { step: "05", title: "Judicial Bench", desc: "IRAC verdict & court-formatted PDF export" }
            ].map((s) => (
              <div key={s.step} className="p-5 rounded-lg border border-[var(--line)] bg-[var(--bg)] space-y-2">
                <span className="font-mono text-xs text-[var(--brass)]">{s.step}</span>
                <h3 className="font-serif text-base font-medium">{s.title}</h3>
                <p className="text-xs text-[var(--ink-muted)] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-[var(--line)] text-center text-xs font-mono text-[var(--ink-dim)]">
        <p>LexAgent — Consumer Protection Act 2019 Legal Intelligence Platform © 2026</p>
      </footer>
    </div>
  );
}
