> For the complete documentation index, see [llms.txt](https://docs.gpmautomate.com/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://docs.gpmautomate.com/mail.md).

# Mail

- [Read mail code](https://docs.gpmautomate.com/mail/read-mail-code.md): Đọc code OTP gửi mail. Điều kiện là mail đó chưa được đọc.
- [Read outlook (Oauth2)](https://docs.gpmautomate.com/mail/read-outlook-oauth2.md): Đọc code OTP gửi mail outlook hay hotmail. Điều kiện là mail đó chưa được đọc. Sẽ luôn lấy code mới nhất thoả mãn điều kiện.


---

# Agent Instructions
This documentation is published with GitBook. GitBook is the documentation platform designed so that both humans and AI agents can read, navigate, and reason over technical content effectively. Learn more at gitbook.com.

## Querying This Documentation
If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on the current page URL with the `ask` query parameter:

```
GET https://docs.gpmautomate.com/mail.md?ask=<question>
```

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
