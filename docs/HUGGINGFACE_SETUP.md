# Hugging Face AI Integration Guide

The Verabot poem command now supports AI-powered poem generation using the **Hugging Face Inference API**.

## Overview

- **Free Tier**: Yes - Hugging Face offers free API access (no credit card required)
- **Model**: GPT-2 (or your choice of text generation models)
- **Fallback**: If API unavailable/disabled, uses built-in poem generators (haiku, sonnet, free-form)

## Setup Instructions

### 1. Create a Hugging Face Account

1. Visit [huggingface.co](https://huggingface.co)
2. Click "Sign Up" and create a free account
3. No credit card required for free tier

### 2. Generate API Token

1. Go to [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Click "New token"
3. Set token type to **"read"**
4. Copy the generated token

### 3. Add to Your Environment

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your Hugging Face token:
   ```env
   HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

3. Save the file

### 4. Restart the Bot

```bash
npm start
```

## Usage

Users can now generate poems with the `/poem` command:

```
/poem type:sonnet subject:nature
/poem type:haiku subject:the moon
/poem type:other subject:coding
```

### Behavior

- **With API Key**: Attempts AI generation first, falls back to built-in generators if API fails
- **Without API Key**: Uses built-in generators (fallback mode)

## Models Available

The default setup uses **Mistral-7B** (better quality than GPT-2, free tier friendly):

- `mistralai/Mistral-7B-Instruct-v0.1` (default - recommended)
- `EleutherAI/gpt-neo-125M` (lighter weight)
- `EleutherAI/gpt-neo-2.7B` (better quality)
- `meta-llama/Llama-2-7b` (if you have access)

To change the model, edit line 30 in `src/commands/poem.js`:
```javascript
'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1'
```

Replace with any supported Hugging Face text-generation model.

## Limitations & Tips

| Aspect | Details |
|--------|---------|
| **Rate Limits** | Free tier: ~100 requests/hour |
| **Response Time** | 1-5 seconds (models load on first use) |
| **Token Length** | Max 200 characters per poem |
| **Best For** | Inspiration, creative exploration |

### If you hit rate limits:
- Wait ~1 hour for limits to reset
- Or upgrade to Pro tier (~$9/month) for higher limits
- Or use the built-in generators (no API calls needed)

## Troubleshooting

### "API error" in logs
- Check if `HUGGINGFACE_API_KEY` is set correctly
- Verify token has "read" permissions
- Try a different model
- Check Hugging Face status page

### Slow responses
- First request is slower (model loads)
- Subsequent requests are faster (~1-2 sec)
- Consider using built-in generators for speed

### Token invalid
- Regenerate token at [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
- Delete old token
- Update `.env` with new token

## Environment Variable Reference

```env
# Required for AI poems (optional - bot works without it)
HUGGINGFACE_API_KEY=hf_your_token_here

# Example with actual token format
HUGGINGFACE_API_KEY=hf_xAbCdEfGhIjKlMnOpQrStUvWxYz123456
```

## Cost Analysis

| Usage | Cost |
|-------|------|
| Free Tier | $0 (100 req/hour) |
| Pro Tier | $9/month (unlimited) |
| ~1000 poems/month | Still free tier |
| ~10,000 poems/month | Pro tier recommended |

## Resources

- [Hugging Face Docs](https://huggingface.co/docs/inference-api/index)
- [GPT-2 Model Card](https://huggingface.co/gpt2)
- [Pricing](https://huggingface.co/pricing)
- [API Status](https://huggingface.co/status)
