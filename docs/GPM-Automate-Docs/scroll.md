> For the complete documentation index, see [llms.txt](https://docs.gpmautomate.com/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://docs.gpmautomate.com/scroll.md).

# Scroll

- [Random scroll](https://docs.gpmautomate.com/scroll/random-scroll.md): Cuộn ngẫu nhiên trong trang web.
- [Scroll to top](https://docs.gpmautomate.com/scroll/scroll-to-top.md): Cuộn lên đầu trang.
- [Scroll to bottom](https://docs.gpmautomate.com/scroll/scroll-to-bottom.md): Cuộn tới cuối trang.
- [Scroll to element](https://docs.gpmautomate.com/scroll/scroll-to-element.md): Cuộn tới 1 xpath chỉ định.


---

# Agent Instructions
This documentation is published with GitBook. GitBook is the documentation platform designed so that both humans and AI agents can read, navigate, and reason over technical content effectively. Learn more at gitbook.com.

## Querying This Documentation
If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on the current page URL with the `ask` query parameter:

```
GET https://docs.gpmautomate.com/scroll.md?ask=<question>
```

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
