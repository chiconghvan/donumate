> For the complete documentation index, see [llms.txt](https://docs.gpmautomate.com/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://docs.gpmautomate.com/file-and-folder.md).

# File & Folder

- [File exists](https://docs.gpmautomate.com/file-and-folder/file-exists.md): Kiểm tra xem một file có tồn tại hay không Trả về kết quả True/False.
- [Copy file](https://docs.gpmautomate.com/file-and-folder/copy-file.md): Copy file dựa trên đường dẫn.
- [Move/rename file](https://docs.gpmautomate.com/file-and-folder/move-rename-file.md): Di chuyển/ đổi tên file dựa trên đường dẫn.
- [Delete file](https://docs.gpmautomate.com/file-and-folder/delete-file.md): Xoá file theo đường dẫn File Path.
- [File read all text](https://docs.gpmautomate.com/file-and-folder/file-read-all-text.md): Đọc toàn bộ nội dung của một file văn bản text. Kết quả trả về dưới dạng một chuỗi.
- [File read all lines](https://docs.gpmautomate.com/file-and-folder/file-read-all-lines.md): Đọc toàn bộ nội dung của một file văn bản text (\*.txt) và trả về dưới dạng một danh sách các dòng (mảng 1 chiều có phần tử là nội dung của từng dòng). Index bắt đầu từ 0.
- [File write all text](https://docs.gpmautomate.com/file-and-folder/file-write-all-text.md): Ghi toàn bộ chuỗi văn bản vào một file text chỉ định. Nếu file đã có nội dung thì sẽ ghi đè toàn bộ nội dung cũ.
- [File append line](https://docs.gpmautomate.com/file-and-folder/file-append-line.md): Thêm một dòng văn bản vào cuối file văn bản text mà không ghi đè nội dung hiện tại của file.
- [Read excel file](https://docs.gpmautomate.com/file-and-folder/read-excel-file.md): Đọc nội dung của 1 file excel.
- [Write excel file](https://docs.gpmautomate.com/file-and-folder/write-excel-file.md): Ghi nội dung vào 1 file excel.
- [Append excel file](https://docs.gpmautomate.com/file-and-folder/append-excel-file.md): Thêm dữ liệu mới vào cuối một file excel hiện có mà không ghi đè nội dung hiện tại.
- [Folder exists](https://docs.gpmautomate.com/file-and-folder/folder-exists.md): Kiểm tra xem một thư mục có tồn tại hay không. Trả về kết quả True/False.
- [Create folder](https://docs.gpmautomate.com/file-and-folder/create-folder.md): Tạo mới thư mục dựa trên đường dẫn.
- [Move / rename folder](https://docs.gpmautomate.com/file-and-folder/move-rename-folder.md): Di chuyển, đổi tên thư mục.
- [Delete folder](https://docs.gpmautomate.com/file-and-folder/delete-folder.md): Xoá thư mục theo đường dẫn.
- [Folder get file list](https://docs.gpmautomate.com/file-and-folder/folder-get-file-list.md): Lấy danh sách file trong một thư mục. Kết quả trả về dưới dạng mảng 1 chiều với các phần tử là đường dẫn tới các file. Không bao gồm file trong các thư mục con. Index bắt đầu từ 0.


---

# Agent Instructions
This documentation is published with GitBook. GitBook is the documentation platform designed so that both humans and AI agents can read, navigate, and reason over technical content effectively. Learn more at gitbook.com.

## Querying This Documentation
If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on the current page URL with the `ask` query parameter:

```
GET https://docs.gpmautomate.com/file-and-folder.md?ask=<question>
```

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
