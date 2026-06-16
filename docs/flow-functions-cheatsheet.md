# `.flow` command cheat sheet

Tài liệu ngắn: giải thích input của từng command + ví dụ command thực tế mẫu.
Tất cả call đều dùng `name(arg1, arg2)`.

## 1) Script block

### `inputs { ... }`
Khai báo input cho UI/CLI.

## 2) Command dùng mọi block

### `log`
- Input: 1+ text part.
- Mẫu: `log("Start job")`

### `sleep`
- Input: 1 số ms.
- Mẫu: `sleep(1000)`

### `delay`
- Input: 1 số ms, hoặc 2 số ms để random trong khoảng.
- Mẫu: `delay(1000)`
- Mẫu: `delay(1000, 3000)`

### `httpRequest`
- Input: `url`, `method`, `headersJSON`, `body...`
- `headersJSON` là text thô, không cần escape ký tự đặc biệt trong source `.flow`.
- Mẫu: `httpRequest("https://api.example.com/user", POST, {})`
- Mẫu: `httpRequest("https://api.example.com/login", POST, {"content-type":"application/json"}, {"user":"demo"})`
- Parser giữ text raw; hệ thống escape khi cần serialize vào JS / runtime.

### `fileReadAllText`
- Input: `filePath`
- Mẫu: `str = fileReadAllText(filePath)`
- Mẫu: `str = fileReadAllText("C:\\Temp\\note.txt")`

### `httpDownload`
- Input: `url`, `savePath`
- Mẫu: `httpDownload("https://example.com/file.zip", "C:\\Temp\\file.zip")`

### `fileWriteAllText`
- Input: `filePath`, `text...`
- Mẫu: `fileWriteAllText("C:\\Temp\\note.txt", "hello world")`

### `writeExcel`
- Input: `filePath`, `columnName`, `rowIndex`, `text...`
- Mẫu: `writeExcel("C:\\Temp\\data.xlsx", A, 2, "done")`

### `readExcel`
- Input: `filePath`, `columnName`, `rowIndex`
- Mẫu: `readExcel("C:\\Temp\\data.xlsx", A, 2)`

### `splitText(...)`
- Input: `text`, `delimiter`
- Mẫu: `splitText("a,b,c", ",")`

### `readJson(...)`
- Input: `jsonText`, `dot.path`
- Mẫu: `readJson("{\"code\":200}", "code")`

### `randomNum(...)`
- Input: `min`, `max`
- Mẫu: `randomNum(1, 10)`

### `fileExist(...)`
- Input: `path`
- Mẫu: `fileExist("C:\\Temp\\a.txt")`

### `folderExist(...)`
- Input: `path`
- Mẫu: `folderExist("C:\\Temp")`

## 3) Command chỉ dùng `running`

### `nav` / `goto` / `navUrl`
- Input: `url`
- Mẫu: `nav("https://example.com")`
- Mẫu: `goto("https://example.com")`
- Mẫu: `navUrl("https://example.com")`

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
- Mẫu: `fileUpload("C:\\Temp\\upload.png", "//input[@type='file']")`

### `info`
- Input: none
- Mẫu: `info()`

## 4) Command chỉ dùng trong expression / control flow

### `set`
- Input: `name = value`
- Mẫu: `set n = 1`
- Mẫu: `set title = "hello"`

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

## 5) Input dùng trong command

Chèn biến bằng `${name}`.

Mẫu command:
- `nav("${url}")`
- `log("keyword=${keyword}")`
- `type("//input[@name='q']", "${keyword}")`

## 6) Comment / quote

- Comment: `#` hoặc `//`
- String có space: dùng `"..."` hoặc `'...'`

## 7) Legacy flat script

Script cũ không có block vẫn chạy, nhưng syntax chuẩn mới là `name(...)`.

## 8) Gợi ý nhanh

- `before()` : `log`, `sleep`, `httpRequest`, `fileWriteAllText`, `writeExcel`
- `running()` : `nav`, `click`, `typeText`, `waitLoad`, `info`
- `after()` : `log`, `sleep`, `httpRequest`, `fileWriteAllText`, `writeExcel`
