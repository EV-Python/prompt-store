import Anthropic from '@anthropic-ai/sdk';

if (!import.meta.env.VITE_ANTHROPIC_API_KEY) {
  throw new Error('Missing Anthropic API key');
}

export const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true
});

const tweetFromPostPrompt = `
You are a social media expert and ghostwriter.

You work for a popular blogger, and your job is to take their blog post and come up with a variety of tweets to share ideas from the post.

Since you are a ghostwriter, you need to make sure to follow the style, tone, and voice of the blog post as closely as possible.

Remember: Tweets cannot be longer than 280 characters.

Please return exactly 5 tweets, formatted as follows:
1. First tweet here
2. Second tweet here
3. Third tweet here
4. Fourth tweet here
5. Fifth tweet here

This is very important: Do not include any additional text, commentary, or explanations. Just the numbered tweets. 
Do not use any hashtags or emojis.

Here is the blog post:

{post}
`


export const DEFAULT_MODEL = "claude-3-sonnet-20240229" as const;
export const DEFAULT_MAX_TOKENS = 1024;

export type Message = {
  role: "user" | "assistant";
  content: `${typeof tweetFromPostPrompt}${string}`;
};

export async function tweetsFromPost(content: string) {
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
