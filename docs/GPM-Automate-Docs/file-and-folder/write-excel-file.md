> For the complete documentation index, see [llms.txt](https://docs.gpmautomate.com/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://docs.gpmautomate.com/file-and-folder/write-excel-file.md).

# Write excel file

**File Path:** đường dẫn file excel.\
**Sheet index:** Index của sheet cần đọc trong file excel (bắt đầu từ 0).\
**Column Name or Index:** Tên cột, bắt đầu từ A, B, C,.. hoặc index bắt đầu từ 1 (cột 1).\
**Row Index:** Bắt đầu từ 1 (hàng 1).

**Ví dụ thực tế:**

Giả sử bạn muốn ghi giá trị vào excel khớp theo đúng từng dòng tương ứng với profile đang chạy. Kết hợp biến **$inputExcelFileLocation** và **$inputExcelCurrentRow**

<figure><img src="/files/0Poni0YX2qSAcshHXpfs" alt=""><figcaption><p>Input Excel</p></figcaption></figure>

<figure><img src="/files/mzXUR41t7V9ia3Pi5X29" alt=""><figcaption><p>For</p></figcaption></figure>

<figure><img src="/files/4jl6BWsjEgZhDTlx76ZH" alt=""><figcaption><p>Write Excel</p></figcaption></figure>


---

# Agent Instructions
This documentation is published with GitBook. GitBook is the documentation platform designed so that both humans and AI agents can read, navigate, and reason over technical content effectively. Learn more at gitbook.com.

## Querying This Documentation
If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on the current page URL with the `ask` query parameter:

```
GET https://docs.gpmautomate.com/file-and-folder/write-excel-file.md?ask=<question>
```

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
