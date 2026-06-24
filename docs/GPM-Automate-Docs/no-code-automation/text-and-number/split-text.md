> For the complete documentation index, see [llms.txt](https://docs.gpmautomate.com/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://docs.gpmautomate.com/no-code-automation/text-and-number/split-text.md).

# Split text

VD: Có 1 chuỗi đầu vào là `hello|my|name|is|GPM|Automate`\
Kết quả trả về là mảng ký tự `a`. Từ đó có thể lấy được các đoạn text được ngăn cách bởi dấu | như sau:\
`$a[0] = hello`\
`$a[1] = my`\
`$a[2] = name`\
`$a[3] = is`\
`$a[4] = GPM`\
`$a[5] = Automate`\
**Chú ý:** Chỉ số của mảng ký tự bắt đầu từ 0.<br>

<figure><img src="/files/pra4XM7QK4kkEBQnaYSM" alt=""><figcaption><p>Split text</p></figcaption></figure>


---

# Agent Instructions
This documentation is published with GitBook. GitBook is the documentation platform designed so that both humans and AI agents can read, navigate, and reason over technical content effectively. Learn more at gitbook.com.

## Querying This Documentation
If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on the current page URL with the `ask` query parameter:

```
GET https://docs.gpmautomate.com/no-code-automation/text-and-number/split-text.md?ask=<question>
```

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
