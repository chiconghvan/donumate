> For the complete documentation index, see [llms.txt](https://docs.gpmautomate.com/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://docs.gpmautomate.com/switch/switch-to-frame.md).

# Switch to frame

&#x20;Bạn cần điền xpath của phần tử frame đó. VD: //iframe.

Ví dụ: Khi bạn tương tác với 1 mini game (Blum chẳng hạn) trên Telegram. Phần nội dung game nằm trong phần tử có xpath là //iframe (như hình). Để tương tác với các thành phần trong game, bạn cần thêm một bước là Switch to frame, để chuyển đổi ngữ cảnh từ trang web bên ngoài (Telegram) vào trang được nhúng bên trong (chính là game Blum, được khoanh đỏ trong hình). Hiểu đơn giản, một iframe là một thành phần được nhúng trong 1 trang web cha, để tương tác với nó phải dùng Switch to frame. Sau khi thực hiện tương tác với frame xong, để quay trở lại tương tác với Telegram (trang cha), bạn cần dùng Switch to default.

<figure><img src="/files/M3iWNQ6FRfcSI60pRkGl" alt=""><figcaption></figcaption></figure>


---

# Agent Instructions
This documentation is published with GitBook. GitBook is the documentation platform designed so that both humans and AI agents can read, navigate, and reason over technical content effectively. Learn more at gitbook.com.

## Querying This Documentation
If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on the current page URL with the `ask` query parameter:

```
GET https://docs.gpmautomate.com/switch/switch-to-frame.md?ask=<question>
```

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
