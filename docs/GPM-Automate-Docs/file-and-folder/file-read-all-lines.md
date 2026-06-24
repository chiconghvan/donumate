> For the complete documentation index, see [llms.txt](https://docs.gpmautomate.com/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://docs.gpmautomate.com/file-and-folder/file-read-all-lines.md).

# File read all lines

VD: Bạn có 1 file text `proxies_list.txt` như hình bên dưới, đường dẫn là `D:\proxies_list.txt`\
File text này gồm 5 dòng, mỗi dòng tương ứng với 1 proxy.

Chú ý: Bạn có thể lấy được số dòng của file text bằng action Count như hướng dẫn ở đây:\
<https://docs.gpmautomate.com/no-code-automation/variables/count>

Bạn áp dụng điền cho action File read all lines như sau:

<figure><img src="/files/Khod9D3zp8PKwBZ8hkG9" alt=""><figcaption><p>File read all lines</p></figcaption></figure>

<figure><img src="/files/ICqLRVxCCTQp8Taq3qLu" alt=""><figcaption><p>File D:\proxies_list.txt</p></figcaption></figure>

<figure><img src="/files/ut9ad8r0elyU66Ukd0JP" alt=""><figcaption><p>Nội dung file proxies_list.txt</p></figcaption></figure>

Khi đó kết quả trả về là 1 mảng $fileContent, với index bắt đầu từ 0, và các phần tử của nó lần lượt là:

* $fileContent\[0] = 182.74.243.35:8080:zkf82mx:pa9sLd3q
* $fileContent\[1] = 103.152.232.153:8080:nv38qkz:vK28szpL
* $fileContent\[2] = 185.199.228.171:7492:alx9wpe:Jd72kq1x
* $fileContent\[3] = 134.209.29.120:3128:rcm1vuo:Yp7dLq3n
* $fileContent\[4] = 47.243.180.142:8080:txe57nd:Wx9qTf6b

Bạn có thể kết hợp với vòng lặp For để đọc nội dung file text như hướng dẫn trên.


---

# Agent Instructions
This documentation is published with GitBook. GitBook is the documentation platform designed so that both humans and AI agents can read, navigate, and reason over technical content effectively. Learn more at gitbook.com.

## Querying This Documentation
If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on the current page URL with the `ask` query parameter:

```
GET https://docs.gpmautomate.com/file-and-folder/file-read-all-lines.md?ask=<question>
```

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
