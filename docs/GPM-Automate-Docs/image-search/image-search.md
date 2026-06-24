> For the complete documentation index, see [llms.txt](https://docs.gpmautomate.com/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://docs.gpmautomate.com/image-search/image-search.md).

# Image search

**Chú ý:** Hãy đảm bảo tỉ lệ scale của trang web lúc bạn screenshot ảnh phải giống với tỉ lệ scale lúc bạn chạy thực tế. Nếu không tính năng này sẽ không hoạt động.

Sẽ trả về toạ độ ủa hình ảnh nếu tìm thấy, kết quả có dạng cặp toạ độ (x,y).\
Nếu không tìm thấy sẽ trả về -1,-1.

VD: Bạn có thể kết hợp với action `Wait to image`,`If`, `Else if` và `Else, Image Search, Mouse click.`\
Mục đích: Chờ 1 hình ảnh xuất hiện trên trang web. Nếu nó tồn tại thì sẽ thực hiện các hành động tìm toạ độ hình ảnh và click vào ảnh đó trong khối `If`, nếu không thì thực hiện hành động trong khối `Else` hoặc bỏ qua, sang bước tiếp theo.<br>

<figure><img src="/files/AdMkE7KBUTz51rrveF3j" alt=""><figcaption><p>action Image</p></figcaption></figure>

## Giải thích thêm về các tham số trong action Image

Threshold: Độ chính xác của hình ảnh. Giá trị nằm trong khoảng từ 0-1. Threshold càng cao thì yêu cầu độ chính xác của hình ảnh càng cao, nhưng thời gian tìm hình ảnh sẽ lâu hơn.\
Nếu không điền thì giá trị mặc định là 0.7 (độ chính xác tương đối).


---

# Agent Instructions
This documentation is published with GitBook. GitBook is the documentation platform designed so that both humans and AI agents can read, navigate, and reason over technical content effectively. Learn more at gitbook.com.

## Querying This Documentation
If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on the current page URL with the `ask` query parameter:

```
GET https://docs.gpmautomate.com/image-search/image-search.md?ask=<question>
```

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
