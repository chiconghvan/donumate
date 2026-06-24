> For the complete documentation index, see [llms.txt](https://docs.gpmautomate.com/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://docs.gpmautomate.com/mail/read-outlook-oauth2.md).

# Read outlook (Oauth2)

**Chú ý:** Tài khoản mail cần phải bật trước giao thức IMAP.

## Giải thích các thông số trong action Read mail code

1. **Email|Pass or Email|Refresh token|Client ID:** Điền thông tin email cần đọc code. Hiện nay khi mua mail outlook từ các trang bán mail, bạn thường được cung cấp 4 thông tin tài khoản dưới dạng: **Email|Pass|Refresh token|Client ID.** Bạn cần điền thông tin theo đúng định dạng như trên (Email|Pass hoặc Email|Refresh token|Client ID).
2. **Email sent to contains:** Địa chỉ email gửi đến có chứa cụm từ đó. \
   Ví dụ: Bạn cần đọc code từ mail gửi tới có dạng <noreply@tiktok.com>, thì cần điền <noreply@tiktok.com> vào mục này.
3. **Code type:** gồm 2 loại là number (kiểu số) và text (kiểu chữ)\
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
GET https://docs.gpmautomate.com/mail/read-outlook-oauth2.md?ask=<question>
```

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
