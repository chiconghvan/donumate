> For the complete documentation index, see [llms.txt](https://docs.gpmautomate.com/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://docs.gpmautomate.com/clipboard.md).

# Clipboard

Dữ liệu trong clipboard thường chỉ tồn tại cho đến khi bạn sao chép hoặc cắt một mục khác hoặc khi bạn shutdown máy tính.\
Có thể áp dụng 2 action này để copy, paste dữ liệu. Tuy nhiên, nó chỉ có tác dụng tốt nhất khi xử lý đơn luồng. Đa luồng sẽ không phù hợp.


---

# Agent Instructions
This documentation is published with GitBook. GitBook is the documentation platform designed so that both humans and AI agents can read, navigate, and reason over technical content effectively. Learn more at gitbook.com.

## Querying This Documentation
If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on the current page URL with the `ask` query parameter:

```
GET https://docs.gpmautomate.com/clipboard.md?ask=<question>
```

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
