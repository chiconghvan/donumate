> For the complete documentation index, see [llms.txt](https://docs.gpmautomate.com/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://docs.gpmautomate.com/mouse/mouse-click.md).

# Mouse click

Có thể lựa chọn click chuột vào phần tử dựa theo 1 trong 3 kiểu sau:

1. Click dựa theo xpath.
2. Click dựa theo toạ độ.
3. Click dựa theo vị trí hiện tại của con trỏ chuột.

Giải thích thêm về click dựa theo toạ độ

Bạn có thể dùng extension sau để lấy loạ độ của 1 điểm trên trang web.

**Mouse Coordinates:** <https://chromewebstore.google.com/detail/mouse-coordinates/mfohnjojhopfcahiddmeljeholnciakl>

**Chú ý:** Hãy đảm bảo tỉ lệ scale của trang web lúc bạn lấy toạ độ phải giống với tỉ lệ scale lúc bạn chạy thực tế. Nếu không tính năng này sẽ không hoạt động.


---

# Agent Instructions
This documentation is published with GitBook. GitBook is the documentation platform designed so that both humans and AI agents can read, navigate, and reason over technical content effectively. Learn more at gitbook.com.

## Querying This Documentation
If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on the current page URL with the `ask` query parameter:

```
GET https://docs.gpmautomate.com/mouse/mouse-click.md?ask=<question>
```

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
