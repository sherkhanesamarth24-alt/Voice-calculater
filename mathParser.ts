import { ParseResult, CalculationCategory } from '../types';

// Map of word representations of numbers in English, Hindi, and Marathi
const WORD_TO_NUMBER: Record<string, number> = {
  // English
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17,
  eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60,
  seventy: 70, eighty: 80, ninety: 90, hundred: 100, thousand: 1000, million: 1000000,
  billion: 1000000000,

  // Hindi numbers (romanized & devanagari transliterated)
  shunya: 0, ek: 1, do: 2, don: 2, teen: 3, chaar: 4, char: 4, paanch: 5, pach: 5,
  chhe: 6, che: 6, saha: 6, saat: 7, aath: 8, ath: 8, nau: 9, no: 9, das: 10, daha: 10,
  gyarah: 11, akra: 11, akara: 11, barah: 12, bara: 12, terah: 13, tera: 13, chaudah: 14, chauda: 14,
  pandrah: 15, pandhra: 15, solah: 16, sola: 16, satrah: 17, satra: 17, atharah: 18, athra: 18,
  unnis: 19, ekonis: 19, bees: 20, vis: 20, vish: 20,
  ikkees: 21, ikvis: 21, baaees: 22, bavis: 22, teyees: 23, tevis: 23, chaubees: 24, chovis: 24,
  pachees: 25, pachis: 25, pachvis: 25, chhabees: 26, chhavis: 26, sattaees: 27, sattavis: 27,
  athaees: 28, atthavis: 28, untees: 29, ekonatis: 29,
  tees: 30, tis: 30, iktees: 31, ektis: 31, battees: 32, battis: 32, taintees: 33, tetis: 33,
  chautees: 34, chautis: 34, paintees: 35, pastis: 35, chhattees: 36, chattis: 36, saitees: 37, sadtis: 37,
  adhtees: 38, adtis: 38, untaalees: 39, ekonchalis: 39,
  chaalis: 40, chalis: 40, chalish: 40,
  pachaas: 50, pachas: 50, pannas: 50, saatth: 60, saath: 60, saatha: 60, sattar: 70,
  assi: 80, ayshi: 80, aishi: 80, nabbe: 90, navvad: 90,
  sau: 100, shbhar: 100, shambhar: 100, sambhar: 100, doanshe: 200, dosau: 200, teensau: 300,
  charsau: 400, pachsau: 500, pachshe: 500, paanchshe: 500, paanchsau: 500,
  hazaar: 1000, hajar: 1000, hazar: 1000, laakh: 100000, lakh: 100000, karod: 10000000, koti: 10000000,
  aadha: 0.5, artha: 0.5, adha: 0.5, pav: 0.25, paun: 0.75, dedh: 1.5, did: 1.5, dhai: 2.5, adich: 2.5
};

// Convert Devanagari numerals (०-९) to standard digits (0-9)
export function convertDevanagariNumerals(text: string): string {
  const devanagariDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  let result = text;
  for (let i = 0; i < 10; i++) {
    result = result.split(devanagariDigits[i]).join(i.toString());
  }
  return result;
}

// Safe math evaluator for mathematical strings (e.g. "500 * 0.20 + 40")
export function evaluateMathExpression(expr: string): number {
  // Clean operators
  const sanitized = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/\^/g, '**');

  // Validate allowed characters to prevent code injection
  if (!/^[\d\s+\-*/().%^eE]+$/.test(sanitized)) {
    throw new Error('Invalid characters in expression');
  }

  // Handle percentages like 500 * 20% or 1000 + 18%
  const processed = sanitized.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');

  // Safely evaluate using Function constructor with restricted scope
  // eslint-disable-next-line no-new-func
  const fn = new Function(`return (${processed});`);
  const res = fn();

  if (typeof res !== 'number' || isNaN(res) || !isFinite(res)) {
    throw new Error('Calculation resulted in undefined or infinite value');
  }

  // Round to 8 decimal places to eliminate floating point issues (e.g., 0.1 + 0.2)
  return Math.round(res * 100000000) / 100000000;
}

// Convert numbers in words into digits
export function wordsToNumbers(text: string): string {
  let lower = convertDevanagariNumerals(text).toLowerCase();

  // Replace special compound phrases first
  lower = lower
    .replace(/\bpachshe\b/g, '500')
    .replace(/\bpaanchshe\b/g, '500')
    .replace(/\bpachsau\b/g, '500')
    .replace(/\bpaanch sau\b/g, '500')
    .replace(/\bdoan she\b/g, '200')
    .replace(/\bdo sau\b/g, '200')
    .replace(/\bteen sau\b/g, '300')
    .replace(/\bteen she\b/g, '300')
    .replace(/\bchaar sau\b/g, '400')
    .replace(/\bchar she\b/g, '400')
    .replace(/\bshambhar\b/g, '100')
    .replace(/\bshbhar\b/g, '100')
    .replace(/\bsau\b/g, '100')
    .replace(/\bhazaar\b/g, '1000')
    .replace(/\bhazar\b/g, '1000')
    .replace(/\bhajar\b/g, '1000')
    .replace(/\blakh\b/g, '100000')
    .replace(/\blaakh\b/g, '100000')
    .replace(/\bkarod\b/g, '10000000')
    .replace(/\bkoti\b/g, '10000000');

  // Replace single word numbers
  const words = lower.split(/\s+/);
  const transformed = words.map(w => {
    const cleanWord = w.replace(/[^a-z0-9]/g, '');
    if (WORD_TO_NUMBER[cleanWord] !== undefined) {
      return WORD_TO_NUMBER[cleanWord].toString();
    }
    return w;
  });

  return transformed.join(' ');
}

// Main local natural language math parser
export function parseNaturalLanguageCalculation(rawInput: string): ParseResult {
  const original = rawInput.trim();
  if (!original) {
    return {
      success: false,
      expression: '',
      result: 0,
      spokenQuery: '',
      answerText: '',
      error: "Sorry, I couldn't understand that. Please try again."
    };
  }

  // Pre-process: convert words to numbers and normalize spaces
  let text = wordsToNumbers(original);

  // Normalize common regional words and speech artifacts
  text = text
    .replace(/,/g, '')
    .replace(/kiti\s*$/i, '')
    .replace(/kiti\s+hote/i, '')
    .replace(/kiti\s+aahe/i, '')
    .replace(/kiti\s+zale/i, '')
    .replace(/kiti\s+zhale/i, '')
    .replace(/kiti\s+aale/i, '')
    .replace(/kitna\s*hoga/i, '')
    .replace(/kitna\s*hai/i, '')
    .replace(/kitna\s*hua/i, '')
    .replace(/karo\s*$/i, '')
    .replace(/kar\s*$/i, '')
    .replace(/equals\s*$/i, '')
    .replace(/is equal to/i, '=')
    .replace(/barabar/i, '=')
    .replace(/equals/i, '=')
    .trim();

  // 1. SMART CALCULATION: Square Root / Cube Root
  const sqrtMatch = text.match(/(?:square\s*root\s*(?:of)?|vargamul|vargmool|root\s*of)\s*(\d+(?:\.\d+)?)/i) ||
                    text.match(/(\d+(?:\.\d+)?)\s*(?:cha|che|ka|ke)?\s*(?:square\s*root|vargamul|vargmool|root)/i);
  if (sqrtMatch) {
    const num = parseFloat(sqrtMatch[1]);
    const res = Math.sqrt(num);
    const rounded = Math.round(res * 1000000) / 1000000;
    return {
      success: true,
      expression: `√(${num})`,
      result: rounded,
      spokenQuery: original,
      answerText: `The answer is ${rounded}.`,
      explanation: `Square root of ${num} = ${rounded}`,
      category: 'power_root'
    };
  }

  const cbrtMatch = text.match(/(?:cube\s*root\s*(?:of)?|ghanamul|ghanmool)\s*(\d+(?:\.\d+)?)/i) ||
                    text.match(/(\d+(?:\.\d+)?)\s*(?:cha|che|ka|ke)?\s*(?:cube\s*root|ghanamul|ghanmool)/i);
  if (cbrtMatch) {
    const num = parseFloat(cbrtMatch[1]);
    const res = Math.cbrt(num);
    const rounded = Math.round(res * 1000000) / 1000000;
    return {
      success: true,
      expression: `∛(${num})`,
      result: rounded,
      spokenQuery: original,
      answerText: `The answer is ${rounded}.`,
      explanation: `Cube root of ${num} = ${rounded}`,
      category: 'power_root'
    };
  }

  // 2. SMART CALCULATION: Square / Cube / Power
  const squareMatch = text.match(/(?:square\s*(?:of)?|varg\s*(?:of)?)\s*(\d+(?:\.\d+)?)/i) ||
                      text.match(/(\d+(?:\.\d+)?)\s*(?:cha|ka)?\s*(?:square|varg|squared)/i);
  if (squareMatch) {
    const num = parseFloat(squareMatch[1]);
    const res = num * num;
    return {
      success: true,
      expression: `${num}²`,
      result: res,
      spokenQuery: original,
      answerText: `The answer is ${res}.`,
      explanation: `${num} squared = ${res}`,
      category: 'power_root'
    };
  }

  const cubeMatch = text.match(/(?:cube\s*(?:of)?|ghan\s*(?:of)?)\s*(\d+(?:\.\d+)?)/i) ||
                    text.match(/(\d+(?:\.\d+)?)\s*(?:cha|ka)?\s*(?:cube|cubed|ghan)/i);
  if (cubeMatch) {
    const num = parseFloat(cubeMatch[1]);
    const res = num * num * num;
    return {
      success: true,
      expression: `${num}³`,
      result: res,
      spokenQuery: original,
      answerText: `The answer is ${res}.`,
      explanation: `${num} cubed = ${res}`,
      category: 'power_root'
    };
  }

  // 3. SMART CALCULATION: Half / Double / Triple
  const halfMatch = text.match(/(?:half\s*of|aadha\s*of|ardha\s*of|nimma)\s*(\d+(?:\.\d+)?)/i) ||
                    text.match(/(\d+(?:\.\d+)?)\s*(?:cha|che|ka|ke)?\s*(?:aadha|ardha|half|nimma)/i);
  if (halfMatch) {
    const num = parseFloat(halfMatch[1]);
    const res = num / 2;
    return {
      success: true,
      expression: `${num} ÷ 2`,
      result: res,
      spokenQuery: original,
      answerText: `The answer is ${res}.`,
      explanation: `Half of ${num} = ${res}`,
      category: 'standard'
    };
  }

  const doubleMatch = text.match(/(?:double\s*(?:of)?|duppat\s*(?:of)?|doguna)\s*(\d+(?:\.\d+)?)/i) ||
                      text.match(/(\d+(?:\.\d+)?)\s*(?:cha|che|ka|ke)?\s*(?:double|duppat|doguna|dohra)/i);
  if (doubleMatch) {
    const num = parseFloat(doubleMatch[1]);
    const res = num * 2;
    return {
      success: true,
      expression: `${num} × 2`,
      result: res,
      spokenQuery: original,
      answerText: `The answer is ${res}.`,
      explanation: `Double of ${num} = ${res}`,
      category: 'standard'
    };
  }

  // 4. SMART CALCULATION: GST
  const gstMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:percent|%|takke|pratishat)?\s*gst\s*(?:on|var|me|madhe|to|of)?\s*(\d+(?:\.\d+)?)/i) ||
                   text.match(/(\d+(?:\.\d+)?)\s*(?:var|me|madhe|with|plus)?\s*(\d+(?:\.\d+)?)\s*(?:percent|%|takke|pratishat)?\s*gst/i) ||
                   text.match(/gst\s*(\d+(?:\.\d+)?)\s*(?:percent|%|takke)?\s*(?:on|var|of)?\s*(\d+(?:\.\d+)?)/i);
  if (gstMatch) {
    let rate = parseFloat(gstMatch[1]);
    let base = parseFloat(gstMatch[2]);
    if (rate > base && base <= 50) {
      const temp = rate;
      rate = base;
      base = temp;
    }
    const gstAmount = (base * rate) / 100;
    const total = base + gstAmount;
    const rounded = Math.round(total * 100) / 100;
    return {
      success: true,
      expression: `${base} + ${rate}% GST`,
      result: rounded,
      spokenQuery: original,
      answerText: `The answer is ${rounded}. Total with ${rate} percent GST is ${rounded}, GST amount is ${gstAmount}.`,
      explanation: `Base: ${base} + GST (${rate}% = ${gstAmount}) = ${rounded}`,
      category: 'gst'
    };
  }

  // 5. SMART CALCULATION: Discount / Reduction
  const discountMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:madhun|me\s*se|varun|from)\s*(\d+(?:\.\d+)?)\s*(?:percent|%|takke|pratishat)\s*(?:kami|kam|ghatao|minus|discount|off|vajah)/i) ||
                        text.match(/(?:discount|off)\s*(?:of)?\s*(\d+(?:\.\d+)?)\s*(?:percent|%|takke|pratishat)?\s*(?:on|var|me|from)?\s*(\d+(?:\.\d+)?)/i) ||
                        text.match(/(\d+(?:\.\d+)?)\s*(?:percent|%|takke|pratishat)\s*(?:discount|off)\s*(?:on|var|of|for)?\s*(\d+(?:\.\d+)?)/i) ||
                        text.match(/(\d+(?:\.\d+)?)\s*(?:minus|vajah|ghatao|-)\s*(\d+(?:\.\d+)?)\s*(?:percent|%|takke|pratishat)/i);

  if (discountMatch) {
    let base = parseFloat(discountMatch[1]);
    let rate = parseFloat(discountMatch[2]);
    if (text.includes('discount') || text.includes('off')) {
      if (base <= 100 && rate > 100) {
        const temp = base;
        base = rate;
        rate = temp;
      }
    }
    const discountAmount = (base * rate) / 100;
    const finalAmount = base - discountAmount;
    const rounded = Math.round(finalAmount * 100) / 100;
    return {
      success: true,
      expression: `${base} - ${rate}%`,
      result: rounded,
      spokenQuery: original,
      answerText: `The answer is ${rounded}. After ${rate} percent discount, final amount is ${rounded}.`,
      explanation: `${base} minus ${rate}% discount (${discountAmount}) = ${rounded}`,
      category: 'discount'
    };
  }

  // 6. SMART CALCULATION: Profit & Loss
  const plMatch = text.match(/(?:cost|bought|kharedi|cp|cr)\s*(?:for|at|is)?\s*(\d+(?:\.\d+)?)\s*(?:and|tar|aur)?\s*(?:sold|sell|vikri|sp|sr)\s*(?:for|at|is)?\s*(\d+(?:\.\d+)?)/i) ||
                  text.match(/(?:sold|sell|vikri|sp)\s*(?:for|at|is)?\s*(\d+(?:\.\d+)?)\s*(?:and|tar|aur)?\s*(?:cost|bought|kharedi|cp)\s*(?:for|at|is)?\s*(\d+(?:\.\d+)?)/i);
  if (plMatch) {
    let cp = 0;
    let sp = 0;
    if (text.toLowerCase().indexOf('cost') < text.toLowerCase().indexOf('sold') || 
        text.toLowerCase().indexOf('bought') < text.toLowerCase().indexOf('sold') ||
        text.toLowerCase().indexOf('kharedi') < text.toLowerCase().indexOf('vikri')) {
      cp = parseFloat(plMatch[1]);
      sp = parseFloat(plMatch[2]);
    } else {
      sp = parseFloat(plMatch[1]);
      cp = parseFloat(plMatch[2]);
    }
    const diff = sp - cp;
    const pct = cp > 0 ? Math.round(((diff / cp) * 100) * 100) / 100 : 0;
    const isProfit = diff >= 0;
    const label = isProfit ? 'Profit' : 'Loss';
    return {
      success: true,
      expression: `${sp} - ${cp}`,
      result: Math.abs(diff),
      spokenQuery: original,
      answerText: `The answer is ${Math.abs(diff)}. ${label} is ${Math.abs(diff)}, which is ${Math.abs(pct)} percent.`,
      explanation: `Cost: ${cp}, Sale: ${sp} → ${label}: ${Math.abs(diff)} (${Math.abs(pct)}%)`,
      category: 'profit_loss'
    };
  }

  // 7. PERCENTAGE OF VALUE
  const pctMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:cha|che|ka|ke|ki|of)\s*(\d+(?:\.\d+)?)\s*(?:percent|%|takke|pratishat)/i) ||
                   text.match(/(\d+(?:\.\d+)?)\s*(?:percent|%|takke|pratishat)\s*(?:of|cha|che|ka|ke)\s*(\d+(?:\.\d+)?)/i);
  if (pctMatch) {
    let base = parseFloat(pctMatch[1]);
    let rate = parseFloat(pctMatch[2]);
    if (text.match(/(\d+(?:\.\d+)?)\s*(?:percent|%|takke|pratishat)\s*(?:of|cha|che|ka|ke)\s*(\d+(?:\.\d+)?)/i)) {
      rate = parseFloat(pctMatch[1]);
      base = parseFloat(pctMatch[2]);
    }
    const res = (base * rate) / 100;
    const rounded = Math.round(res * 1000000) / 1000000;
    return {
      success: true,
      expression: `${base} × ${rate}%`,
      result: rounded,
      spokenQuery: original,
      answerText: `The answer is ${rounded}.`,
      explanation: `${rate}% of ${base} = ${rounded}`,
      category: 'percentage'
    };
  }

  // 8. ADD/SUM/TOTAL PHRASING: "add 20 and 30", "sum of 50 and 70", "total of 100 and 400"
  const sumMatch = text.match(/(?:add|sum\s*of|total\s*of)\s*(\d+(?:\.\d+)?)\s*(?:and|plus|adhik|aur|\+)\s*(\d+(?:\.\d+)?)/i);
  if (sumMatch) {
    const a = parseFloat(sumMatch[1]);
    const b = parseFloat(sumMatch[2]);
    const sum = a + b;
    return {
      success: true,
      expression: `${a} + ${b}`,
      result: sum,
      spokenQuery: original,
      answerText: `The answer is ${sum}.`,
      explanation: `${a} + ${b} = ${sum}`,
      category: 'standard'
    };
  }

  // 9. MULTI-OPERATOR ARITHMETIC REPLACEMENT
  let mathExpr = text
    .replace(/\b(?:multiplied\s*by|multiply\s*by|times|into|gunile|guna|gunana|gune|x|\*)\b/gi, ' * ')
    .replace(/\b(?:divided\s*by|divide\s*by|divided|bhagile|bhaag|bhag|bata|\/)\b/gi, ' / ')
    .replace(/\b(?:plus|and|adhik|jod|jodo|milva|milsa|var|\+)\b/gi, ' + ')
    .replace(/\b(?:minus|vajah|ghatao|ghata|kam\s*karo|kami\s*kar|-)\b/gi, ' - ')
    .replace(/\b(?:to\s*the\s*power\s*of|power|raised\s*to|\^)\b/gi, ' ^ ')
    .replace(/\b(?:percent|takke|pratishat|pct|%)\b/gi, ' % ');

  const tokens = mathExpr.match(/(\d+(?:\.\d+)?|[+\-*/%^()])/g);

  if (tokens && tokens.length >= 3) {
    const reconstructed = tokens.join(' ');
    try {
      const result = evaluateMathExpression(reconstructed);
      const displayExpr = reconstructed
        .replace(/\*/g, '×')
        .replace(/\//g, '÷')
        .replace(/\-/g, '−');

      return {
        success: true,
        expression: displayExpr,
        result: result,
        spokenQuery: original,
        answerText: `The answer is ${result}.`,
        explanation: `${displayExpr} = ${result}`,
        category: 'standard'
      };
    } catch {
      // Pass through to error / fallback
    }
  }

  if (tokens && tokens.length === 1 && !isNaN(Number(tokens[0]))) {
    const val = Number(tokens[0]);
    return {
      success: true,
      expression: `${val}`,
      result: val,
      spokenQuery: original,
      answerText: `The answer is ${val}.`,
      explanation: `${val}`,
      category: 'standard'
    };
  }

  return {
    success: false,
    expression: '',
    result: 0,
    spokenQuery: original,
    answerText: '',
    error: "Sorry, I couldn't understand that. Please try again."
  };
}

// Format numbers nicely (e.g. 1,50,000 or 1500.25)
export function formatResultNumber(num: number | string): string {
  if (typeof num === 'string') return num;
  if (isNaN(num)) return '0';
  
  const parts = num.toString().split('.');
  const intPart = parts[0];
  const decPart = parts[1];

  if (Math.abs(num) >= 1e14) {
    return num.toExponential(6);
  }

  const formattedInt = Number(intPart).toLocaleString('en-IN');
  return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
}

