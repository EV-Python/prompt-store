import Anthropic from '@anthropic-ai/sdk';

if (!import.meta.env.VITE_ANTHROPIC_API_KEY) {
  throw new Error('Missing Anthropic API key');
}

export const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true
});

export const DEFAULT_MODEL = "claude-3-sonnet-20240229" as const;
export const DEFAULT_MAX_TOKENS = 1024;

export type Message = {
  role: "user" | "assistant";
  content: string;
};

export async function sendMessage(content: string) {
  try {
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: DEFAULT_MAX_TOKENS,
      messages: [{ role: "user", content }],
    });
    
    return response.content[0].type === 'text' ? response.content[0].text : 'No text response received';
  } catch (error) {
    console.error('Error sending message to Anthropic:', error);
    throw error;
  }
}
