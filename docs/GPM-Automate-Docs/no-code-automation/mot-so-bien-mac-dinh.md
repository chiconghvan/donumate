> For the complete documentation index, see [llms.txt](https://docs.gpmautomate.com/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://docs.gpmautomate.com/no-code-automation/mot-so-bien-mac-dinh.md).

# Một số biến mặc định

1. **$profileName:** giá trị của biến này là tên của profile đang mở.
2. **$profileId:** giá trị của biến này là ID của profile đang mở.
3. **$profileProxy:** giá trị của biến này là proxy mà profile đang mở sử dụng.
4. **$loopIndex:** chỉ số của vòng lặp For.
5. **$inputExcel:** file excel đầu vào, khi tool của bạn viết có nội dung cần đọc ghi dữ liệu từ 1 file excel.
6. **$inputExcelTotalRows:** trả về tổng số dòng của 1 file input excel (ở mục số 5).
7. **$inputExcelFileLocation:** trả về đường dẫn (file path) của file input excel (ở mục số 5).
8. **$inputExcelCurrentRow:** trả về số thứ tự dòng hiện tại đang được truy xuất của file input excel khi thực hiện việc đọc excel.<br>


---

# Agent Instructions
This documentation is published with GitBook. GitBook is the documentation platform designed so that both humans and AI agents can read, navigate, and reason over technical content effectively. Learn more at gitbook.com.

## Querying This Documentation
If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on the current page URL with the `ask` query parameter:

```
GET https://docs.gpmautomate.com/no-code-automation/mot-so-bien-mac-dinh.md?ask=<question>
```

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
