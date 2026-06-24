> For the complete documentation index, see [llms.txt](https://docs.gpmautomate.com/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://docs.gpmautomate.com/mail/read-mail-code.md).

# Read mail code

**Chú ý:** Tài khoản mail cần phải bật trước giao thức IMAP.\
Riêng với Gmail, cần tạo mật khẩu ứng dụng Gmail.\
Hướng dẫn cách tạo:  <https://www.youtube.com/watch?v=XqX0cXcp6DI>

## Giải thích các thông số trong action Read mail code

1. **Email:** Điền địa chỉ email cần đọc code
2. **Password:** Điền mật khẩu của email
3. **Mail server:** Máy chủ IMAP của mail.\
   VD: Gmail: imap.gmail.com\
   Outlook: outlook.office365.com
4. **Email sent to contains:** Địa chỉ email gửi đến có chứa cụm từ đó
5. **Code type:** gồm 2 loại là number (kiểu số) và text (kiểu chữ)\
   Kiểu number: \
   Code Length: Độ dài của otp cần đọc (ví dụ 475997 -> Code length là 6)\
   Kiểu text: \
   Code element xpath: Xpath của phần tử chứa mã OTP cần lấy\
   Code element attribute: Điền text (nếu mã OTP cần lấy là text của 1 phần tử), hoặc điền tên thuộc tính nếu mã OTP cần lấy là giá trị của thuộc tính của phần tử đó.\
   Ví dụ: Trong nội dung của email chứa code cần đọc, đoạn otp có xpath như sau:\
   Nếu xpath là `<h1>ABCDEF</h1>` -> Tức là giá trị của mã OTP là text của phần tử có xpath là //h1 -> Điền Code element xpath là: //h1 và Code element attribute điền là: text\
   Nếu xpath là `<h1 @code="ABCDEF"></h1>` -> Tức là giá trị của mã OTP cần lấy là giá trị của thuộc tính @code trong phần tử có xpath //h1 -> Điền mục Code element xpath là: //h1 và Code element attribute điền là: code\
   Tất nhiên ở đây chỉ là ví dụ. Trên thực tế xpath có thể không đơn giản là //h1, có thể phức tạp hơn. Bạn cần hiểu kỹ phần cơ bản về cách lấy xpath của 1 thành phần trên trang web.


---

# Agent Instructions
This documentation is published with GitBook. GitBook is the documentation platform designed so that both humans and AI agents can read, navigate, and reason over technical content effectively. Learn more at gitbook.com.

## Querying This Documentation
If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on the current page URL with the `ask` query parameter:

```
GET https://docs.gpmautomate.com/mail/read-mail-code.md?ask=<question>
```

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
