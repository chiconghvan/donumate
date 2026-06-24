> For the complete documentation index, see [llms.txt](https://docs.gpmautomate.com/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://docs.gpmautomate.com/no-code-automation/cac-block/for.md).

# For

## Các tham số trong vòng lặp For

| Tham số      | Giải thích                                                                                                            |
| ------------ | --------------------------------------------------------------------------------------------------------------------- |
| `$loopIndex` | `$loopIndex` theo dõi số lần lặp trong một vòng lặp, giúp xác định và truy cập từng phần tử trong danh sách hoặc mảng |
| Start        | Giá trị bắt đầu của biến lặp `$loopIndex`                                                                             |
| End          | Giá trị kết thúc của biến lặp `$loopIndex` là End-1                                                                   |
| Increase by  | Bước nhảy của biến lặp `$loopIndex`                                                                                   |

Ví dụ: Kết hợp For để đọc file Input Excel. Giả sử bạn cần đọc dữ liệu tất cả dữ liệu từ cột B từ 1 file excel tên là test. Dùng biến **$inputExcelTotalRows** kết hợp với For.

<figure><img src="/files/TaBW1mE5Xx0xUShhYJds" alt=""><figcaption><p>Input Excel</p></figcaption></figure>

<figure><img src="/files/IYa6ggSaLccD64iYvKvH" alt=""><figcaption><p>For</p></figcaption></figure>

<figure><img src="/files/ErkBJUkmOD3EWiSBN55j" alt=""><figcaption><p>Set variable</p></figcaption></figure>


---

# Agent Instructions
This documentation is published with GitBook. GitBook is the documentation platform designed so that both humans and AI agents can read, navigate, and reason over technical content effectively. Learn more at gitbook.com.

## Querying This Documentation
If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on the current page URL with the `ask` query parameter:

```
GET https://docs.gpmautomate.com/no-code-automation/cac-block/for.md?ask=<question>
```

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
