> For the complete documentation index, see [llms.txt](https://docs.gpmautomate.com/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://docs.gpmautomate.com/ai/chatgpt.md).

# ChatGPT

## Giải thích thêm về các thông số của action ChatGPT

1. **GPT API:** Điền secret key api lấy từ tài khoản ChatGPT của bạn.
2. **GPT Model:** Điền model của bạn, ví dụ: gpt-3.5-turbo, gpt-3.5-turbo-0125,...
3. **Prompt:** Điền câu hỏi hoặc yêu cầu mà bạn muốn ChatGPT trả lời.


---

# Agent Instructions
This documentation is published with GitBook. GitBook is the documentation platform designed so that both humans and AI agents can read, navigate, and reason over technical content effectively. Learn more at gitbook.com.

## Querying This Documentation
If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on the current page URL with the `ask` query parameter:

```
GET https://docs.gpmautomate.com/ai/chatgpt.md?ask=<question>
```

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
