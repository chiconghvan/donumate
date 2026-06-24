> For the complete documentation index, see [llms.txt](https://docs.gpmautomate.com/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://docs.gpmautomate.com/http/http-download.md).

# HTTP Download

## Giải thích thêm về 1 số thông số khi dùng action HTTP Download

<figure><img src="/files/xXVxdky3kAjMR1Yh2YzV" alt=""><figcaption><p>HTTP Download</p></figcaption></figure>

<figure><img src="/files/y791DwkI0d23VHb7Azl0" alt=""><figcaption><p>HTTP Download</p></figcaption></figure>

* **URL**: Nhập đường dẫn trực tiếp đến file (direct URL).
* **Save path**: Nhập đường dẫn đầy đủ bao gồm **tên file** bạn muốn lưu (không chỉ là thư mục).\
  \&#xNAN;*Ví dụ:* `D:\Downloads\file_name.jpg`
* **Output**: Trả về `True` nếu tải thành công, `False` nếu thất bại.

Có thể kết hợp với vòng lặp **For** và lệnh **HTTP Download** để thử tải lại trong trường hợp file bị chậm hoặc khó tải.\
(Sử dụng điều kiện `If`, nếu biến output là True thì dùng `ExitLoop` để thoát vòng lặp.)


---

# Agent Instructions
This documentation is published with GitBook. GitBook is the documentation platform designed so that both humans and AI agents can read, navigate, and reason over technical content effectively. Learn more at gitbook.com.

## Querying This Documentation
If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on the current page URL with the `ask` query parameter:

```
GET https://docs.gpmautomate.com/http/http-download.md?ask=<question>
```

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
