> For the complete documentation index, see [llms.txt](https://docs.gpmautomate.com/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://docs.gpmautomate.com/keyboard.md).

# Keyboard

- [Key press](https://docs.gpmautomate.com/keyboard/key-press.md): Gõ một nội dung lên trang web.
- [File upload](https://docs.gpmautomate.com/keyboard/file-upload.md): Tải 1 file lên trang web. Cần tìm xpath //input\[@type='file'] phù hợp để tải file lên.
- [Select dropdown](https://docs.gpmautomate.com/keyboard/select-dropdown.md): Chọn một giá trị từ danh sách sổ xuống (dropdown - combobox) trong giao diện người dùng.


---

# Agent Instructions
This documentation is published with GitBook. GitBook is the documentation platform designed so that both humans and AI agents can read, navigate, and reason over technical content effectively. Learn more at gitbook.com.

## Querying This Documentation
If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on the current page URL with the `ask` query parameter:

```
GET https://docs.gpmautomate.com/keyboard.md?ask=<question>
```

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
