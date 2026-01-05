import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';

// Simple env parser since we can't depend on dotenv being installed/configured for this script
const envPath = path.resolve(process.cwd(), '.env.local');
let apiKey = process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY;

if (!apiKey && fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  // Try to match ANTHROPIC_API_KEY first
  let match = envContent.match(/ANTHROPIC_API_KEY=(.*)/);
  if (match) {
    apiKey = match[1].trim();
  } else {
    // Try VITE_ANTHROPIC_API_KEY
    match = envContent.match(/VITE_ANTHROPIC_API_KEY=(.*)/);
    if (match) {
      apiKey = match[1].trim();
    }
  }
}

if (!apiKey) {
  console.error("No ANTHROPIC_API_KEY found in environment or .env.local");
  process.exit(1);
}

console.log("Found API Key (length):", apiKey.length);

const anthropic = new Anthropic({
  apiKey: apiKey,
});

async function test() {
  console.log("Attempting to generate content with Claude...");
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 100,
      messages: [{ role: 'user', content: 'Hello, are you working?' }]
    });

    console.log("Response received!");
    console.log("Text:", response.content[0].text);
  } catch (error) {
    console.error("Error generating content:", error);
  }
}

test();
