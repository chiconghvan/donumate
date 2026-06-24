> For the complete documentation index, see [llms.txt](https://docs.gpmautomate.com/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://docs.gpmautomate.com/no-code-automation/text-and-number/regex.md).

# Regex

**Ví dụ:**\
Câu: *"Tôi có 3 con mèo và 12 con chó"*\
Để trích xuất các số **3** và **12**, ta dùng biểu thức: `\d+`\
Đây chính là **regex** (viết tắt của *regular expression* – biểu thức chính quy). Cú pháp này không viết ngẫu nhiên mà tuân theo các quy tắc rõ ràng.

Để tìm hiểu thêm về regex, bạn có thể hỏi ChatGPT, tra Google hoặc xem các video hướng dẫn trên YouTube.

**Ví dụ thực tế:**\
Khi làm automation để lấy mã OTP từ email. Ví dụ email có nội dung:\
\&#xNAN;*"Mã xác thực của bạn là 843921. Vui lòng không chia sẻ mã này."*\
Ta dùng biểu thức: `\b\d{6}\b` để lấy chính xác đoạn **6 chữ số** là **843921**.\
Biểu thức này có nghĩa là: tìm **1 đoạn 6 số tách biệt**, thường dùng cho mã xác thực.

Cách viết regex cụ thể theo từng tình huống, bạn có thể nhờ ChatGPT hỗ trợ. Ở đây chỉ là ví dụ minh họa.

Cách điền như sau:

<figure><img src="/files/x36CCjqf3siEdws4EMbL" alt=""><figcaption><p>Regex</p></figcaption></figure>


---

# Agent Instructions
This documentation is published with GitBook. GitBook is the documentation platform designed so that both humans and AI agents can read, navigate, and reason over technical content effectively. Learn more at gitbook.com.

## Querying This Documentation
If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on the current page URL with the `ask` query parameter:

```
GET https://docs.gpmautomate.com/no-code-automation/text-and-number/regex.md?ask=<question>
```

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
