# `.flow` command cheat sheet

Tài liệu ngắn: giải thích input của từng command + ví dụ command thực tế mẫu.
Tất cả call đều dùng `name(arg1, arg2)`.

CLI có `Create flow script` để tạo file mới trong `./scripts/` và mở Ink editor có autocomplete. Gõ prefix như `http` để thấy `httpRequest` / `httpDownload`, dùng ↑/↓ chọn, Enter/Tab chèn snippet. Ví dụ: `nav` -> `nav('')`, `delay` -> `delay(,)`, `httpRequest` -> `httpRequest('','','','',rDelay())`.

## 1) Script block

### `inputs { ... }`
Khai báo input cho UI/CLI.

## 2) String / quote nhanh

- String dùng `"..."` hoặc `'...'`.
- String là raw: backslash giữ nguyên, không decode JSON escape.
- Comma trong quoted string không tách arg: `log("a,b")`.
- Quote giống delimiter dùng doubled quote: `log("He said ""hi""")`, `log('it''s ok')`.
- Windows path viết thẳng: `"C:\Temp\note.txt"`.

## 3) Command dùng mọi block

### `log`
- Input: 1+ text part.
- Mẫu: `log("Start job")`
- Mẫu: `log("a,b")`

### `sleep`
- Input: 1 số ms.
- Mẫu: `sleep(1000)`

### `delay`
- Input: 1 số ms, hoặc 2 số ms để random trong khoảng.
- Mẫu: `delay(1000)`
- Mẫu: `delay(1000, 3000)`
- Autocomplete snippet: `delay(,)`

### `httpRequest`
- Input: `url`, `method`, `headersJSON`, `body...`
- `headersJSON` và body là text raw, không cần escape quote JSON.
- Autocomplete snippet: `httpRequest('','','','',rDelay())`.
- Mẫu:
  ```flow
  httpRequest("https://api.example.com/user", POST, {})
  ```
- Mẫu:
  ```flow
  httpRequest("https://api.example.com/login", POST, {
    "content-type": "application/json"
  }, {
    "user": "demo",
    "message": "hello, world"
  })
  ```

### `readJson(...)`
- Input: `jsonText`, `dot.path`
- Mẫu:
  ```flow
  readJson({
    "code": 200,
    "message": "ok"
  }, code)
  ```

### `fileReadAllText`
- Input: `filePath`
- Mẫu:
  ```flow
  str = fileReadAllText(filePath)
  ```
- Mẫu:
  ```flow
  str = fileReadAllText("C:\Temp\note.txt")
  ```

### `httpDownload`
- Input: `url`, `savePath`
- Mẫu:
  ```flow
  httpDownload("https://example.com/file.zip", "C:\Temp\file.zip")
  ```

### `fileWriteAllText`
- Input: `filePath`, `text...`
- Mẫu:
  ```flow
  fileWriteAllText("C:\Temp\note.txt", "hello world")
  ```

### `writeExcel`
- Input: `filePath`, `columnName`, `rowIndex`, `text...`
- Mẫu:
  ```flow
  writeExcel("C:\Temp\data.xlsx", A, 2, "done")
  ```

### `readExcel`
- Input: `filePath`, `columnName`, `rowIndex`
- Mẫu:
  ```flow
  readExcel("C:\Temp\data.xlsx", A, 2)
  ```

### `fileExist(...)`
- Input: `path`
- Mẫu:
  ```flow
  fileExist("C:\Temp\a.txt")
  ```

### `folderExist(...)`
- Input: `path`
- Mẫu:
  ```flow
  folderExist("C:\Temp")
  ```

### `splitText(...)`
- Input: `text`, `delimiter`
- Mẫu: `splitText("a,b,c", ",")`

### `contains(...)`
- Input: `str1`, `str2`
- `contains("ABCD", "A")` → `true`
- `contains("ABCD", "E")` → `false`
- `contains("", str2)` → check `str2` rỗng hay không

### `randomNum(...)`
- Input: `min`, `max`
- Mẫu: `randomNum(1, 10)`

### `2FA(...)`
- Input: `secretKey`
- Trả về: TOTP token string từ https://2fa.live
- Mẫu: `code = 2FA(YAFBRQVDXAOODIOBTGURV43MJKCXLZCI)`
- Dùng được trong cả `before()`, `running()`, `after()`

## 4) Command chỉ dùng `running()`

### `nav` / `goto` / `navUrl`
- Input: `url`
- Mẫu: `nav("https://example.com")`
- Mẫu: `goto("https://example.com")`
- Mẫu: `navUrl("https://example.com")`
- Autocomplete snippet: `nav('')`

### `newTab`
- Input: optional `url`
- Mẫu: `newTab()`
- Mẫu: `newTab("https://example.com/docs")`

### `closeTab`
- Input: none
- Mẫu: `closeTab()`

### `activeTab`
- Input: `indexOrContextId`
- Mẫu: `activeTab(0)`
- Mẫu: `activeTab("context-id")`

### `backNav`
- Input: optional `timeoutMs`
- Mẫu: `backNav()`
- Mẫu: `backNav(5000)`

### `reloadNav`
- Input: none
- Mẫu: `reloadNav()`

### `getUrl`
- Input: none
- Mẫu: `getUrl()`

### `waitUrlChange`
- Input: `oldUrl`, optional `timeoutMs`
- Mẫu: `waitUrlChange("https://example.com")`
- Mẫu: `waitUrlChange("https://example.com", 10000)`

### `waitLoad`
- Input: optional `settleMs`
- Mẫu: `waitLoad()`
- Mẫu: `waitLoad(3000)`

### `waitElement` / `waitXPath`
- Input: `xpath`, optional `timeoutMs`
- Mẫu: `waitElement("//input[@name='q']")`
- Mẫu: `waitXPath("//button[contains(., 'Search')]", 10000)`

### `click`
- Input: `xpath`
- Mẫu: `click("//button[contains(., 'Submit')]")`

### `type` / `typeText`
- Input: `xpath`, `text...`
- Mẫu: `type("//input[@name='q']", "donut browser")`
- Mẫu: `typeText("//input[@name='q']", "donut browser")`

### `pasteText`
- Input: `xpath`, `text...`
- Mẫu: `pasteText("//textarea[@name='msg']", "hello world")`

### `getElementText`
- Input: `xpath`
- Mẫu: `getElementText("//h1")`

### `getElementAttribute`
- Input: `xpath`, `attributeName`
- Mẫu: `getElementAttribute("//a", href)`

### `countElement`
- Input: `xpath`
- Mẫu: `countElement("//li")`

### `moveMouse`
- Input: `xpath`
- Mẫu: `moveMouse("//button[contains(., 'Save')]")`

### `scroll`
- Input: `amount`
- Mẫu: `scroll(600)`

### `js` / `executeJs`
- Input: `script`
- Mẫu: `js("document.title")`
- Mẫu: `executeJs("location.href")`

### `fileUpload`
- Input: `filePath`, `xpath`
- Mẫu:
  ```flow
  fileUpload("C:\Temp\upload.png", "//input[@type='file']")
  ```

### `info`
- Input: none
- Mẫu: `info()`

## 5) Command chỉ dùng trong expression / control flow

### `set` / assignment
- Input: `name = value`
- Runtime hiểu cả `set name = value` và `name = value`.
- Number: `number = 33`
- String: `str = "sample"`
- Gán từ biến khác: `a = b`
- Không dùng `${b}` ở vế phải assignment; `${...}` chỉ dùng trong command arg string như `log("a=${a}")`.
- Mẫu: `set n = 1`
- Mẫu: `title = "hello"`

### `if / else if / else`
- Input: condition expression
- Mẫu: `if hasElement("//h1")`
- Mẫu: `else if n > 3`

### `while`
- Input: condition expression
- Mẫu: `while n < 3`

### `for`
- Input: `init; condition; update`
- Mẫu: `for i = 0; i < 3; i = i + 1`

### `nextLoop`
- Input: none
- Mẫu: `nextLoop`

### `exitLoop`
- Input: none
- Mẫu: `exitLoop`

### `hasElement(...)` / `existsXPath(...)`
- Input: `xpath`
- Mẫu: `hasElement("//h1")`
- Mẫu: `existsXPath("//button")`

## 6) Input dùng trong command

Chèn biến bằng `${name}`.

Mẫu command:
- `nav("${url}")`
- `log("keyword=${keyword}")`
- `type("//input[@name='q']", "${keyword}")`

## 7) Comment

- Comment: `#` hoặc `//` ngoài string.
- `#` hoặc `//` trong quoted string là text thường.

## 8) Legacy flat script

Script cũ không có block vẫn chạy, nhưng syntax chuẩn mới là `name(...)`.

## 9) Gợi ý nhanh

- `before()` : `log`, `sleep`, `httpRequest`, `fileWriteAllText`, `writeExcel`
- `running()` : `nav`, `click`, `typeText`, `waitLoad`, `info`
- `after()` : `log`, `sleep`, `httpRequest`, `fileWriteAllText`, `writeExcel`
- Parser cũng nhận `before run profile`, `run profile`, `after kill profile`, nhưng short form là chuẩn.
