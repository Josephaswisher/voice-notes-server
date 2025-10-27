#!/usr/bin/env node
/**
 * AI Processor for Voice Notes
 *
 * VoiceNotes-style features:
 * - Auto-summarization
 * - Key points extraction
 * - Action items detection
 * - Category/tag suggestions
 * - Sentiment analysis
 * - Smart search
 */

require('dotenv').config();
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Process transcript with AI to extract:
 * - Summary
 * - Key points
 * - Action items
 * - Categories/tags
 * - Sentiment
 */
async function processTranscriptWithAI(transcript, metadata = {}) {
  if (!openai) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = `Analyze this voice note transcript and provide:

1. **Summary** (2-3 sentences)
2. **Key Points** (bullet points)
3. **Action Items** (tasks mentioned, if any)
4. **Categories** (relevant tags, max 5)
5. **Sentiment** (positive/neutral/negative)
6. **Priority** (high/medium/low based on content)

Transcript:
"""
${transcript}
"""

Respond in JSON format:
{
  "summary": "...",
  "keyPoints": ["...", "..."],
  "actionItems": ["...", "..."],
  "categories": ["...", "..."],
  "sentiment": "...",
  "priority": "..."
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant that analyzes voice notes. Extract structured information and provide concise, actionable insights.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3
    });

    const analysis = JSON.parse(response.choices[0].message.content);

    return {
      ...analysis,
      processedAt: new Date().toISOString(),
      model: 'gpt-4-turbo-preview'
    };

  } catch (error) {
    console.error('AI processing error:', error);
    throw error;
  }
}

/**
 * Generate smart title from transcript
 */
async function generateTitle(transcript) {
  const prompt = `Generate a concise, descriptive title (max 60 characters) for this voice note:

"""
${transcript.substring(0, 500)}
"""

Title:`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 20,
      temperature: 0.7
    });

    return response.choices[0].message.content.trim().replace(/^["']|["']$/g, '');

  } catch (error) {
    // Fallback: use first sentence
    return transcript.split('.')[0].substring(0, 60) + '...';
  }
}

/**
 * Semantic search across voice notes
 */
async function semanticSearch(query, transcripts) {
  // Use OpenAI embeddings for semantic search
  const queryEmbedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query
  });

  // In production, store embeddings in vector DB (Pinecone, Weaviate, etc.)
  // For now, simple keyword matching with AI ranking

  const matches = transcripts.filter(t =>
    t.transcription.text.toLowerCase().includes(query.toLowerCase())
  );

  // Rank by relevance using AI
  if (matches.length > 0 && matches.length < 20) {
    const rankingPrompt = `Rank these voice notes by relevance to query: "${query}"

Voice notes:
${matches.map((m, i) => `${i + 1}. ${m.transcription.text.substring(0, 200)}...`).join('\n')}

Respond with just the numbers in order of relevance (most relevant first), comma-separated:`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: rankingPrompt }],
        max_tokens: 50,
        temperature: 0
      });

      const ranking = response.choices[0].message.content
        .trim()
        .split(',')
        .map(n => parseInt(n.trim()) - 1);

      return ranking.map(i => matches[i]).filter(Boolean);

    } catch (error) {
      return matches;
    }
  }

  return matches;
}

/**
 * Generate daily/weekly summary
 */
async function generateSummary(voiceNotes, period = 'daily') {
  const transcripts = voiceNotes
    .map(vn => vn.transcription.text)
    .join('\n\n---\n\n');

  const prompt = `Create a ${period} summary of these voice notes:

${transcripts.substring(0, 4000)}

Provide:
1. Overall themes
2. Key insights
3. Action items across all notes
4. Important decisions or ideas

Keep it concise and actionable.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant that creates concise summaries of voice notes.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5
    });

    return response.choices[0].message.content;

  } catch (error) {
    console.error('Summary generation error:', error);
    throw error;
  }
}

/**
 * Auto-categorize voice note
 */
async function autoCategorize(transcript, existingCategories = []) {
  const prompt = `Categorize this voice note. ${existingCategories.length > 0 ? `Use existing categories if applicable: ${existingCategories.join(', ')}` : 'Suggest new categories if needed.'}

Transcript:
"""
${transcript.substring(0, 1000)}
"""

Suggest up to 3 most relevant categories:`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 50,
      temperature: 0.3
    });

    return response.choices[0].message.content
      .split(',')
      .map(c => c.trim())
      .filter(Boolean)
      .slice(0, 3);

  } catch (error) {
    return [];
  }
}

module.exports = {
  processTranscriptWithAI,
  generateTitle,
  semanticSearch,
  generateSummary,
  autoCategorize
};
