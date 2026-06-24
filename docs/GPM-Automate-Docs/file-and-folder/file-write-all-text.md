> For the complete documentation index, see [llms.txt](https://docs.gpmautomate.com/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://docs.gpmautomate.com/file-and-folder/file-write-all-text.md).

# File write all text

Như ở hình dưới, sẽ xoá toàn bộ nội dung của file D:\1.txt, sau đó ghi nội dung "nocode automation" vào file này.

<figure><img src="/files/wwBgCm8hyyh7pyqIB7Dt" alt=""><figcaption><p>File write all text</p></figcaption></figure>

Chú ý: Có thể dùng  File write all text để tạo 1 file text trống. Như ở hình trên, phần Text mình sẽ bỏ trống.


---

# Agent Instructions
This documentation is published with GitBook. GitBook is the documentation platform designed so that both humans and AI agents can read, navigate, and reason over technical content effectively. Learn more at gitbook.com.

## Querying This Documentation
If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on the current page URL with the `ask` query parameter:

```
GET https://docs.gpmautomate.com/file-and-folder/file-write-all-text.md?ask=<question>
```

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
