> For the complete documentation index, see [llms.txt](https://docs.gpmautomate.com/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://docs.gpmautomate.com/switch.md).

# Switch

- [Switch to default](https://docs.gpmautomate.com/switch/switch-to-default.md): Chuyển đổi quay trở lại trang chính sau khi đã chuyển sang một frame (iframe). Phần này liên quan trực tiếp tới Switch to frame.
- [Switch to frame](https://docs.gpmautomate.com/switch/switch-to-frame.md): Chuyển đổi sang một frame (iframe) cụ thể trên trang web để có thể tương tác với các phần tử bên trong frame đó. Phần này liên quan trực tiếp tới Switch to default.
- [Switch to popup](https://docs.gpmautomate.com/switch/switch-to-popup.md): Chuyển đổi đến một cửa sổ pop-up được mở từ trang web hiện tại, để có thể tương tác với nội dung bên trong cửa sổ pop-up đó.


---

# Agent Instructions
This documentation is published with GitBook. GitBook is the documentation platform designed so that both humans and AI agents can read, navigate, and reason over technical content effectively. Learn more at gitbook.com.

## Querying This Documentation
If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on the current page URL with the `ask` query parameter:

```
GET https://docs.gpmautomate.com/switch.md?ask=<question>
```

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
