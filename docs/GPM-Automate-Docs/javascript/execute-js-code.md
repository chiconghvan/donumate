> For the complete documentation index, see [llms.txt](https://docs.gpmautomate.com/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://docs.gpmautomate.com/javascript/execute-js-code.md).

# Execute JS code

## Giải thích thêm về các action Execute JS code

Chạy code Javascript trong trình duyệt.\
Bạn có thể paste code trực tiếp vào action này hoặc paste đường dẫn tới file .js\
**Chú ý:** Để đoạn JS code xử lý và trả về 1 giá trị, bạn cần thêm lệnh **return** ở cuối đoạn code JS.

**Chú ý:** Bạn hoàn toàn có thể **nhúng biến từ Automate** vào trong đoạn code js và **trả kết quả về 1 biến Automate** sau khi chạy code js. ***Chú ý với biến dạng string phải có dấu backtick (hoặc dấu double quotes, single quotes bao bọc nhé).***

**Ví dụ:** Bạn có 1 biến str trong Automate như sau: \
str = Hello, world!\
1 biến index = 7.\
Bạn muốn dùng action Execute JS code để viết 1 đoạn js lấy ra ký tự có index là 7 trong chuỗi str "Hello, world!" (kết quả là ký tự w). Bạn có thể viết như sau:

``const str = `$str`;``\
`const index = $index;`\
`const char = index >= 0 && index < str.length ? str[index] : "Invalid index";`

`return char;`

<figure><img src="/files/r3raTtcvQtXOsacPMa7Z" alt=""><figcaption><p>Set variable</p></figcaption></figure>

<figure><img src="/files/vWr2XvDWZbVcfdl8gaYt" alt=""><figcaption><p>Set variable</p></figcaption></figure>

<figure><img src="/files/8NDIapjhZFxMVB5GSMrh" alt=""><figcaption></figcaption></figure>


---

# Agent Instructions
This documentation is published with GitBook. GitBook is the documentation platform designed so that both humans and AI agents can read, navigate, and reason over technical content effectively. Learn more at gitbook.com.

## Querying This Documentation
If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on the current page URL with the `ask` query parameter:

```
GET https://docs.gpmautomate.com/javascript/execute-js-code.md?ask=<question>
```

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
