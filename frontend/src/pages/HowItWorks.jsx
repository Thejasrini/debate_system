import React, { useState } from "react";
import Navbar from "../components/Navbar";
import BalanceBar from "../components/BalanceBar";

export default function HowItWorks() {
  const [sliderPos, setSliderPos] = useState(0.0);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--bg)", color: "var(--ink)" }}>
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-12 flex-1 w-full space-y-12">
        <div className="text-center space-y-3">
          <span className="font-mono text-xs text-[var(--brass)] uppercase tracking-widest">TECHNICAL ARCHITECTURE</span>
          <h1 className="text-4xl font-serif">How LexAgent Works</h1>
          <p className="text-base text-[var(--ink-muted)] max-w-2xl mx-auto leading-relaxed">
            A multi-agent adversarial debate system for consumer dispute adjudication, built on closed-book RAG and 2-layer statutory grounding.
          </p>
        </div>

        {/* Interactive Balance Bar Demo */}
        <div className="p-8 rounded-xl border border-[var(--line)] bg-[var(--surface)] space-y-6">
          <h2 className="text-xl font-serif border-b border-[var(--line)] pb-3">Interactive Judicial Scale Demo</h2>
          <BalanceBar position={sliderPos} label={`Current Position: ${(sliderPos * 100).toFixed(0)}%`} />
          <div className="flex items-center justify-between text-xs font-mono text-[var(--ink-muted)]">
            <span>← Petitioner Favored (-1.0)</span>
            <input
              type="range"
              min="-1.0"
              max="1.0"
              step="0.05"
              value={sliderPos}
              onChange={(e) => setSliderPos(parseFloat(e.target.value))}
              className="w-1/2 accent-[var(--brass)] cursor-pointer"
            />
            <span>Respondent Favored (+1.0) →</span>
          </div>
        </div>

        {/* 6 Core Modules Breakdown */}
        <div className="space-y-6">
          <h2 className="text-2xl font-serif border-b border-[var(--line)] pb-3">6 Specialized Sub-Agents</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "1. Intent Classifier Agent",
                desc: "Analyzes user query and maps dispute facts into the Consumer Protection Act, 2019 legal ontology."
              },
              {
                title: "2. Case Reasoning Agent",
                desc: "Extracts key legal issues, material facts, and required statutory elements prior to knowledge retrieval."
              },
              {
                title: "3. Closed-Book FAISS RAG",
                desc: "Searches 3,638 normalized statutory chunks and precedents to prevent ungrounded LLM hallucinations."
              },
              {
                title: "4. Petitioner Counsel Agent (Support)",
                desc: "Constructs statutory claims and precedent arguments advocating for the consumer under Section 39."
              },
              {
                title: "5. Respondent Counsel Agent (Oppose)",
                desc: "Constructs defense arguments invoking liability exceptions under Section 87."
              },
              {
                title: "6. Judicial Bench Agent (Judge)",
                desc: "Weighs opposing claims using IRAC reasoning, applies grounding audits, and issues the final court order."
              }
            ].map((m, idx) => (
              <div key={idx} className="p-6 rounded-xl border border-[var(--line)] bg-[var(--surface)] space-y-2">
                <h3 className="font-serif text-lg text-[var(--brass)]">{m.title}</h3>
                <p className="text-sm text-[var(--ink-muted)] leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
