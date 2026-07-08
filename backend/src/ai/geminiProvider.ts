import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({});

export async function mapHeadersWithGemini(headers: string[]): Promise<Record<string, string>> {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    // Mock header mapping
    const mockMap: Record<string, string> = {};
    headers.forEach(h => {
      const lower = h.toLowerCase();
      if (lower.includes('name')) mockMap[h] = 'name';
      else if (lower.includes('email')) mockMap[h] = 'email';
      else if (lower.includes('phone') || lower.includes('mobile')) mockMap[h] = 'mobile_without_country_code';
      else if (lower.includes('city')) mockMap[h] = 'city';
      else if (lower.includes('company')) mockMap[h] = 'company';
      else if (lower.includes('remark') || lower.includes('note')) mockMap[h] = 'crm_note';
    });
    return mockMap;
  }

  const prompt = `You are an expert CRM data extraction engine.
Your task is to identify column mappings from arbitrary CSV headers to GrowEasy CRM fields.

CRM Schema:
created_at, name, email, country_code, mobile_without_country_code, company, city, state, country, lead_owner, crm_status, crm_note, data_source, possession_time, description

Rules:
1. Only map fields when confidence >= 0.80.
2. If uncertain, leave out of the mapping.
3. Return ONLY a JSON dictionary where keys are the input headers and values are the CRM schema fields. No markdown, no explanations.

Input Headers:
${JSON.stringify(headers)}`;

  return callGeminiWithRetry(prompt);
}

export async function processBatchWithGemini(batch: any[]): Promise<any> {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    return generateMockResponse(batch);
  }

  const prompt = `You are an expert CRM data extraction engine.
Your task is to convert arbitrary CSV records into GrowEasy CRM format.
Infer fields intelligently. Never invent data. Leave unknown fields blank.
Return ONLY JSON. No markdown. No explanation.

CRM Schema:
created_at, name, email, country_code, mobile_without_country_code, company, city, state, country, lead_owner, crm_status, crm_note, data_source, possession_time, description

Rules:
Allowed crm_status: GOOD_LEAD_FOLLOW_UP, DID_NOT_CONNECT, BAD_LEAD, SALE_DONE (Leave blank if uncertain)
Allowed data_source: leads_on_demand, meridian_tower, eden_park, varah_swamy, sarjapur_plots
Dates: Convert to ISO format.
Multiple emails: first email -> email, remaining -> crm_note
Multiple phones: first phone -> mobile_without_country_code, remaining -> crm_note
Skip Rules: Skip row when No email AND No phone.
Confidence: Only map fields when confidence >= 0.80.

Return Format:
{
  "records": [],
  "skipped": [{"row": {}, "reason": ""}]
}

Input Data:
${JSON.stringify(batch)}`;

  return callGeminiWithRetry(prompt);
}

async function callGeminiWithRetry(prompt: string, retries = 1): Promise<any> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text;
    if (!text) throw new Error('Empty response from AI');
    return JSON.parse(text);
  } catch (error: any) {
    if (retries > 0) {
      console.log('Gemini call failed. Retrying...', error.message);
      return callGeminiWithRetry(prompt, retries - 1);
    }
    throw error;
  }
}

function generateMockResponse(batch: any[]) {
  const records: any[] = [];
  const skipped: any[] = [];

  batch.forEach((row, index) => {
    const values = Object.values(row);
    const mockEmail = values.find(v => typeof v === 'string' && v.includes('@')) as string;
    const mockName = values.find(v => typeof v === 'string' && !v.includes('@') && (v as string).length > 2) as string;
    
    if (!mockEmail) {
       skipped.push({ row, reason: 'No email and no phone number provided' });
    } else {
       records.push({
         name: mockName || `Mock User ${index}`,
         email: mockEmail,
         crm_status: 'GOOD_LEAD_FOLLOW_UP',
         crm_note: 'Mock fallback record',
       });
    }
  });

  return { records, skipped };
}
