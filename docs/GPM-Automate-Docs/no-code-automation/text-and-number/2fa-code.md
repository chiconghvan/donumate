> For the complete documentation index, see [llms.txt](https://docs.gpmautomate.com/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://docs.gpmautomate.com/no-code-automation/text-and-number/2fa-code.md).

# 2FA code

**Chú ý:** Để action này trả về đúng code cần đồng bộ giờ trong cài đặt của máy tính về chuẩn giờ Internet.

<figure><img src="/files/CiBXzQlElUUAb8wkDesj" alt=""><figcaption><p>PC Settings</p></figcaption></figure>

<figure><img src="/files/OOwZqY4R3XwsHvp0Nh9i" alt=""><figcaption><p>Ví dụ</p></figcaption></figure>

Kết quả sẽ được lưu vào biến $code. Bạn cũng có thể nhúng Secret Key từ các biến khác hoặc từ Input Excel. Ví dụ Secret Key được lưu ở cột B thì điền $inputExcel\[B].


---

# Agent Instructions
This documentation is published with GitBook. GitBook is the documentation platform designed so that both humans and AI agents can read, navigate, and reason over technical content effectively. Learn more at gitbook.com.

## Querying This Documentation
If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on the current page URL with the `ask` query parameter:

```
GET https://docs.gpmautomate.com/no-code-automation/text-and-number/2fa-code.md?ask=<question>
```

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
