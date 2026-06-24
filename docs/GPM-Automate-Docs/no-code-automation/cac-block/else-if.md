> For the complete documentation index, see [llms.txt](https://docs.gpmautomate.com/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://docs.gpmautomate.com/no-code-automation/cac-block/else-if.md).

# Else if

## Các điều kiện trong khối rẽ nhánh (If, Else if, Else)

| Điều kiện          | Chức năng                                                                                                                                            |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| >                  | Lớn hơn, áp dụng cho kiểu dữ liệu là số                                                                                                              |
| <                  | Nhỏ hơn, áp dụng cho kiểu dữ liệu là số                                                                                                              |
| >=                 | Lớn hơn hoặc bằng, áp dụng cho kiểu dữ liệu là số                                                                                                    |
| <=                 | Nhỏ hơn hoặc bằng, áp dụng cho kiểu dữ liệu là số                                                                                                    |
| =                  | <p>Áp dụng cho cả kiểu dữ liệu số và chuỗi<br>VD: 3 = 3 -> true<br>hello = hola -> false</p>                                                         |
| !=                 | <p>Áp dụng cho cả kiểu dữ liệu số và chuỗi<br>Phủ định của điều kiện =<br>VD: 3 != 4 -> true<br>hello != hello -> false</p>                          |
| hasElement(XPATH)  | Điều kiện xuất hiện một element                                                                                                                      |
| !hasElement(XPATH) | Điều kiện **không** xuất hiện một element, tức là phủ định của hasElement(XPATH)                                                                     |
| A contains B       | <p>Kiểm tra xem chuỗi A có chứa chuỗi B không<br>VD: ABCD contains AB ->  true (đúng)<br>AB contains ABCD -> false (sai)</p>                         |
| !A contains B      | <p>Kiểm tra xem chuỗi A có <strong>KHÔNG</strong> chứa chuỗi B không<br>VD: !ABCD contains AB -> false (sai)<br>!AB contains ABCD -> true (đúng)</p> |
| contains B         | Kiểm tra xem chuỗi B có phải là chuỗi rỗng hay không (rỗng chứa B) -> True (rỗng), False (không rỗng)                                                |


---

# Agent Instructions
This documentation is published with GitBook. GitBook is the documentation platform designed so that both humans and AI agents can read, navigate, and reason over technical content effectively. Learn more at gitbook.com.

## Querying This Documentation
If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on the current page URL with the `ask` query parameter:

```
GET https://docs.gpmautomate.com/no-code-automation/cac-block/else-if.md?ask=<question>
```

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
