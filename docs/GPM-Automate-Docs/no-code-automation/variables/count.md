> For the complete documentation index, see [llms.txt](https://docs.gpmautomate.com/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://docs.gpmautomate.com/no-code-automation/variables/count.md).

# Count

Có thể dụng khi đếm số dòng của 1 file text, hay dùng để lấy số lượng file khi dùng action Folder get file list.

## Ví dụ cho action Count

1. Đếm số lượng dòng trong file text. Dùng 2 action là File read all lines và Count như hình dưới.<br>

   <figure><img src="/files/GvFE3Tf4ulT03Z8Sdsts" alt=""><figcaption><p>File read all lines</p></figcaption></figure>

   <figure><img src="/files/heES3wd4jz9KagGIs65L" alt=""><figcaption><p>Count</p></figcaption></figure>
2. Đếm số lượng file trong 1 folder khi dùng action Folder get file list.<br>

   <figure><img src="/files/V6RLrJS4kbO8oYkkdHYS" alt=""><figcaption><p>Folder get file list</p></figcaption></figure>

   <figure><img src="/files/5s5a9g0P7QcKMTVdc1KC" alt=""><figcaption><p>Count</p></figcaption></figure>
3. Đếm số phần tử trong danh sách sau khi tách chuỗi bằng Split text.

Ví dụ: Có 1 chuỗi đầu vào là `hello|my|name|is|GPM|Automate`

<figure><img src="/files/ohCxKOBzBUCvAw0AXKNq" alt=""><figcaption><p>Split text</p></figcaption></figure>

<figure><img src="/files/LWGJg6bk6HT8egRGFxJ8" alt=""><figcaption><p>Count</p></figcaption></figure>

Chuỗi được ngăn cách bởi dấu |. Sau khi dùng action Split text, biến count sẽ đếm được số phần tử sau khi tách chuỗi (như ở ví dụ trên thì count sẽ có giá trị là 6).


---

# Agent Instructions
This documentation is published with GitBook. GitBook is the documentation platform designed so that both humans and AI agents can read, navigate, and reason over technical content effectively. Learn more at gitbook.com.

## Querying This Documentation
If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on the current page URL with the `ask` query parameter:

```
GET https://docs.gpmautomate.com/no-code-automation/variables/count.md?ask=<question>
```

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
