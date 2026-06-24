> For the complete documentation index, see [llms.txt](https://docs.gpmautomate.com/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://docs.gpmautomate.com/keyboard/key-press.md).

# Key press

**Type:** Có 3 kiểu key press đó là:

1. *Single key:* Nhấn 1 phím trên bàn phím.
2. *Combo key:* Nhấn tổ hợp phím.

Danh sách các phím có thể sử dụng khi dùng **Single key** hoặc **Combo key**: \
Alt ArrowDown ArrowLeft ArrowRight ArrowUp Backspace Cancel Clear Command Control Decimal Delete Divide Down End Enter Equal Escape F1 F2 F3 F4 F5 F6 F7 F8 F9 F10 F11 F12 Help Home Insert Left LeftAlt LeftControl LeftShift Meta Multiply Null NumberPad0 NumberPad1 NumberPad2 NumberPad3 NumberPad4 NumberPad5 NumberPad6 NumberPad7 NumberPad8 NumberPad9 PageDown PageUp Pause Return Right Semicolon Separator Shift Space Subtract Tab Up ZenkakuHankaku\
\
3\. *Text:* Gõ đoạn text.

**KEY:** Nhập Nội dung cần gõ vào đây. Nếu dùng Single key hoặc Combo key thì điền danh sách phím vào.

VD: Để gõ tổ hợp phím Ctrl A, bạn viết như sau: **Control+A** (viết liền và dùng dấu + để nối các phím).

**Delay each character:** Thời gian delay giữa khi gõ các ký tự.

<mark style="color:red;">Nếu bạn muốn thời gian delay là 0s thì mục này điền 0,0.</mark>

<mark style="color:red;">Nếu bạn muốn dán luôn nội dung mà không gõ từng ký tự thì mục này điền -1.</mark>

<mark style="color:red;">Nếu nội dung text có sử dụng emoji (biểu tượng cảm xúc), thì mục này điền -1.</mark>

**Xpath:** điền xpath của khung nhập liệu mà bạn muốn điền nội dung vào đó. Nếu dùng Single key hay Combo key thì có thể **bỏ trống**.&#x20;


---

# Agent Instructions
This documentation is published with GitBook. GitBook is the documentation platform designed so that both humans and AI agents can read, navigate, and reason over technical content effectively. Learn more at gitbook.com.

## Querying This Documentation
If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on the current page URL with the `ask` query parameter:

```
GET https://docs.gpmautomate.com/keyboard/key-press.md?ask=<question>
```

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
