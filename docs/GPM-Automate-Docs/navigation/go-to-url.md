> For the complete documentation index, see [llms.txt](https://docs.gpmautomate.com/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://docs.gpmautomate.com/navigation/go-to-url.md).

# Go to URL

**Timeout:** thời gian hết hạn khi truy cập 1 trang web. Mặc định là 60s.

Ví dụ: Bạn sử dụng proxy khi truy cập trang web. Tuy nhiên tốc độ của nó rất chậm, thời gian phản hồi lâu, hoặc do máy chủ của trang web đó chậm. Bạn muốn tăng thời gian chờ phản hồi thì có thể sửa thông số timeout này. Còn không mặc định sẽ là 60s sẽ hết hạn.


---

# Agent Instructions
This documentation is published with GitBook. GitBook is the documentation platform designed so that both humans and AI agents can read, navigate, and reason over technical content effectively. Learn more at gitbook.com.

## Querying This Documentation
If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on the current page URL with the `ask` query parameter:

```
GET https://docs.gpmautomate.com/navigation/go-to-url.md?ask=<question>
```

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
