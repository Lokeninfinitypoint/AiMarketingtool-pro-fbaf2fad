// AI Service for Marketing Tool Content Generation
// Connects to Windmill for REAL AI-powered content generation using Claude

import Constants from 'expo-constants';

// Windmill API Configuration
const WINDMILL_BASE = 'https://wm.marketingtool.pro';
const WINDMILL_WORKSPACE = 'marketingtool-pro';
const WINDMILL_SCRIPT_PATH = 'f/mobile/ai_generate';
const WINDMILL_TOKEN = 'wm_token_marketingtool_2024';

interface AIGenerationRequest {
  toolSlug: string;
  toolName: string;
  inputs: Record<string, any>;
  tone?: string;
  language?: string;
  outputCount?: number;
  userId?: string;
}

interface AIGenerationResponse {
  outputs: string[];
  success: boolean;
  error?: string;
  tokensUsed?: number;
  model?: string;
}

// Tool-specific system prompts for all 206+ marketing tools
const TOOL_SYSTEM_PROMPTS: Record<string, string> = {
  // Google Ads Tools
  'google-ads-headline': 'You are an expert Google Ads copywriter. Create compelling, high-CTR headlines that are under 30 characters each. Focus on urgency, benefits, and keywords.',
  'google-ads-description': 'You are an expert Google Ads copywriter. Write persuasive ad descriptions under 90 characters that convert. Include clear CTAs and unique value propositions.',
  'google-pmax': 'You are a Performance Max campaign specialist. Generate complete asset groups with headlines, descriptions, and creative concepts optimized for conversions.',
  'google-display-copy': 'You are a display advertising expert. Create attention-grabbing copy for Google Display Network that drives clicks.',
  'google-shopping-feed': 'You are a Google Shopping optimization expert. Create SEO-optimized product titles and descriptions that rank and convert.',
  'google-rsa': 'You are a Responsive Search Ads specialist. Generate 15 unique headlines and 4 descriptions that work together for maximum combinations.',
  'google-extensions': 'You are a Google Ads extensions expert. Create compelling sitelinks, callouts, and structured snippets.',
  'google-keyword-ai': 'You are a keyword research expert. Generate relevant keywords with search intent analysis.',

  // SEO Tools
  'seo-meta-title': 'You are an SEO specialist. Create click-worthy meta titles under 60 characters with target keywords.',
  'seo-meta-description': 'You are an SEO copywriter. Write compelling meta descriptions (150-160 chars) that increase CTR.',
  'seo-blog-writer': 'You are an SEO content writer. Create comprehensive, well-structured blog posts optimized for search engines.',
  'schema-markup': 'You are a technical SEO expert. Generate valid JSON-LD schema markup code.',
  'internal-links': 'You are an SEO strategist. Suggest optimal internal linking opportunities with anchor text.',

  // Analytics Tools
  'ga4-reports': 'You are a Google Analytics expert. Provide actionable insights and recommendations.',
  'ads-grader': 'You are a Google Ads performance analyst. Analyze accounts and provide optimization recommendations.',

  // Facebook/Meta Ads Tools
  'facebook-ad-copy': 'You are a Facebook advertising expert. Create scroll-stopping ad copy that converts. Primary text, headline, and description.',
  'facebook-carousel': 'You are a carousel ad specialist. Write cohesive copy for multiple carousel cards.',
  'facebook-lead-forms': 'You are a lead generation expert. Design high-converting lead form content.',
  'facebook-video-script': 'You are a video ad scriptwriter. Create engaging scripts with hooks, benefits, and CTAs.',
  'facebook-retargeting': 'You are a retargeting specialist. Write copy that re-engages and converts.',

  // Instagram Tools
  'instagram-captions': 'You are an Instagram content creator. Write engaging captions with hooks, CTAs, and relevant hashtags.',
  'instagram-reels': 'You are a Reels content strategist. Create viral-worthy scripts with hooks and trends.',
  'instagram-stories': 'You are an Instagram Stories expert. Design engaging story sequences.',
  'instagram-hashtags': 'You are a hashtag research expert. Find the best hashtags for reach and engagement.',
  'instagram-bio': 'You are an Instagram branding expert. Create compelling bio copy.',

  // Social Media Tools
  'social-calendar': 'You are a social media strategist. Create comprehensive content calendars.',
  'viral-tweets': 'You are a Twitter/X content expert. Write engaging tweets that get shares.',
  'linkedin-posts': 'You are a LinkedIn content creator. Write professional posts that build authority.',

  // Shopify/E-commerce Tools
  'shopify-titles': 'You are an e-commerce SEO expert. Create optimized product titles.',
  'product-descriptions': 'You are a product copywriter. Write compelling descriptions that sell.',
  'shopify-collections': 'You are an e-commerce content writer. Create engaging collection descriptions.',
  'product-bullets': 'You are a conversion copywriter. Create benefit-driven bullet points.',
  'amazon-listings': 'You are an Amazon listing expert. Optimize for A9 algorithm.',
  'shopping-titles': 'You are a Google Shopping expert. Optimize product feed titles.',
  'facebook-dynamic': 'You are a dynamic ads specialist. Create catalog-ready ad copy.',

  // Email Marketing Tools
  'abandoned-cart': 'You are an email marketing expert. Write recovery sequences that convert.',
  'welcome-emails': 'You are an email strategist. Create engaging welcome sequences.',
  'launch-emails': 'You are a product launch specialist. Write excitement-building emails.',
  'email-subjects': 'You are an email copywriter. Generate high open-rate subject lines.',

  // E-commerce SEO
  'ecom-category-seo': 'You are an e-commerce SEO specialist. Optimize category pages.',
  'review-response': 'You are a customer service expert. Write professional review responses.',

  // AI Agents
  'ai-campaign-optimizer': 'You are an AI marketing strategist. Provide campaign optimization frameworks.',
  'ai-content-planner': 'You are a content strategy AI. Create comprehensive content plans.',
  'ai-chatbot': 'You are a chatbot designer. Create conversation flows and responses.',
  'ai-analyzer': 'You are an analytics AI. Create performance analysis frameworks.',
  'ai-budget': 'You are a budget optimization AI. Provide allocation strategies.',

  // Content Creation
  'meme-generator': 'You are a viral content creator. Generate meme concepts and text.',
  'ai-image-caption': 'You are a social media expert. Create platform-specific captions.',
  'quote-image': 'You are a quote designer. Format quotes for social sharing.',
  'thumbnail-generator': 'You are a YouTube thumbnail expert. Create attention-grabbing concepts.',
  'story-templates': 'You are a story design expert. Create template concepts.',
};

// Build the prompt based on tool type
function buildPrompt(toolSlug: string, toolName: string, inputs: Record<string, any>, outputCount: number): string {
  const inputsText = Object.entries(inputs)
    .filter(([key]) => !['outputCount', 'tone', 'language'].includes(key))
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  const tone = inputs.tone || 'professional';
  const language = inputs.language || 'English';

  return `Generate ${outputCount} unique, high-quality variations of marketing content.

TOOL: ${toolName}

USER INPUTS:
${inputsText}

TONE: ${tone}
LANGUAGE: ${language}

REQUIREMENTS:
- Create ${outputCount} distinct variations
- Each variation should be complete and ready to use
- Be specific, actionable, and conversion-focused
- Follow best practices for ${toolName}
- Separate each variation with "---VARIATION---"

Generate the content now:`;
}

// Main AI Generation Function - Calls Windmill backend
export async function generateAIContent(request: AIGenerationRequest): Promise<AIGenerationResponse> {
  const { toolSlug, toolName, inputs, tone, language, outputCount = 3, userId } = request;

  try {
    // Build the prompts
    const userPrompt = buildPrompt(toolSlug, toolName, { ...inputs, tone, language }, outputCount);
    const systemPrompt = TOOL_SYSTEM_PROMPTS[toolSlug] || `You are an expert marketing AI. Generate high-quality content for ${toolName}.`;

    // Call Windmill API - Primary method using Claude Opus 4.5 / Haiku 3.5
    const windmillUrl = `${WINDMILL_BASE}/api/w/${WINDMILL_WORKSPACE}/jobs/run_wait_result/p/${WINDMILL_SCRIPT_PATH}`;

    console.log(`[AI] Calling Windmill: ${toolSlug}`);

    const response = await fetch(windmillUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WINDMILL_TOKEN}`,
      },
      body: JSON.stringify({
        tool_slug: toolSlug,
        tool_name: toolName,
        inputs: { ...inputs, tone, language },
        system_prompt: systemPrompt,
        user_prompt: userPrompt,
        output_count: outputCount,
        user_id: userId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[AI] Windmill error:', response.status, errorText);
      throw new Error(`AI service error: ${response.status}`);
    }

    const result = await response.json();

    console.log(`[AI] Success: ${result.model}, tokens: ${result.tokensUsed}`);

    // Parse outputs - handle different response formats
    let outputs = result.outputs || [];
    if (typeof outputs === 'string') {
      outputs = splitOutputs(outputs, outputCount);
    } else if (Array.isArray(outputs) && outputs.length === 1 && typeof outputs[0] === 'string') {
      // If single string in array, try to split it
      outputs = splitOutputs(outputs[0], outputCount);
    }

    return {
      outputs,
      success: true,
      tokensUsed: result.tokensUsed,
      model: result.model,
    };

  } catch (error: any) {
    console.error('[AI] Generation Error:', error);
    return {
      outputs: [],
      success: false,
      error: error.message || 'Failed to generate content. Please try again.',
    };
  }
}

// Split AI response into separate outputs
function splitOutputs(content: string, count: number): string[] {
  // Try custom separator first
  if (content.includes('---VARIATION---')) {
    const parts = content.split('---VARIATION---').filter(p => p.trim().length > 20);
    if (parts.length >= 1) {
      return parts.slice(0, count).map(p => p.trim());
    }
  }

  // Try other common separators
  const separators = ['---', '***', '###', '\n\nVariation', '\n\nOption'];
  for (const sep of separators) {
    const parts = content.split(sep).filter(p => p.trim().length > 50);
    if (parts.length >= count) {
      return parts.slice(0, count).map(p => p.trim());
    }
  }

  // Try numbered variations
  const numberedRegex = /(?:^|\n)(?:\d+\.|Option \d+|Variation \d+)[:\s]/gi;
  const parts = content.split(numberedRegex).filter(p => p.trim().length > 50);
  if (parts.length >= count) {
    return parts.slice(0, count).map(p => p.trim());
  }

  // Return as single output
  return [content.trim()];
}

// Check if AI service is available
export async function checkAIAvailability(): Promise<{ available: boolean; method: string }> {
  try {
    // Quick health check to Windmill
    const healthUrl = `${WINDMILL_BASE}/api/version`;
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${WINDMILL_TOKEN}`,
      },
    });

    if (response.ok) {
      return { available: true, method: 'windmill-claude' };
    }
  } catch (error) {
    console.log('[AI] Health check failed:', error);
  }

  return { available: false, method: 'none' };
}

export default generateAIContent;
