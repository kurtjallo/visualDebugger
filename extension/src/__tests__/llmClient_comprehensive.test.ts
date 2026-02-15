import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Phase1Response, Phase2Response } from "../types.js";

// Mock @google/genai before importing llmClient
const mockGenerateContent = vi.fn();

vi.mock("@google/genai", () => {
  return {
    GoogleGenAI: vi.fn().mockImplementation(() => ({
      models: {
        generateContent: mockGenerateContent,
      },
    })),
    Type: {
      OBJECT: "OBJECT",
      STRING: "STRING",
      ARRAY: "ARRAY",
    },
  };
});

// Import after mock is set up
import { initialize, analyzeError, analyzeDiff, FlowFixerError } from "../llmClient.js";

function makeSecrets(apiKey?: string) {
  return {
    get: vi.fn().mockResolvedValue(apiKey),
  };
}

const VALID_PHASE1: Phase1Response = {
  category: "Logic Error",
  location: "line 1",
  tldr: "Test",
  explanation: "Explanation",
  howToFix: "Fix",
  howToPrevent: "Prevent",
  bestPractices: "Practice",
  keyTerms: ["term"],
  quiz: {
    question: "Q",
    options: ["A", "B", "C", "D"],
    correct: "A",
    explanation: "Exp",
  },
};

const VALID_PHASE2: Phase2Response = {
  quickSummary: "Summary",
  whyItWorks: "Works",
  whatToDoNext: ["1", "2", "3"],
  keyTakeaway: "Takeaway",
  checkQuestion: "Check",
};

describe("llmClient Comprehensive", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("analyzeError - Edge Cases", () => {
    it("handles empty error message gracefully (Logic Error path)", async () => {
      await initialize(makeSecrets("key"));
      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify(VALID_PHASE1),
      });

      await analyzeError({
        language: "ts",
        filename: "test.ts",
        errorMessage: "",
        codeContext: "context",
      });

      const call = mockGenerateContent.mock.calls[0][0];
      expect(call.contents).toContain("No error message");
    });

    it("handles extremely long code context", async () => {
      await initialize(makeSecrets("key"));
      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify(VALID_PHASE1),
      });

      const longContext = "a".repeat(10000);
      await analyzeError({
         language: "ts",
        filename: "test.ts",
        errorMessage: "error",
        codeContext: longContext,
      });

       const call = mockGenerateContent.mock.calls[0][0];
      expect(call.contents).toContain(longContext);
    });

    it("throws FlowFixerError on malformed JSON response", async () => {
      await initialize(makeSecrets("key"));
      mockGenerateContent.mockResolvedValueOnce({
        text: "{ invalid json: ",
      });

      await expect(analyzeError({
         language: "ts",
        filename: "test.ts",
        errorMessage: "error",
        codeContext: "context",
      })).rejects.toThrow(FlowFixerError);
    });

     it("throws FlowFixerError on empty JSON object", async () => {
      await initialize(makeSecrets("key"));
      // Valid JSON but missing required fields for Phase1Response
      mockGenerateContent.mockResolvedValueOnce({
        text: "{}",
      });

      // Now we expect this to throw because we want to enforce structure
      await expect(analyzeError({
         language: "ts",
        filename: "test.ts",
        errorMessage: "error",
        codeContext: "context",
      })).rejects.toThrow(FlowFixerError);
    });

    it("throws FlowFixerError when response is missing required fields", async () => {
       await initialize(makeSecrets("key"));
       const partial = { category: "Logic Error" }; // missing everything else
       mockGenerateContent.mockResolvedValueOnce({
         text: JSON.stringify(partial),
       });

       await expect(analyzeError({
          language: "ts",
         filename: "test.ts",
         errorMessage: "error",
         codeContext: "context",
       })).rejects.toThrow(FlowFixerError);
    });
  });

  describe("analyzeDiff - Edge Cases", () => {
    it("handles empty diff string", async () => {
       await initialize(makeSecrets("key"));
      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify(VALID_PHASE2),
      });

      await analyzeDiff({
        language: "ts",
        filename: "test.ts",
        originalError: "oops",
        diff: "",
      });

      const call = mockGenerateContent.mock.calls[0][0];
      // It should still try to send the prompt
      expect(call.contents).toBeDefined();
    });

    it("handles huge diffs", async () => {
       await initialize(makeSecrets("key"));
      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify(VALID_PHASE2),
      });

      const hugeDiff = "diff".repeat(5000);
      await analyzeDiff({
        language: "ts",
        filename: "test.ts",
        originalError: "oops",
        diff: hugeDiff,
      });

      const call = mockGenerateContent.mock.calls[0][0];
      expect(call.contents).toContain(hugeDiff);
    });

     it("throws FlowFixerError if API returns 500 error", async () => {
      await initialize(makeSecrets("key"));
      mockGenerateContent.mockRejectedValueOnce(new Error("500 Internal Server Error"));

      await expect(analyzeDiff({
          language: "ts",
        filename: "test.ts",
        originalError: "oops",
        diff: "diff",
      })).rejects.toThrow(FlowFixerError);
    });
  });
});
