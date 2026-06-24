> For the complete documentation index, see [llms.txt](https://docs.gpmautomate.com/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://docs.gpmautomate.com/no-code-automation/cac-block.md).

# Các block

- [Normal block](https://docs.gpmautomate.com/no-code-automation/cac-block/normal-block.md): Khối code tuần tự, các hành động sẽ chạy từ trên xuống dưới.
- [For](https://docs.gpmautomate.com/no-code-automation/cac-block/for.md): Block lặp, dùng để lặp đi lặp lại 1 khối code, có giới hạn số lần lặp.
- [While](https://docs.gpmautomate.com/no-code-automation/cac-block/while.md): Block lặp, dùng để lặp đi lặp lại 1 khối code, sẽ dừng khi điều kiện Condition được thoả mãn.
- [If](https://docs.gpmautomate.com/no-code-automation/cac-block/if.md): Kiểm tra điều kiện đã xác định, nếu đúng thì thực hiện các hành động bên trong khối If.
- [Else if](https://docs.gpmautomate.com/no-code-automation/cac-block/else-if.md): Kiểm tra điều kiện khác khi điều kiện If không thỏa mãn, nếu đúng thì thực hiện các hành động bên trong khối Else if.
- [Else](https://docs.gpmautomate.com/no-code-automation/cac-block/else.md): Thực hiện các hành động bên trong khối Else khi tất cả các điều kiện If và Else If không thỏa mãn.


---

# Agent Instructions
This documentation is published with GitBook. GitBook is the documentation platform designed so that both humans and AI agents can read, navigate, and reason over technical content effectively. Learn more at gitbook.com.

## Querying This Documentation
If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on the current page URL with the `ask` query parameter:

```
GET https://docs.gpmautomate.com/no-code-automation/cac-block.md?ask=<question>
```

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
