> For the complete documentation index, see [llms.txt](https://docs.gpmautomate.com/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://docs.gpmautomate.com/mouse/mouse-try-to-click.md).

# Mouse try to click

## Giải thích thêm về action Mouse try to click

1. **Number of tries:** Số lần click.
2. **Delay each clicks:** Thời gian chờ giữa 2 lần click liên tiếp.
3. **Stop condition:** Điều kiện dừng click. Sẽ click liên tục đến khi điều kiện này được thoả mãn hoặc khi hết số lần click Number of tries.\
   VD: Click đến khi có 1 phần tử xuất hiện hoặc biến mất, có thể kết hợp với điều kiện `hasElement(XPATH)` hoặc `!hasElement(XPATH)`.


---

# Agent Instructions
This documentation is published with GitBook. GitBook is the documentation platform designed so that both humans and AI agents can read, navigate, and reason over technical content effectively. Learn more at gitbook.com.

## Querying This Documentation
If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on the current page URL with the `ask` query parameter:

```
GET https://docs.gpmautomate.com/mouse/mouse-try-to-click.md?ask=<question>
```

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
