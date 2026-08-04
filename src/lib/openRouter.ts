export interface AIProjectEvaluation {
  beforeScore: number;
  afterScore: number;
  beforeVirtues: {
    discipline: number;
    sufficiency: number;
    honesty: number;
    volunteer: number;
    gratitude: number;
  };
  afterVirtues: {
    discipline: number;
    sufficiency: number;
    honesty: number;
    volunteer: number;
    gratitude: number;
  };
  reasoning: string;
}

export const evaluateProjectWithAI = async (
  projectPrompt: string,
  targetName: string,
  targetType: string
): Promise<AIProjectEvaluation> => {
  const apiKey = localStorage.getItem('ai_api_key');
  const model = localStorage.getItem('ai_model') || 'openai/gpt-3.5-turbo';
  let systemPrompt = localStorage.getItem('ai_system_prompt');

  if (!apiKey) {
    throw new Error('กรุณาตั้งค่า API Key ของ OpenRouter ที่เมนู Settings ก่อนใช้งาน');
  }

  if (!systemPrompt) {
    systemPrompt = `You are an expert public policy AI evaluator.
You will evaluate a proposed project for the target: "${targetName}" (Type: ${targetType}).

Based on the project description, predict the 5 core virtue scores (0.0 to 10.0) BEFORE and AFTER the project implementation.
The 5 virtues are:
- discipline
- sufficiency
- honesty
- volunteer
- gratitude

You MUST respond with a valid JSON object ONLY, strictly matching this structure (no markdown tags, no extra text):
{
  "beforeScore": number,
  "afterScore": number,
  "beforeVirtues": { "discipline": number, "sufficiency": number, "honesty": number, "volunteer": number, "gratitude": number },
  "afterVirtues": { "discipline": number, "sufficiency": number, "honesty": number, "volunteer": number, "gratitude": number },
  "reasoning": "string explaining the rationale in Thai"
}`;
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Map Summary AI App',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Target: ${targetName} (${targetType})\n\nProject Proposal:\n${projectPrompt}` }
      ],
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("OpenRouter API Error:", err);
    throw new Error(`AI Evaluation Failed: ${response.statusText}`);
  }

  const data = await response.json();
  const aiContent = data.choices[0].message.content;

  try {
    // Attempt to parse the JSON. In case the model returns markdown code block, clean it up.
    const cleanJsonString = aiContent.replace(/```json/g, '').replace(/```/g, '').trim();
    const result: AIProjectEvaluation = JSON.parse(cleanJsonString);
    
    // Validate required fields
    if (typeof result.beforeScore !== 'number' || typeof result.afterScore !== 'number') {
      throw new Error('Invalid response structure from AI.');
    }
    
    return result;
  } catch (error) {
    console.error("Failed to parse AI JSON response:", aiContent);
    throw new Error('เกิดข้อผิดพลาดในการประมวลผลคำตอบจาก AI');
  }
};

export interface AIProjectIdea {
  name: string;
  description: string;
}

export const generateProjectIdeaWithAI = async (
  targetName: string,
  targetType: string
): Promise<AIProjectIdea> => {
  const apiKey = localStorage.getItem('ai_api_key');
  const model = localStorage.getItem('ai_model') || 'openai/gpt-3.5-turbo';
  let systemPrompt = localStorage.getItem('ai_generator_prompt');

  if (!apiKey) {
    throw new Error('กรุณาตั้งค่า API Key ของ OpenRouter ที่เมนู Settings ก่อนใช้งาน');
  }

  if (!systemPrompt) {
    systemPrompt = `You are an expert public policy analyst and creative project planner for Thailand.
You need to recommend an impactful project to improve the 5 core virtues (discipline, sufficiency, honesty, volunteer, gratitude) for the target: "${targetName}" (Type: ${targetType}).

Propose ONE highly effective, practical, and realistic project.

You MUST respond with a valid JSON object ONLY, strictly matching this structure (no markdown tags, no extra text):
{
  "name": "string (Short, catchy project name in Thai)",
  "description": "string (Detailed description, why it's needed, and how it improves virtues, in Thai)"
}`;
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Map Summary AI App',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Please recommend a project for ${targetType}: ${targetName}` }
      ],
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("OpenRouter API Error:", err);
    throw new Error(`AI Generation Failed: ${response.statusText}`);
  }

  const data = await response.json();
  const aiContent = data.choices[0].message.content;

  try {
    const cleanJsonString = aiContent.replace(/```json/g, '').replace(/```/g, '').trim();
    const result: AIProjectIdea = JSON.parse(cleanJsonString);
    
    if (!result.name || !result.description) {
      throw new Error('Invalid response structure from AI.');
    }
    
    return result;
  } catch (error) {
    console.error("Failed to parse AI JSON response:", aiContent);
    throw new Error('เกิดข้อผิดพลาดในการประมวลผลคำแนะนำจาก AI');
  }
};
