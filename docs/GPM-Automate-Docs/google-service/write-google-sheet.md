> For the complete documentation index, see [llms.txt](https://docs.gpmautomate.com/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://docs.gpmautomate.com/google-service/write-google-sheet.md).

# Write google sheet

**Credential file:** Chọn file xác thực tài khoản Google (file có đuôi là JSON). Cách tạo file này vui lòng xem video bên dưới. Mục đích dùng để kết nối với google sheets, xác thực và cấp quyền cho automate đọc ghi nội dung lên google sheet.\
Link video: <https://www.youtube.com/watch?app=desktop&v=BLPN5d_wDL4>\
**File ID:** ID của file google sheets (nhằm xác định file google sheet nào cần đọc, ghi dữ liệu).\
Cách lấy ID như sau:

<figure><img src="/files/gbGT1VPxtnhEAJWnsCFU" alt=""><figcaption><p>Cách lấy ID của file Google Sheet (phần khoanh đỏ)</p></figcaption></figure>

**Sheet ID:** Số thứ tự của sheet cần đọc trong file excel (bắt đầu từ 0, tính từ trái qua phải).

<figure><img src="/files/p4cbRbf5OTHmTc8Mo7M0" alt=""><figcaption></figcaption></figure>

**Column Name or Index:** Tên cột, bắt đầu từ A, B, C,.. hoặc index bắt đầu từ 1 (cột 1).\
**Row Index:** Bắt đầu từ 1 (hàng 1).\
**Value:** Giá trị bạn cần ghi lên google sheets


---

# Agent Instructions
This documentation is published with GitBook. GitBook is the documentation platform designed so that both humans and AI agents can read, navigate, and reason over technical content effectively. Learn more at gitbook.com.

## Querying This Documentation
If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on the current page URL with the `ask` query parameter:

```
GET https://docs.gpmautomate.com/google-service/write-google-sheet.md?ask=<question>
```

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
