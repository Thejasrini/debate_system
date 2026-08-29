import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function NewCase() {
  const [question, setQuestion] = useState("");
  const [product, setProduct] = useState("");
  const [company, setCompany] = useState("");
  const [amount, setAmount] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    // Generate a temporary threadId or navigate directly to debate stream
    const tempThreadId = `thread_${Date.now()}`;
    navigate(`/debate/${tempThreadId}`, {
      state: { question: question.trim(), product, company, amount }
    });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--bg)", color: "var(--ink)" }}>
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-12 flex-1 w-full space-y-8">
        <div>
          <h1 className="text-3xl font-serif">File a New Consumer Case</h1>
          <p className="text-sm font-mono text-[var(--ink-muted)] mt-1">
            Provide dispute facts to launch the adversarial multi-agent debate pipeline
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Intake Form */}
          <form onSubmit={handleSubmit} className="md:col-span-2 p-6 rounded-xl border border-[var(--line)] bg-[var(--surface)] space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold font-serif">Dispute Summary / Question *</label>
              <textarea
                required
                rows={5}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Describe your dispute in detail (e.g., 'Defective LED TV screen flickering after 3 days of delivery from online seller, refund denied')..."
                className="w-full p-4 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] text-sm focus:border-[var(--brass)] outline-none leading-relaxed"
              />
              <div className="font-mono text-xs text-[var(--ink-muted)] opacity-80">
                💡 Press <strong>Enter</strong> to launch multi-agent debate (<strong>Shift + Enter</strong> for new line)
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-mono text-[var(--ink-muted)]">Product/Service Involved</label>
                <input
                  type="text"
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  placeholder="Smart LED TV 55-inch"
                  className="w-full p-3 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] text-xs focus:border-[var(--brass)] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-[var(--ink-muted)]">Seller / Company Name</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="ElectroMart India Ltd."
                  className="w-full p-3 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] text-xs focus:border-[var(--brass)] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-[var(--ink-muted)]">Claim Amount (Rs.)</label>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="45,000"
                  className="w-full p-3 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] text-xs focus:border-[var(--brass)] outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-lg font-mono text-sm font-semibold bg-[var(--brass)] text-[var(--bg)] hover:bg-[var(--brass-hover)] transition shadow-md"
            >
              Launch Multi-Agent Debate →
            </button>
          </form>

          {/* Live Preview Card */}
          <div className="p-6 rounded-xl border border-[var(--line)] bg-[var(--surface)] space-y-4">
            <div className="border-b border-[var(--line)] pb-3">
              <h3 className="font-serif text-base text-[var(--brass)]">Case Preview</h3>
              <p className="text-xs font-mono text-[var(--ink-muted)]">Consumer Protection Act, 2019</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-mono text-[var(--ink-dim)]">PETITIONER QUESTION:</span>
                <p className="mt-1 font-serif text-[var(--ink)] italic">{question || "Waiting for user input..."}</p>
              </div>

              {product && (
                <div>
                  <span className="font-mono text-[var(--ink-dim)]">PRODUCT:</span>
                  <p className="text-[var(--ink)]">{product}</p>
                </div>
              )}

              {company && (
                <div>
                  <span className="font-mono text-[var(--ink-dim)]">RESPONDENT:</span>
                  <p className="text-[var(--ink)]">{company}</p>
                </div>
              )}

              {amount && (
                <div>
                  <span className="font-mono text-[var(--ink-dim)]">CLAIM VALUE:</span>
                  <p className="text-[var(--brass)] font-mono font-semibold">Rs. {amount}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
