import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client with required User-Agent
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "VocaCalc", time: new Date().toISOString() });
});

// Helper for sleeping during retries
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Safe server-side math evaluator for fallback calculation
function fallbackServerMath(transcript: string): any {
  try {
    const raw = transcript.toLowerCase().trim();
    // Normalize words to digits and operators
    let text = raw
      .replace(/kiti\s*(?:aahe|hote|zale|zhale|aale)?/gi, '')
      .replace(/kitna\s*(?:hai|hoga|hua)?/gi, '')
      .replace(/\bpachshe\b|\bpaanchshe\b|\bpachsau\b/gi, '500')
      .replace(/\bdoan\s*she\b|\bdo\s*sau\b/gi, '200')
      .replace(/\bteen\s*sau\b|\bteen\s*she\b/gi, '300')
      .replace(/\bshambhar\b|\bshbhar\b|\bsau\b/gi, '100')
      .replace(/\bhazaar\b|\bhazar\b|\bhajar\b/gi, '1000')
      .replace(/\blakh\b|\blaakh\b/gi, '100000');

    // Square Root
    const sqrtMatch = text.match(/(?:square\s*root\s*(?:of)?|root\s*(?:of)?|vargamul)\s*(\d+(?:\.\d+)?)/i);
    if (sqrtMatch) {
      const num = parseFloat(sqrtMatch[1]);
      const res = Math.round(Math.sqrt(num) * 1000000) / 1000000;
      return {
        success: true,
        expression: `√(${num})`,
        result: res,
        spokenAnswer: `The answer is ${res}.`,
        explanation: `Square root of ${num} = ${res}`,
        category: 'power_root',
      };
    }

    // Square
    const sqMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:squared|square|ka\s*square|cha\s*varg)/i) ||
                    text.match(/(?:square\s*of)\s*(\d+(?:\.\d+)?)/i);
    if (sqMatch) {
      const num = parseFloat(sqMatch[1]);
      const res = num * num;
      return {
        success: true,
        expression: `${num}²`,
        result: res,
        spokenAnswer: `The answer is ${res}.`,
        explanation: `${num} squared = ${res}`,
        category: 'power_root',
      };
    }

    // GST
    const gstMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:percent|%|takke)?\s*gst\s*(?:on|var|of)?\s*(\d+(?:\.\d+)?)/i) ||
                     text.match(/(\d+(?:\.\d+)?)\s*(?:var|with|plus)?\s*(\d+(?:\.\d+)?)\s*(?:percent|%|takke)?\s*gst/i);
    if (gstMatch) {
      let rate = parseFloat(gstMatch[1]);
      let base = parseFloat(gstMatch[2]);
      if (rate > base && base <= 50) {
        const t = rate;
        rate = base;
        base = t;
      }
      const gstAmt = (base * rate) / 100;
      const total = Math.round((base + gstAmt) * 100) / 100;
      return {
        success: true,
        expression: `${base} + ${rate}% GST`,
        result: total,
        spokenAnswer: `The answer is ${total}.`,
        explanation: `Base: ${base} + ${rate}% GST (${gstAmt}) = ${total}`,
        category: 'gst',
      };
    }

    // Discount
    const discMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:madhun|me\s*se|from)\s*(\d+(?:\.\d+)?)\s*(?:percent|%|takke)\s*(?:kami|kam|discount|off|minus)/i) ||
                      text.match(/(?:discount\s*of|discount\s*on|discount)?\s*(\d+(?:\.\d+)?)\s*(?:percent|%|takke)\s*(?:discount|off)\s*(?:on|from)?\s*(\d+(?:\.\d+)?)/i);
    if (discMatch) {
      let base = parseFloat(discMatch[1]);
      let rate = parseFloat(discMatch[2]);
      if (rate > 100 && base <= 100) {
        const t = rate;
        rate = base;
        base = t;
      }
      const discAmt = (base * rate) / 100;
      const finalAmt = Math.round((base - discAmt) * 100) / 100;
      return {
        success: true,
        expression: `${base} - ${rate}%`,
        result: finalAmt,
        spokenAnswer: `The answer is ${finalAmt}.`,
        explanation: `${base} minus ${rate}% discount = ${finalAmt}`,
        category: 'discount',
      };
    }

    // Percentage of
    const pctMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:cha|che|ka|ke|of)\s*(\d+(?:\.\d+)?)\s*(?:percent|%|takke)/i) ||
                     text.match(/(\d+(?:\.\d+)?)\s*(?:percent|%|takke)\s*(?:of|cha|che|ka)\s*(\d+(?:\.\d+)?)/i);
    if (pctMatch) {
      let base = parseFloat(pctMatch[1]);
      let rate = parseFloat(pctMatch[2]);
      if (text.match(/(\d+(?:\.\d+)?)\s*(?:percent|%|takke)\s*(?:of|cha|che|ka)\s*(\d+(?:\.\d+)?)/i)) {
        rate = parseFloat(pctMatch[1]);
        base = parseFloat(pctMatch[2]);
      }
      const res = Math.round(((base * rate) / 100) * 1000000) / 1000000;
      return {
        success: true,
        expression: `${base} × ${rate}%`,
        result: res,
        spokenAnswer: `The answer is ${res}.`,
        explanation: `${rate}% of ${base} = ${res}`,
        category: 'percentage',
      };
    }

    // Arithmetic
    const exprText = text
      .replace(/\b(?:multiplied\s*by|multiply\s*by|times|into|gunile|guna|x|\*)\b/gi, ' * ')
      .replace(/\b(?:divided\s*by|divide\s*by|bhagile|bhaag|\/)\b/gi, ' / ')
      .replace(/\b(?:plus|adhik|jod|jodo|aur|\+)\b/gi, ' + ')
      .replace(/\b(?:minus|vajah|ghatao|-)\b/gi, ' - ');

    const tokens = exprText.match(/(\d+(?:\.\d+)?|[+\-*/])/g);
    if (tokens && tokens.length >= 3) {
      const sanitized = tokens.join(' ');
      // eslint-disable-next-line no-new-func
      const fn = new Function(`return (${sanitized});`);
      const val = fn();
      if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
        const rounded = Math.round(val * 1000000) / 1000000;
        const display = sanitized.replace(/\*/g, '×').replace(/\//g, '÷').replace(/-/g, '−');
        return {
          success: true,
          expression: display,
          result: rounded,
          spokenAnswer: `The answer is ${rounded}.`,
          explanation: `${display} = ${rounded}`,
          category: 'standard',
        };
      }
    }
  } catch (e) {
    // ignore
  }
  return null;
}

// Smart AI Voice Math Parsing Endpoint
app.post("/api/parse-voice-calculation", async (req, res) => {
  const { transcript, language } = req.body;

  if (!transcript || typeof transcript !== "string" || !transcript.trim()) {
    return res.status(400).json({
      success: false,
      error: "Transcript is required.",
    });
  }

  const ai = getGeminiClient();
  if (!ai) {
    const fallback = fallbackServerMath(transcript);
    if (fallback) {
      return res.json(fallback);
    }
    return res.json({
      success: false,
      useLocalFallback: true,
      message: "Gemini API key not configured on server, using local parser.",
    });
  }

  const prompt = `You are VocaCalc's multilingual natural language speech-to-math interpreter.
The user spoke a calculation query in ${language || "English, Marathi, Hindi, or Hinglish"}:
"${transcript}"

Your task is to parse this natural speech into:
1. "expression": Clean standard mathematical formula suitable for display and evaluation (e.g. "500 * 0.20", "1500 * 0.18", "1000 - (1000 * 0.15)", "25 + 35", "sqrt(144)", "25^2", "5000 + (5000 * 0.18)", "250 - 200").
2. "result": The precise numeric result (number, e.g. 100, 270, 850, 60, 12, 625, 5900, 50).
3. "spokenAnswer": A natural, concise sentence for Text-To-Speech in English (e.g., "The answer is 100." or for Marathi/Hindi if appropriate, e.g., "The answer is 100.").
4. "explanation": A brief, user-friendly step summary (e.g. "20% of 500 = 100", "1000 minus 15% discount = 850", "18% GST on 5000 = 5900", "12 x 8 = 96").
5. "category": "standard" | "percentage" | "discount" | "gst" | "profit_loss" | "power_root".

Examples:
- "25 plus 35" -> expression: "25 + 35", result: 60, spokenAnswer: "The answer is 60."
- "500 cha 20 percent" or "500 ka 20 percent" or "pachshe cha 20 percent" -> expression: "500 × 20%", result: 100, spokenAnswer: "The answer is 100."
- "1500 cha 18 percent kiti" -> expression: "1500 × 18%", result: 270, spokenAnswer: "The answer is 270."
- "1000 madhun 15 percent kami kar" -> expression: "1000 - 15%", result: 850, spokenAnswer: "The answer is 850."
- "144 divided by 12" -> expression: "144 ÷ 12", result: 12, spokenAnswer: "The answer is 12."
- "18 percent GST on 5000" -> expression: "5000 + 18% GST", result: 5900, spokenAnswer: "The answer is 5900."
- "bought for 200 sold for 250 profit" -> expression: "250 - 200", result: 50, spokenAnswer: "The answer is 50. Profit is 50, which is 25 percent."

If the spoken text is completely unintelligible as a math calculation, set "success": false and error message "Sorry, I couldn't understand that. Please try again."

Output strictly valid JSON with this format:
{
  "success": true,
  "expression": "...",
  "result": 123.45,
  "spokenAnswer": "The answer is 123.45.",
  "explanation": "...",
  "category": "..."
}`;

  // Candidate models to try in sequence if high demand / 503 occurs
  const candidateModels = ["gemini-3.7-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
  let lastError: any = null;

  for (const model of candidateModels) {
    // Try each model with up to 2 attempts
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        if (attempt > 0) {
          await delay(500 * attempt);
        }

        const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        const responseText = response.text?.trim() || "";
        if (responseText) {
          const parsed = JSON.parse(responseText);
          return res.json(parsed);
        }
      } catch (error: any) {
        lastError = error;
        const errMsg = error?.message || String(error);
        const isTransient = errMsg.includes("503") || errMsg.includes("UNAVAILABLE") || errMsg.includes("high demand") || errMsg.includes("429");
        if (!isTransient) {
          // Non-transient error, break out to next model or fallback
          break;
        }
      }
    }
  }

  console.warn("All Gemini model attempts encountered errors, using server-side math evaluator fallback:", lastError?.message || lastError);

  // Fallback to server-side rule parser so the user still gets their answer
  const fallbackResult = fallbackServerMath(transcript);
  if (fallbackResult) {
    return res.json(fallbackResult);
  }

  return res.json({
    success: false,
    useLocalFallback: true,
    error: lastError?.message || "Temporarily unavailable. Please try again.",
  });
});

async function startServer() {
  // Vite middleware setup for dev vs prod
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`VocaCalc server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
