# Feature Estimation Prompt Template

Feature Title: {{title}}

Description:
{{description}}

Labels: {{labels}}

Analyze this feature request and provide:

1. **Complexity rating** (trivial/small/medium/large/extra-large)
2. **Estimated development hours**
3. **Confidence level** (low/medium/high)
4. **Detailed reasoning** for your estimate
5. **Technical considerations** specific to this feature
6. **Dependencies** on other components or external systems
7. **Risks** that could impact delivery

## Response Format

```json
{
  "complexity": "medium",
  "estimatedHours": 16,
  "confidence": "high",
  "reasoning": "This feature requires moderate backend changes and new UI components...",
  "technicalConsiderations": [
    "Database schema changes needed",
    "API endpoint modifications required"
  ],
  "dependencies": ["User authentication system", "Email notification service"],
  "risks": [
    "Third-party API integration may be unstable",
    "Performance impact on large datasets"
  ]
}
```
