> For the complete documentation index, see [llms.txt](https://docs.gpmautomate.com/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://docs.gpmautomate.com/switch/switch-to-popup.md).

# Switch to popup

Bạn cần điền Tiêu đề cửa sổ của popup đó (Popup title).<br>

<figure><img src="/files/izQlrLV3e3ByPGfAL1Qr" alt=""><figcaption><p>Ví dụ Switch to Popup</p></figcaption></figure>

Ví dụ: Trong ảnh trên khi làm tool đăng ký tài khoản X bằng tài khoản Gmail. Sau khi click vào nút Đăng ký bằng Google -> Một cửa sổ mới bật lên. Để tương tác với cửa sổ này, bạn cần dùng action Switch to popup. Phần Popup Title có thể điền như hình dưới.

<figure><img src="/files/IDE8FktqKXsSVQpyibCb" alt=""><figcaption><p>Switch to Popup</p></figcaption></figure>

Sau khi hoàn thành các bước trên cửa sổ popup này, để quay trở lại tương tác với cửa sổ chính (trang đăng ký tài khoản X), hãy dùng action Active tab 0 (Kích hoạt về tab 0 của trình duyệt).

<figure><img src="/files/LBMV76dMmHELzJIhcEQm" alt=""><figcaption><p>Active tab 0</p></figcaption></figure>


---

# Agent Instructions
This documentation is published with GitBook. GitBook is the documentation platform designed so that both humans and AI agents can read, navigate, and reason over technical content effectively. Learn more at gitbook.com.

## Querying This Documentation
If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on the current page URL with the `ask` query parameter:

```
GET https://docs.gpmautomate.com/switch/switch-to-popup.md?ask=<question>
```

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
