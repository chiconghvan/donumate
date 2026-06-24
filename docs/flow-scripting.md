# Flow scripting

Canonical `.flow` syntax and command/function reference. Command call style: `name(arg1, arg2)`.

`*.flow` dùng syntax call chuẩn: `name(arg1, arg2)`.

## Block syntax

- `inputs { ... }`
- `before() { ... }`
- `running() { ... }`
- `after() { ... }`
- Parser cũng nhận `before run profile`, `run profile`, `after kill profile`, nhưng short form là canonical.
- Legacy flat script không block vẫn chạy, toàn file xem như main block.

## Syntax

- Command / function call: `name(arg1, arg2)`.
- Tất cả args đi trong ngoặc đơn.
- Command names theo camelCase: `nav`, `waitLoad`, `fileUpload`, `httpRequest`, `readExcel`, ...
- String dùng `"..."` hoặc `'...'`.
- String là raw: backslash giữ nguyên, không decode JSON escape. `\n` là 2 ký tự `\` và `n`.
- Comma trong quoted string không tách arg.
- Muốn viết quote giống delimiter trong string: dùng doubled quote.
  - `"He said ""hi"""` -> `He said "hi"`
  - `'it''s ok'` -> `it's ok`
- Windows path viết thẳng: `"C:\Temp\note.txt"`.
- `rDelay`, `rDelay()`, `rDelay(min,max)` đặt cuối bất kỳ command line nào để delay sau command execute.

## Create flow script editor

Run `pnpm start`, choose `Create flow script`, enter a script name, then edit the new `.flow` file in the Ink editor. File saves under `./scripts/<name>.flow`.

Editor keys:

- Type command prefix to show autocomplete. Example: `http` shows `httpRequest` and `httpDownload`.
- `↑` / `↓` selects autocomplete item.
- `Enter` / `Tab` inserts selected snippet when dropdown is open.
- `Ctrl+Space` forces suggestions.
- `Ctrl+S` validates script syntax and saves.
- `Esc` closes autocomplete first, then cancels editor.

## Check script

Run static checker before runtime:

```bash
pnpm start check --script scripts/example.flow
```

Checker reports line-based errors for:

- syntax
- unknown command/function
- wrong arg count
- undefined variable
- loop/workflow misuse
- page-only command/function in wrong block

Checker uses same runtime DSL spec as executor. If runtime command/function metadata changes, update shared runtime spec and executor together.

Snippet examples:

```flow
nav('', rDelay())
delay(, rDelay())
httpRequest('','','','', rDelay())
```

Text inputs use quotes (`''`). Number/boolean slots stay empty/unquoted so you can type raw values.

## Raw string ví dụ

```flow
log("a,b")
log("C:\Temp\note.txt")
log("He said ""hi""")
log('it''s ok')
```

JSON object/body có thể viết raw, không cần escape quote JSON:

```flow
httpRequest("https://httpbin.org/post", POST, {
  "content-type": "application/json"
}, {
  "ok": true,
  "message": "hello, world"
})

readJson({
  "code": 200,
  "message": "ok"
}, code)
```

## Ví dụ

```flow
inputs {
  url: input = "https://example.com"
  xpath: text = "//button"
  windowWidth: number = 1280
  windowHeight: number = 720
}

before() {
  log("Before run")
}

running() {
  nav("${url}", rDelay())
  waitLoad()
  click("${xpath}")
  fileUpload("E:\Temp\upload.png", "//input[@type='file']", rDelay())
  httpRequest("https://httpbin.org/post", POST, {"content-type":"application/json"}, {"ok":true}, rDelay())
}

after() {
  log("Done")
}
```

## Gán biến

Flow hỗ trợ 2 dạng assignment:

```flow
set name = value
name = value
```

Ví dụ number:

```flow
number = 33
log("number=${number}")
```

Ví dụ string:

```flow
str = "sample"
log("str=${str}")
```

Gán từ biến khác dùng tên biến trực tiếp, không dùng `${...}` ở vế phải:

```flow
b = "hello"
a = b
log("a=${a}")
```

`${...}` chỉ dùng để interpolate value bên trong command arg string:

```flow
log("a=${a}")
```

Gán kết quả function:

```flow
parts = splitText("a,b,c", ",")
first = parts[0]
log("first=${first}")
```

Gán input vào biến:

```flow
inputs {
  keyword: input = "donut"
}

running() {
  q = keyword
  log("q=${q}")
}
```

## Command examples

### Navigation

```flow
nav("https://example.com")
goto("https://example.com")
navUrl("https://example.com")
waitLoad()
waitUrlChange("https://example.com", 10000)
```

### Element

```flow
waitElement("//button", 10000)
click("//button[contains(., 'Submit')]")
typeText("//input[@name='email']", "user@example.com")
pasteText("//textarea[@name='message']", "Hello 👋🌍")
getElementText("//h1")
getElementAttribute("//a", "href")
countElement("//button")
```

### Mouse / JS / file

```flow
moveMouse("//button")
scroll(600)
js("document.title")
executeJs("document.body.innerText")
fileUpload("E:\Code\donumate\docs\upload.png", "//input[@type='file']")
fileWriteAllText("./out.txt", "hello")
```

### HTTP / data

```flow
httpRequest("https://httpbin.org/post", POST, {"content-type":"application/json"}, {"ok":true,"message":"hello, world"})
httpDownload("https://example.com/image.png", "./downloads/image.png")
readJson({
  "code": 200
}, code)
readExcel("C:\Temp\data.xlsx", A, 2)
writeExcel("C:\Temp\data.xlsx", A, 2, "value")
contains("ABCD", "A")
contains("", keyword)
code = 2FA(YAFBRQVDXAOODIOBTGURV43MJKCXLZCI)
```

### Excel profile mapping

Khi tick `mapProfileName` trong Script Settings, `inputExcelFile` tự động map row theo profile name ở cột A.

Excel format:

| A | B | C | D |
|---|---|---|---|
| profile_1 | user1@gmail.com | pass123 | https://example.com |
| profile_2 | user2@gmail.com | pass456 | https://test.com |

Sử dụng column letter trong ngoặc:

```flow
running() {
  set username = ${inputExcelFile[B]}
  set password = ${inputExcelFile[C]}
  set url = ${inputExcelFile[D]}

  log("User: ${username}")
  log("Pass: ${password}")
}
```

Hoặc function syntax:

```flow
running() {
  set username = inputExcelFile("B")
  set password = inputExcelFile("C")
}
```

Rule:
- Cột A chứa profile name, phải trùng khớp với tên profile đang chạy.
- `inputExcelFile[A]` đọc giá trị ở cột A (tức profile name).
- `inputExcelFile[B]` đọc giá trị ở cột B, cùng row.
- Hỗ trợ column letter: `A`-`Z`, `AA`, `AB`, ...
- Nếu profile name không tìm thấy ở cột A → lỗi và dừng script.
- `mapProfileName` là Script Setting, mặc định `false`.

### String check

- `contains(str1, str2)` trả `true` nếu `str1` chứa `str2`.
- `contains("", str2)` dùng để check `str2` có rỗng không.

```flow
if contains(title, "Donut") {
  log("match")
}

if contains("", keyword) {
  log("keyword empty")
}
```

## Notes

- `before()` / `after()` không có page/browser.
- `running()` mới dùng command browser.
- `windowWidth` / `windowHeight` trong `inputs {}` là Scripts Setting, runtime sẽ resize window ngay sau khi connect BiDi, trước bước chạy script.
- Alias cũ kiểu `type` vẫn chạy, nhưng tên chuẩn là camelCase.
- Tất cả command/function call đều phải dùng ngoặc đơn.
- Parser vẫn nhận long-form block alias, nhưng short form là chuẩn.
- Legacy flat script không có block vẫn chạy, nhưng syntax chuẩn mới là block + call.
