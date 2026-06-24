> For the complete documentation index, see [llms.txt](https://docs.gpmautomate.com/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://docs.gpmautomate.com/no-code-automation/text-and-number/read-json.md).

# Read json

Ví dụ: Bạn có 1 HTTP Request như sau:

<mark style="color:green;">`GET`</mark>`https://tools.dongvanfb.net/api/get_code?mail=tommiel@hotmail.com&pass=bV1emc&type_get=imap`

<figure><img src="/files/8gWBiGUhZsD1zIVF8dXO" alt=""><figcaption><p>HTTP Request</p></figcaption></figure>

<figure><img src="/files/WrQG41fvjdsBanmqpjX3" alt=""><figcaption><p>HTTP Request</p></figcaption></figure>

Kết quả trả về là 1 JSON như sau:

{% tabs %}
{% tab title="Response" %}

```json
{
  "user": {
    "email": "tommiel@hotmail.com",
    "password": "bV1emc"
  },
  "status": true,
  "code": "37589",
  "timestamp": {
    "date": "15/04/2022",
    "time": "22:43"
  }
}
```

{% endtab %}
{% endtabs %}

Để lấy giá trị `code ("37589")` bạn viết như sau:

<figure><img src="/files/RdxtgdUjnqCUMhNo9p6I" alt=""><figcaption><p>Read JSON</p></figcaption></figure>

Giá trị của  `code` sẽ được lưu vào biến `$ketQuaCode`.

Để lấy giá trị của các thuộc tính ở tầng thấp hơn, ví dụ `date ("15/04/2022")` nằm trong `timestamp`, bạn làm như sau:

<figure><img src="/files/R2TN4BPdS0kinWVGwqp4" alt=""><figcaption><p>Read JSON</p></figcaption></figure>

Giá trị của `date` sẽ được lưu vào biến `$ketQuaDate`.

Đối với các JSON có cả mảng dữ liệu, ví dụ như JSON `$resp` sau:

{% tabs %}
{% tab title="Response" %}

```json
{
  "success": true,
  "users": [
    {
      "email": "tommiel@hotmail.com",
      "password": "bV1emc",
      "status": true,
      "code": "37589",
      "timestamp": {
        "date": "15/04/2022",
        "time": "22:43"
      }
    },
    {
      "email": "minachan@gmail.com",
      "password": "ax1Ym",
      "status": true,
      "code": "18554",
      "timestamp": {
        "date": "05/09/2024",
        "time": "15:12"
      }
    }
  ]
}

```

{% endtab %}
{% endtabs %}

Để lấy giá trị `date` của user thứ 2, bạn viết như sau:

Ở đây `users.[1].timestamp.date`, thì `[1]` là index của mảng. Index này bắt đầu tính từ 0. Bạn cũng có thể nhúng giá trị index từ 1 biến khác vào, ví dụ `[$index]`.

<figure><img src="/files/3n0BkvB7ZrpnlcrxjsYA" alt=""><figcaption><p>Read JSON</p></figcaption></figure>

<figure><img src="/files/29IXE7ZDKVe2hVTt8iPr" alt=""><figcaption><p>Read JSON</p></figcaption></figure>


---

# Agent Instructions
This documentation is published with GitBook. GitBook is the documentation platform designed so that both humans and AI agents can read, navigate, and reason over technical content effectively. Learn more at gitbook.com.

## Querying This Documentation
If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on the current page URL with the `ask` query parameter:

```
GET https://docs.gpmautomate.com/no-code-automation/text-and-number/read-json.md?ask=<question>
```

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
