> For the complete documentation index, see [llms.txt](https://docs.gpmautomate.com/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://docs.gpmautomate.com/http/http-request.md).

# HTTP Request

## Giải thích thêm về 1 số thông số khi dùng action HTTP Request

1. **URL:** Địa chỉ của tài nguyên trên server.
2. **Method:** Phương thức HTTP để thực hiện yêu cầu, ví dụ: GET, POST, PUT, DELETE,...
3. **Header:** Thông tin bổ sung gửi kèm yêu cầu, chẳng hạn như loại nội dung và thông tin xác thực.\
   VD: Authorization: Bearer \<token>,...
4. **Data:** Dữ liệu gửi kèm trong yêu cầu (chỉ áp dụng cho một số phương thức như POST và PUT) (chính là body/payload).
5. **Use profile's proxy:** Sử dụng proxy của profile khi thực hiện request thay vì dùng local ip.<br>

**Ví dụ 1:** Với dạng body **application/json** thì phần body điền theo định dạng:

<figure><img src="/files/ckdYvXla2HPUUmZvNekp" alt=""><figcaption><p>HTTP Request 1</p></figcaption></figure>

<figure><img src="/files/xs3HylcazBSum7LHTFM5" alt=""><figcaption><p>HTTP Request 2</p></figcaption></figure>

**Ví dụ 2:** Với dạng body **application/x-www-form-urlencoded** thì phần body điền theo định dạng: key1=value1\&key2=value2\&key3=value3 (các cặp key-value nối với nhau bởi dấu &)

<figure><img src="/files/zr6kyOAPN2UhAT1jnugc" alt=""><figcaption><p>Postman</p></figcaption></figure>

<figure><img src="/files/QtPxIOnxWRWOfkNEal3Q" alt=""><figcaption><p>HTTP Request 1</p></figcaption></figure>

<figure><img src="/files/C3E1X0PrFH5RMQ6iFjlP" alt=""><figcaption><p>HTTP Request 2</p></figcaption></figure>

**Ví dụ 3:** Với dạng body **multipart/form-data** thì phần body điền theo định dạng:

<figure><img src="/files/NGvpSajXYrI1yQQtMSXw" alt=""><figcaption><p>Postman</p></figcaption></figure>

<figure><img src="/files/Ea1WcpYUC191OTUVau6i" alt=""><figcaption><p>HTTP Request 1</p></figcaption></figure>

<figure><img src="/files/JaQISF3ULaj05T9IZDgk" alt=""><figcaption><p>HTTP Request 2</p></figcaption></figure>


---

# Agent Instructions
This documentation is published with GitBook. GitBook is the documentation platform designed so that both humans and AI agents can read, navigate, and reason over technical content effectively. Learn more at gitbook.com.

## Querying This Documentation
If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on the current page URL with the `ask` query parameter:

```
GET https://docs.gpmautomate.com/http/http-request.md?ask=<question>
```

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
