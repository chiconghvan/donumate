> For the complete documentation index, see [llms.txt](https://docs.gpmautomate.com/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://docs.gpmautomate.com/file-and-folder/folder-get-file-list.md).

# Folder get file list

VD: Bạn có 1 thư mục như hình bên dưới, đường dẫn là D:\test case.\
Thư mục này gồm 5 file.&#x20;

Chú ý: Bạn có thể lấy được số file trong thư mục bằng action Count như hướng dẫn ở đây:\
<https://docs.gpmautomate.com/no-code-automation/variables/count>

Bạn áp dụng điền cho action Folder get file list như sau:

<figure><img src="/files/J4D6ZiLM1RjzpiRW1W92" alt=""><figcaption><p>Folder get file list</p></figcaption></figure>

<figure><img src="/files/atBSmdPjX5hES6GfsG87" alt=""><figcaption><p>Thư mục D:\test case</p></figcaption></figure>

Khi đó kết quả trả về là 1 mảng $fileList, với index bắt đầu từ 0, và các phần tử của nó lần lượt là:

* $fileList\[0] = D:\test case\1234.txt
* $fileList\[1] = D:\test case\danhsach.xlsx
* $fileList\[2] = D:\test case\document.docx
* $fileList\[3] = D:\test case\test wait image.gpmcode
* $fileList\[4] = D:\test case\test wallet.txt

Bạn có thể áp dụng thêm với vòng lặp For để lấy danh sách đường dẫn file như hướng dẫn trên.


---

# Agent Instructions
This documentation is published with GitBook. GitBook is the documentation platform designed so that both humans and AI agents can read, navigate, and reason over technical content effectively. Learn more at gitbook.com.

## Querying This Documentation
If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on the current page URL with the `ask` query parameter:

```
GET https://docs.gpmautomate.com/file-and-folder/folder-get-file-list.md?ask=<question>
```

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
