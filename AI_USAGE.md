# AI Usage

## Provider

Elevora AI uses the Groq API through the official `groq-sdk` package.

## Model

Default model:

```text
llama-3.3-70b-versatile
```

The model is configurable through `GROQ_MODEL`.

## Server-Side Integration

The client sends chat requests only to:

```text
POST /api/chat
```

The API route validates the request, injects the system prompt, attaches recent conversation history, calls Groq, and returns a safe JSON response. API keys are never exposed to the browser.

## System Prompt Overview

The system prompt defines Elevora AI as a professional career guidance assistant. It includes:

- Assistant identity
- Allowed career and professional development topics
- Restricted topics
- Refusal behavior
- Formatting guidance
- Honesty policy
- Recommendation style

## Prompt Engineering Strategy

The assistant is instructed to:

- Stay within career guidance and professional development
- Refuse unrelated requests using the SRS-approved fallback response
- Use concise headings, bullet points, and numbered steps where helpful
- Ask follow-up questions when the user goal is unclear
- Recommend official documentation or trusted resources when appropriate
- Avoid fabricated statistics, salaries, companies, certifications, or guarantees

## Validation

The application rejects:

- Empty messages
- Whitespace-only messages
- Messages longer than 2000 characters
- Invalid JSON payloads
- Invalid conversation history

Invalid requests do not call Groq.

## Known Limitations

- Conversation memory lasts only for the active browser session.
- The app does not store chat history in Version 1.
- AI responses may still require user judgment and verification.
- Resume file upload and automated ATS scoring are future enhancements.

## Ethical Considerations

Elevora AI provides educational and professional guidance, not guaranteed employment outcomes. It avoids unrelated high-risk domains such as medical, legal, political, financial investment, or exam-cheating content.

## Future Enhancements

- Persistent user profiles
- Saved conversations
- Resume analysis
- Interview simulation
- Career assessment
- Voice support
- Multi-language guidance
