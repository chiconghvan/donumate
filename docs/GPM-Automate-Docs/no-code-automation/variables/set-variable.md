> For the complete documentation index, see [llms.txt](https://docs.gpmautomate.com/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://docs.gpmautomate.com/no-code-automation/variables/set-variable.md).

# Set variable

Để cho phép người dùng nhập giá trị biến từ UI, chọn mục Allow user input from the interface.

Có 4 kiểu Input như sau:

1. Text (để nhập 1 giá trị text)

<figure><img src="/files/CNWOuYXHdVtGKwujXLfw" alt=""><figcaption><p>Text</p></figcaption></figure>

<figure><img src="/files/bDJrK3BnHlOM8bPZlaRs" alt=""><figcaption><p>Text</p></figcaption></figure>

Ví dụ như ở hình trên, khi người dùng nhập nội dung `hello world` vào ô nhập liệu, giá trị của biến `$textContent` sẽ là `hello world` ($textContent=hello world).&#x20;

2. File (dùng để chọn file trong máy tính)

<figure><img src="/files/RAuPubngKhJ07nghWaro" alt=""><figcaption><p>File</p></figcaption></figure>

<figure><img src="/files/PDODPiM1vkdZblXxaVzx" alt=""><figcaption><p>File</p></figcaption></figure>

Ví dụ như ở hình trên, chọn vào dấu 3 chấm được khoanh đỏ, sau đó chọn file có tên `bruh.png`. Khi đó giá trị của biến `$filePath` sẽ là `D:\materials\bruh.png` ($filePath=D:\materials\bruh.png).  Sau đó có thể dùng biến này cho action File Upload chẳng hạn.

3. Checkbox

**Check Box** là thành phần giao diện cho phép người dùng bật/tắt một tùy chọn. Khi được tích chọn, giá trị trả về là **True**; khi bỏ chọn, giá trị là **False**.

**Đặc điểm:**

* Biểu thị lựa chọn nhị phân (có/không, bật/tắt, đồng ý/không đồng ý).

**Ví dụ sử dụng:**

* Đồng ý với điều khoản và điều kiện.
* Bật/tắt một tính năng (ví dụ: gửi email thông báo).

<figure><img src="/files/fbRBqZlAzCCEAvAOaEZT" alt=""><figcaption><p>Checkbox</p></figcaption></figure>

<figure><img src="/files/hu6gDclEy1QYJCaWryIf" alt=""><figcaption><p>Checkbox</p></figcaption></figure>

Ví dụ như ở hình trên, khi tích chọn vào mục `Chọn để đặt hàng / Check to place an order`, thì biến `$checkBox` sẽ nhận giá trị True ($checkBox=True), và ngược lại.

4. Combobox

**Combo Box** (tương tự như dropdown) là thành phần giao diện cho phép người dùng chọn **một giá trị duy nhất** từ danh sách có sẵn. Tính năng này giúp đơn giản hóa thao tác nhập liệu, tránh sai sót và giữ dữ liệu đồng nhất.

**Đặc điểm:**

* Hiển thị danh sách các lựa chọn có sẵn.
* Chỉ chọn được **một giá trị tại một thời điểm**.

**Ví dụ sử dụng:**

* Chọn quốc gia, ngành hàng hoặc loại sản phẩm.
* Chọn trạng thái (VD: Hoạt động / Ngưng hoạt động).

<figure><img src="/files/2TOeIPPduLmtbGNtpIex" alt=""><figcaption><p>Combo Box</p></figcaption></figure>

<figure><img src="/files/vPgxqEzhsHg09n5T8JA8" alt=""><figcaption><p>Combo Box</p></figcaption></figure>

Ví dụ như ở hình trên, khi người dùng chọn `United States`, thì biến `$country` trong Automate sẽ nhận giá trị là `United States` ($country=United State).


---

# Agent Instructions
This documentation is published with GitBook. GitBook is the documentation platform designed so that both humans and AI agents can read, navigate, and reason over technical content effectively. Learn more at gitbook.com.

## Querying This Documentation
If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on the current page URL with the `ask` query parameter:

```
GET https://docs.gpmautomate.com/no-code-automation/variables/set-variable.md?ask=<question>
```

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
