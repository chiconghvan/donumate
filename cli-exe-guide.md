# Donumate CLI EXE - Hướng dẫn sử dụng

Bản EXE standalone (`donumate-win-x64.exe`) chạy trực tiếp trên Windows x64, không cần Node.js hay pnpm. Sử dụng readline thay cho ink TUI — tất cả input phải truyền qua CLI flags hoặc dùng readline prompt cơ bản (nhập số).

## Yêu cầu hệ thống

- Windows x64
- Donut Browser đang chạy với REST API enabled tại `http://127.0.0.1:10108`
- Ít nhất một Camoufox profile

## Cấu trúc thư mục

```
donumate/
  donumate-win-x64.exe
  .env                          # tùy chọn
  scripts/
    my-task.flow
    example.flow
```

> **Lưu ý:** Bản EXE chỉ chạy được `.flow` scripts. File `.ts` không được hỗ trợ.

---

## Cú pháp tổng quát

```bash
donumate-win-x64.exe [command] [options]
```

---

## Commands

### Root (không có sub-command)

```bash
donumate-win-x64.exe [options]
```

Nếu không truyền `--script`, hiện readline list picker (nhập số) để chọn script từ thư mục `scripts/`. Sau đó hiện prompt chọn profile (nhập số).

### `run`

```bash
donumate-win-x64.exe run [options]
```

Command tương đương root, nhưng rõ ràng hơn.

### `threads`

**Không khả dụng trên bản EXE.** Built-in scripts chỉ có trên bản dev (`pnpm start`).

---

## Options

| Flag | Giá trị | Mặc định | Mô tả |
|------|---------|----------|-------|
| `--script <path>` | string | *(readline picker)* | Đường dẫn file `.flow` |
| `--profile <id>` | string | *(readline picker)* | ID Camoufox profile, bỏ qua selector |
| `--api <url>` | URL | `http://127.0.0.1:10108` | Donut API base URL |
| `--headless` | flag | `false` | Chạy profile headless |
| `--connect-timeout <ms>` | number | `30000` | Timeout kết nối BiDi (ms) |
| `--command-timeout <ms>` | number | `15000` | Timeout lệnh BiDi (ms) |
| `--input <key=value>` | string | *(none)* | Ghi đè `.flow` input. Nhắc lại nhiều lần |
| `--no-update-check` | flag | *(kiểm tra)* | Bỏ qua check update GitHub |
| `-V, --version` | flag | | Phiên bản |

> **Ưu tiên:** CLI flags > `.env` > giá trị mặc định.

---

## Ví dụ

```bash
# Chạy script với profile cụ thể (full non-interactive)
donumate-win-x64.exe run --script ./scripts/my-task.flow --profile abc123

# Headless + ghi đè inputs
donumate-win-x64.exe --script ./scripts/scrape.flow --profile abc123 --headless --input keyword=donut --input maxPages=10

# Custom API endpoint
donumate-win-x64.exe run --api http://192.168.1.100:10108 --script ./scripts/task.flow --profile abc123

# Bỏ qua update check
donumate-win-x64.exe --no-update-check --script ./scripts/task.flow --profile abc123
```

### Khi chạy interactive (không có `--script`)

```
Run Scripts (2 found)

> scripts/scrape.flow *
  scripts/login.flow

Choose number (0-1):
```

Nhập số → chọn script → tiếp tục chọn profile bằng số → chạy.

---

## File `.flow`

### Cấu trúc

```flow
inputs {
  startUrl: input = "https://example.com"
  mode: comboBox ["fast", "safe"] = "safe"
  dryRun: checkbox = false
}

before() {
  log("Before launch: ${mode}")
}

running() {
  nav("${startUrl}")
  waitLoad()
  info()
}

after() {
  log("Browser killed")
}
```

### Lifecycle blocks

| Block | Chạy khi | Có page/browser? | HTTP/file commands? |
|-------|----------|-------------------|---------------------|
| `inputs { }` | Định nghĩa input | Không | Không |
| `before() { }` | Trước launch profile | Không | Có |
| `running() { }` | Browser sẵn sàng | Có | Có |
| `after() { }` | Sau kill profile | Không | Có |

Legacy flat `.flow` (không block header) chạy toàn bộ như main block.

---

## Input types trong `inputs {}`

| Type | Mô tả | Ví dụ |
|------|-------|-------|
| `input` | Text/number tự detect | `url: input = "https://example.com"` |
| `text` | Luôn string | `xpath: text = "//button"` |
| `number` | Số nguyên | `count: number = 3` |
| `file` | Chọn file | `upload: file` |
| `folder` | Chọn thư mục | `outputDir: folder` |
| `checkbox` | Boolean | `dryRun: checkbox = false` |
| `comboBox` | Dropdown | `mode: comboBox ["fast", "safe"] = "safe"` |
| `inputExcelFile` | File Excel | `data: inputExcelFile` |

> **Trên bản EXE:** `file`, `folder`, `comboBox` hiển thị prompt readline thay vì TUI ink. Ghi đè bằng `--input key=value` qua CLI.

### Script Settings (hidden, tự inject)

| Name | Type | Mặc định | Mô tả |
|------|------|----------|-------|
| `hardless` | checkbox | `false` | Headless (ghi đè `--headless`) |
| `threads` | number | `1` | Số luồng song song |
| `inputExcelFile` | inputExcelFile | `""` | File Excel mapping |
| `mapProfileName` | checkbox | `false` | Map row theo profile name |

---

## Các lệnh `.flow`

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
pasteText("//textarea[@name='msg']", "Hello")
getElementText("//h1")
getElementAttribute("//a", "href")
countElement("//button")
```

### Mouse / JS

```flow
moveMouse("//button")
scroll(600)
js("document.title")
executeJs("document.body.innerText")
```

### File

```flow
fileUpload("E:\Temp\upload.png", "//input[@type='file']")
fileWriteAllText("./out.txt", "content")
fileReadAllText("C:\Temp\note.txt")
```

### HTTP

```flow
httpRequest("https://httpbin.org/post", POST, {"content-type":"application/json"}, {"ok":true})
httpDownload("https://example.com/image.png", "./downloads/image.png")
```

### Data / Excel

```flow
readJson({"code": 200}, code)
readExcel("C:\Temp\data.xlsx", A, 2)
writeExcel("C:\Temp\data.xlsx", A, 2, "value")
contains("ABCD", "A")
code = 2FA(YAFBRQVDXAOODIOBTGURV43MJKCXLZCI)
```

### Biến

```flow
set name = "hello"
count = 33
a = b
log("a=${a}")
parts = splitText("a,b,c", ",")
first = parts[0]
```

### Random delay

```flow
nav("https://example.com") rDelay
click("//button") rDelay(3000, 4000)
```

### Control flow

```flow
for i = 0; i < 10; i = i + 1
  if i == 2
    nextLoop
  if i == 5
    exitLoop
  log("i=${i}")
```

---

## Excel Profile Mapping

Khi `mapProfileName = true`, `inputExcelFile` tự map row theo profile name ở cột A.

### Định dạng

| A | B | C | D |
|---|---|---|---|
| profile_1 | user1@gmail.com | pass123 | https://example.com |
| profile_2 | user2@gmail.com | pass456 | https://test.com |

### Sử dụng

```flow
inputs {
  inputExcelFile: inputExcelFile
  mapProfileName: checkbox = true
}

running() {
  set username = ${inputExcelFile[B]}
  set password = ${inputExcelFile[C]}
  log("User: ${username}")
}
```

Rules:
- Cột A = profile name, phải trùng tên profile đang chạy
- Column letter: `A`-`Z`, `AA`, `AB`, ...
- Profile name không tìm thấy → lỗi, dừng script

---

## Cấu hình `.env`

Tạo file `.env` cùng cấp với exe:

```env
DONUT_API_BASE_URL=http://127.0.0.1:10108
DONUT_API_TOKEN=
DONUT_PROFILE_ID=
CAMOUFOX_HEADLESS=false
BIDI_CONNECT_TIMEOUT_MS=30000
BIDI_COMMAND_TIMEOUT_MS=15000
```

CLI flags luôn ưu tiên hơn `.env`.

---

## Quy tắc string trong `.flow`

- Dùng `"..."` hoặc `'...'`
- Backslash giữ nguyên: `"C:\Temp\note.txt"`
- Comma trong quotes không tách arg: `"hello, world"`
- Escape quote trùng delimiter: `"He said ""hi"""` → `He said "hi"`
- JSON body viết raw: `httpRequest(..., {"key": "value, with comma"})`
