/**
 * AI Diagnosis Utilities
 * Handles OpenAI API calls for symptom diagnosis with multimodal support
 */

export interface DiagnosisInput {
  text: string;
  imageBase64?: string;
  species?: string;
  age?: string;
  additionalContext?: string;
}

export interface DiagnosisResult {
  predicted_disease: string;
  confidence_score: number;
  recommended_action: string;
  emergency_flag: boolean;
  vet_required: boolean;
  ai_voice_reply?: string;
  full_reasoning: string;
  suggested_treatment?: string;
  prevention_tips?: string[];
}

/**
 * Diagnose symptom using OpenAI API
 */
export async function diagnoseSymptom(
  input: DiagnosisInput,
  apiKey: string
): Promise<DiagnosisResult> {
  try {
    const messages: any[] = [
      {
        role: 'system',
        content: `You are an expert veterinary assistant specializing in livestock health. 
        Analyze symptoms and provide accurate diagnoses with confidence scores.
        Always consider the species, age, and context provided.
        Format your response as JSON with the following structure:
        {
          "predicted_disease": "disease name",
          "confidence_score": 0.0-1.0,
          "recommended_action": "detailed action plan",
          "emergency_flag": true/false,
          "vet_required": true/false,
          "full_reasoning": "detailed explanation",
          "suggested_treatment": "treatment recommendations",
          "prevention_tips": ["tip1", "tip2"]
        }`,
      },
    ];

    // Build user message with text and optional image
    const userContent: any[] = [
      {
        type: 'text',
        text: `Analyze these symptoms for ${input.species || 'livestock'}:
        
Symptoms: ${input.text}

${input.age ? `Age: ${input.age}` : ''}
${input.additionalContext ? `Additional Context: ${input.additionalContext}` : ''}

Provide a diagnosis with the requested JSON format.`,
      },
    ];

    // Add image if provided
    if (input.imageBase64) {
      userContent.push({
        type: 'image_url',
        image_url: {
          url: `data:image/jpeg;base64,${input.imageBase64}`,
        },
      });
    }

    messages.push({
      role: 'user',
      content: userContent,
    });

    // Call OpenAI Chat Completions API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get diagnosis');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    // Parse JSON response
    const diagnosis = JSON.parse(content) as DiagnosisResult;

    // Generate voice reply text
    diagnosis.ai_voice_reply = generateVoiceReply(diagnosis);

    return diagnosis;
  } catch (error: any) {
    console.error('Error in diagnoseSymptom:', error);
    throw new Error(error.message || 'Failed to diagnose symptom');
  }
}

/**
 * Generate voice-friendly reply text
 */
function generateVoiceReply(diagnosis: DiagnosisResult): string {
  let reply = `Based on the symptoms, I believe this could be ${diagnosis.predicted_disease}. `;
  reply += `My confidence level is ${Math.round(diagnosis.confidence_score * 100)}%. `;
  
  if (diagnosis.emergency_flag) {
    reply += 'This appears to be an emergency situation. ';
  }
  
  if (diagnosis.vet_required) {
    reply += 'I strongly recommend consulting a veterinarian immediately. ';
  }
  
  reply += diagnosis.recommended_action;
  
  return reply;
}

/**
 * Stream diagnosis updates (for real-time display)
 */
export async function* streamDiagnosis(
  input: DiagnosisInput,
  apiKey: string
): AsyncGenerator<string, DiagnosisResult> {
  try {
    const messages: any[] = [
      {
        role: 'system',
        content: `You are an expert veterinary assistant. Provide a diagnosis for the given symptoms.`,
      },
      {
        role: 'user',
        content: `Symptoms: ${input.text}\nSpecies: ${input.species || 'livestock'}\nAge: ${input.age || 'unknown'}`,
      },
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        stream: true,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to stream diagnosis');
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    if (!reader) {
      throw new Error('No response body');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            break;
          }

          try {
            const json = JSON.parse(data);
            const content = json.choices[0]?.delta?.content;
            if (content) {
              yield content;
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }

    // Return final diagnosis (would need to be constructed from streamed content)
    return {
      predicted_disease: 'Unknown',
      confidence_score: 0,
      recommended_action: '',
      emergency_flag: false,
      vet_required: false,
      full_reasoning: '',
    };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to stream diagnosis');
  }
}

