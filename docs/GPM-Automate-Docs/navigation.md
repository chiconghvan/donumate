> For the complete documentation index, see [llms.txt](https://docs.gpmautomate.com/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://docs.gpmautomate.com/navigation.md).

# Navigation

- [New tab](https://docs.gpmautomate.com/navigation/new-tab.md): Mở một tab mới trong trình duyệt.
- [Active tab](https://docs.gpmautomate.com/navigation/active-tab.md): Chuyển đổi giữa các tab. Số thứ tự của tab bắt đầu từ 0 (từ trái qua phải). Hoặc sau khi tương tác với các loại popup, để quay về trình duyệt chính, có thể sử dụng active tab 0.
- [Close tab](https://docs.gpmautomate.com/navigation/close-tab.md): Đóng tab hiện tại trong trình duyệt.
- [Go to URL](https://docs.gpmautomate.com/navigation/go-to-url.md): Truy cập vào một trang web chỉ định.
- [Back URL](https://docs.gpmautomate.com/navigation/back-url.md): Quay lại trang web trước đó.
- [Reload](https://docs.gpmautomate.com/navigation/reload.md): Tải lại trang web hiện tại (F5 - Refresh trang web).
- [Get URL](https://docs.gpmautomate.com/navigation/get-url.md): Lấy địa chỉ URL hiện tại của trang web.
- [Wait URL Changed](https://docs.gpmautomate.com/navigation/wait-url-changed.md): Đợi cho đến khi địa chỉ URL của trang web thay đổi hoặc hết thời gian Timeout chỉ định.


---

# Agent Instructions
This documentation is published with GitBook. GitBook is the documentation platform designed so that both humans and AI agents can read, navigate, and reason over technical content effectively. Learn more at gitbook.com.

## Querying This Documentation
If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on the current page URL with the `ask` query parameter:

```
GET https://docs.gpmautomate.com/navigation.md?ask=<question>
```

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
