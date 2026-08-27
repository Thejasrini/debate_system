import { validateAgentOutput } from "../services/groundingValidator.js";

describe("Module J: Grounding Validator Unit Tests", () => {
  const sampleContext = `
    Consumer Protection Act, 2019 Section 2(10) defines defect.
    Section 39 Orders of the Central Authority.
    Tata Motors Ltd. vs. Antonio Paulo Vaz & Anr., (2021) 4 SCC 300.
  `;

  test("Test case 1: Valid output with grounded sections returns valid: true and 0 errors", () => {
    const output = {
      position: "Consumer entitled to replacement under Section 39.",
      applicable_sections: [{ section: "Section 39", description: "Orders of Central Authority" }],
      arguments: [{ argument: "Defect manifested within 3 days." }]
    };

    const result = validateAgentOutput("Support", output, sampleContext);
    expect(result.grounding_report.valid).toBe(true);
    expect(result.grounding_report.citation_errors).toHaveLength(0);
    expect(result.grounding_report.fabricated_sources).toHaveLength(0);
  });

  test("Test case 2: Flags fabricated precedent case name", () => {
    const output = {
      position: "Respondent denies liability.",
      supporting_precedents: [{ case_name: "Fictional Corp vs Nobody", citation: "2099 Unknown 999" }]
    };

    const result = validateAgentOutput("Oppose", output, sampleContext);
    expect(result.grounding_report.valid).toBe(false);
    expect(result.grounding_report.fabricated_sources.length).toBeGreaterThan(0);
  });

  test("Test case 3: Warns on unretrieved section citation", () => {
    const output = {
      position: "Invoking Section 150 exception.",
      applicable_sections: [{ section: "Section 150", description: "Unrelated statutory section" }]
    };

    const result = validateAgentOutput("Oppose", output, sampleContext);
    expect(result.grounding_report.warnings.length).toBeGreaterThan(0);
  });

  test("Test case 4: Handles null/undefined agent output gracefully", () => {
    const resultNull = validateAgentOutput("Support", null, "");
    expect(resultNull.valid).toBe(true);
    expect(resultNull.citation_errors).toEqual([]);

    const resultUndefined = validateAgentOutput("Oppose", undefined, sampleContext);
    expect(resultUndefined.valid).toBe(true);
  });

  test("Test case 5: Handles empty context string gracefully without crashing", () => {
    const output = {
      applicable_sections: [{ section: "Section 87", description: "Product liability exceptions" }]
    };

    const result = validateAgentOutput("Oppose", output, "");
    expect(result.grounding_report.warnings.length).toBeGreaterThan(0);
  });
});
