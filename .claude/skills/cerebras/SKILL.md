---
name: Cerebras Inference
description: Use this to write code to call an LLM using LiteLLM and OpenRouter with the Cerebras inference provider
---

# Calling an LLM via Cerebras

These instructions allow you write code to call an LLM with Cerebras specified as the inference provider.  
This method uses LiteLLM and OpenRouter.

## Setup

The OPENROUTER_API_KEY must be set in the .env file and loaded in as an environment variable.

The uv project must include litellm and pydantic.
`uv add litellm pydantic`

## Code snippets

Use code like these examples in order to use Cerebras.

### Imports and constants

```python
from litellm import completion
MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}, "reasoning": {"effort": "low"}}
```

Notes:
- The `:free` tier of this model was discontinued by OpenRouter; the slug above is the paid
  version and calls will incur real per-request charges on the OpenRouter account tied to
  `OPENROUTER_API_KEY`.
- Reasoning effort must be passed inside `extra_body`, not as a top-level `reasoning_effort=`
  kwarg — litellm's openrouter provider validation rejects `reasoning_effort` as an unsupported
  param for this model/provider combination and raises `UnsupportedParamsError`. Passing it via
  `extra_body["reasoning"]["effort"]` bypasses that validation and is forwarded as-is into the
  request OpenRouter actually receives.

### Code to call via Cerebras for a text response

```python
response = completion(model=MODEL, messages=messages, extra_body=EXTRA_BODY)
result = response.choices[0].message.content
```

### Code to call via Cerebras for a Structured Outputs response

```python
response = completion(model=MODEL, messages=messages, response_format=MyBaseModelSubclass, extra_body=EXTRA_BODY)
result = response.choices[0].message.content
result_as_object = MyBaseModelSubclass.model_validate_json(result)
```
