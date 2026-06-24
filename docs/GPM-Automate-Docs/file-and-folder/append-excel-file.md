> For the complete documentation index, see [llms.txt](https://docs.gpmautomate.com/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://docs.gpmautomate.com/file-and-folder/append-excel-file.md).

# Append excel file

**File Path:** đường dẫn file excel.\
**Sheet index:** Index của sheet cần đọc trong file excel (bắt đầu từ 0).\
**Column Name or Index:** Tên cột, bắt đầu từ A, B, C,.. hoặc index bắt đầu từ 1 (cột 1).\
**Row Index:** Bắt đầu từ 1 (hàng 1).

**Ví dụ thực tế:**\
Giả sử bạn đang có file Excel có nội dung như hình dưới. Bạn muốn ghi tiếp nội dung vào cột  B từ dòng thứ 5 trở đi (dòng trống).

<figure><img src="/files/6bdaPo1aMDmwVrYAqQYi" alt=""><figcaption></figcaption></figure>

<figure><img src="/files/oR29NFK3UEaaUuj2vTj7" alt=""><figcaption><p>Append excel file</p></figcaption></figure>

<figure><img src="/files/85fkDJ0WVURlRJoHiJLW" alt=""><figcaption><p>Append excel file</p></figcaption></figure>


---

# Agent Instructions
This documentation is published with GitBook. GitBook is the documentation platform designed so that both humans and AI agents can read, navigate, and reason over technical content effectively. Learn more at gitbook.com.

## Querying This Documentation
If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on the current page URL with the `ask` query parameter:

```
GET https://docs.gpmautomate.com/file-and-folder/append-excel-file.md?ask=<question>
```

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
