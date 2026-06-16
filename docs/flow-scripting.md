# Hướng dẫn xây dựng script `.flow`

`.flow` là format script đơn giản để chạy automation với Donut Camoufox qua CLI. Người dùng không cần viết TypeScript. Script được chia theo vòng đời profile/browser và có thể khai báo input ngay trong file.

## 1. Cấu trúc tổng quát

Một script `.flow` dạng mới gồm tối đa 4 phần:

```flow
inputs {
  # Khai báo biến người dùng nhập trong CLI UI
}

before run profile {
  # Chạy sau khi chọn profile, trước khi mở browser
}

run profile {
  # Chạy sau khi browser mở, BiDi đã kết nối, page sẵn sàng
}

after kill profile {
  # Chạy sau khi browser/profile bị kill
}
```

Trong đó:

- `inputs { ... }` không bắt buộc.
- `before run profile { ... }` không bắt buộc.
- `run profile { ... }` bắt buộc với script dạng block.
- `after kill profile { ... }` không bắt buộc.

Ví dụ tối thiểu:

```flow
run profile {
  nav "https://example.com"
  waitLoad
  info
}
```

## 2. Script caching

Trước khi chạy, script được cache vào thư mục tạm OS (`tmpdir()/donumate/script-cache/`):

- **`.flow`**: đọc file gốc một lần, ghi vào cache, parse từ bản cache. Sau khi cache xong, file gốc có thể bị ghi đè/xóa mà không ảnh hưởng lần chạy hiện tại.
- **`.ts`**: bundle bằng esbuild vào file ESM trong cache (bao gồm tất cả relative imports), rồi import từ bản cache. File gốc có thể bị thay đổi sau bundle mà không ảnh hưởng run.

Cache sẽ được dọn dẹp tự động sau khi script chạy xong. Cache cũ hơn 24h cũng được prune best-effort khi load script mới.

> **Lưu ý cho OTA**: Tính năng OTA update script chưa được implement. Hiện tại, script luôn được load từ file gốc và cache lại trước khi chạy. Khi OTA được thêm, nó sẽ ghi đè file gốc — lần chạy tiếp theo sẽ dùng nội dung mới từ file gốc đã được cache lại.

## 3. Vòng đời chạy script

Khi chạy:

Khi chạy:

```bash
pnpm dev run --profile <profile-id> --script ./scripts/my.flow
```

Runner thực hiện theo thứ tự:

1. Load file `.flow`.
2. Đọc `inputs` và mở input UI nếu có input.
3. Load/chọn Camoufox profile.
4. Chạy `before run profile`.
5. Gọi Donut API để mở browser profile.
6. Chờ profile sẵn sàng.
7. Kết nối WebDriver BiDi.
8. Khởi tạo `PageAutomation`.
9. Chạy `run profile`.
10. Đóng BiDi.
11. Kill profile.
12. Chạy `after kill profile`.

## 4. Khi nào dùng từng block

### `before run profile`

Dùng để log, chuẩn bị dữ liệu, xác nhận input trước khi browser mở.

Có thể dùng:

```flow
before run profile {
  log "Start job with endpoint=${endpoint}"
  sleep 1000
}
```

Lưu ý: `log` dùng được ở cả `before run profile`, `run profile`, và `after kill profile`.

```flow
before run profile {
  nav "https://example.com" # Sai: browser chưa mở
}
```

### `run profile`

Đây là main logic. Browser đã mở, page đã sẵn sàng. Dùng để mở URL, click, nhập text, đọc info.

```flow
run profile {
  nav "https://example.com"
  waitLoad
  info
}
```

### `after kill profile`

Dùng để log kết quả cuối, cleanup logic không cần browser.

```flow
after kill profile {
  log "Browser killed. Job done."
}
```

Không được dùng lệnh page/browser ở block này vì browser đã tắt.

```flow
before run profile {
  log "Start job with endpoint=${endpoint}"
  sleep 1000
}
```

Không được dùng lệnh page/browser ở block này:

```flow
before run profile {
  nav "https://example.com" # Sai: browser chưa mở
}
```

### `run profile`

Đây là main logic. Browser đã mở, page đã sẵn sàng. Dùng để mở URL, click, nhập text, đọc info.

```flow
run profile {
  nav "https://example.com"
  waitLoad
  info
}
```

### `after kill profile`

Dùng để log kết quả cuối, cleanup logic không cần browser.

```flow
after kill profile {
  log "Browser killed. Job done."
}
```

Không được dùng lệnh page/browser ở block này vì browser đã tắt.

## 5. Khai báo input

Input khai báo trong block `inputs { ... }`.

Cú pháp:

```flow
inputs {
  tenBien: loaiInput = giaTriMacDinh
}
```

Ví dụ:

```flow
inputs {
  keyword: text = "donut"
  count: number = 10
  dryRun: checkbox = false
  mode: comboBox ["fast", "safe", "debug"] = "safe"
}
```

Tên biến:

- Bắt đầu bằng chữ hoặc `_`.
- Có thể chứa chữ, số, `_`.
- Ví dụ hợp lệ: `keyword`, `apiPort`, `_token`, `file1`.

## 6. Các loại input

### `input` — tự detect text/number

`input` tự chuyển thành number nếu giá trị nhập là số hợp lệ, ngược lại là string.

```flow
inputs {
  value: input = "123"
}
```

Nếu người dùng nhập:

- `123` → number `123`
- `12.5` → number `12.5`
- `hello` → text `"hello"`

Dùng khi bạn muốn field linh hoạt.

### `text`

Luôn là chuỗi text.

```flow
inputs {
  message: text = "hello world"
}
```

Dù nhập `123`, giá trị vẫn là text `"123"`.

### `number`

Bắt buộc là số hữu hạn.

```flow
inputs {
  delayMs: number = 2000
}
```

Nếu nhập `abc`, UI báo lỗi và không cho submit.

### `file`

Đường dẫn tới file có thật.

```flow
inputs {
  cookieFile: file
}
```

UI có file browser để chọn file.

Kết quả trả về là absolute path.

### `folder`

Đường dẫn tới thư mục có thật.

```flow
inputs {
  outputDir: folder
}
```

UI có folder browser để chọn thư mục.

Kết quả trả về là absolute path.

### `checkbox`

Boolean `true` hoặc `false`.

```flow
inputs {
  enabled: checkbox = true
}
```

Trong UI hiển thị dạng:

```text
[x] true
[ ] false
```

### `comboBox`

Chọn một giá trị trong danh sách.

```flow
inputs {
  mode: comboBox ["fast", "safe", "debug"] = "safe"
}
```

Default phải nằm trong danh sách option.

## 7. Input UI

Nếu script có `inputs`, CLI mở một khung UI tương tác sử dụng `@clack/prompts`.

Cách sử dụng form:

- Di chuyển con trỏ lên xuống bằng phím mũi tên `↑` / `↓` hoặc `Tab`.
- Nhấn `Enter` để chọn một field muốn sửa hoặc bấm nút hành động (`▶ Run flow`, `← Go Back`).
- Trong các sub-prompt sửa giá trị:
  - `checkbox`: Chọn Yes/No bằng mũi tên và `Enter`.
  - `comboBox`: Chọn option mong muốn và `Enter`.
  - `file` / `folder`: Sử dụng trình duyệt file để chọn hoặc tự nhập đường dẫn bằng tay.
  - `text` / `number` / `input`: Nhập giá trị và nhấn `Enter`.

Với trình duyệt file/folder:

- Di chuyển lên xuống bằng `↑` / `↓`.
- Nhấn `Enter` để duyệt vào thư mục con hoặc chọn file/thư mục.
- Chọn `📁 .. (Parent Directory)` để lên thư mục cha.
- Chọn `✍️ Type/paste path manually` để nhập tay đường dẫn mong muốn.
- Chọn `✨ Select current folder` để chọn thư mục hiện tại (chỉ có khi ở chế độ chọn `folder`).
- Chọn `❌ Cancel (Back to Form)` để hủy và giữ nguyên giá trị cũ.

## 8. Dùng biến input trong command

Dùng `${tenBien}` để chèn input vào command.

```flow
inputs {
  url: text = "https://example.com"
  keyword: text = "donut"
}

run profile {
  nav "${url}/search?q=${keyword}"
  waitLoad
}
```

Biến dùng được trong cả 3 block:

```flow
before run profile {
  log "Start with ${keyword}"
}

run profile {
  nav "https://example.com?q=${keyword}"
}

after kill profile {
  log "Done ${keyword}"
}
```

Nếu dùng biến chưa khai báo, runner báo lỗi kèm line number.

## 9. Comment

Hỗ trợ comment bằng `#` hoặc `//`.

```flow
# Comment kiểu shell
// Comment kiểu JS

run profile {
  nav "https://example.com" # comment cuối dòng
  waitLoad
}
```

Comment trong chuỗi không bị cắt:

```flow
run profile {
  log "This # is text"
  log "This // is text"
}
```

## 10. Quote và khoảng trắng

Nếu argument có khoảng trắng, bọc bằng dấu quote.

```flow
run profile {
  log "hello world"
  type "//textarea" "hello world"
}
```

Có thể dùng quote đơn hoặc quote đôi:

```flow
log 'hello world'
log "hello world"
```

## 11. Danh sách command

### `log`

In log ra terminal.

```flow
log "Hello"
log "Value=${value}"
```

Dùng được trong mọi block.

### `sleep` / `delay`

Dừng script trong số milliseconds.

```flow
sleep 1000
```

Hoặc random trong khoảng min/max:

```flow
delay 2000 5000
```

Dùng được trong mọi block.

### `nav` / `goto`

Mở URL.

```flow
nav "https://example.com"
goto "https://example.com"
```

Chỉ dùng trong `run profile`.

### `waitLoad`

Chờ document ready state complete.

```flow
waitLoad
```

Chỉ dùng trong `run profile`.

### `info`

In title và URL hiện tại.

```flow
info
```

Chỉ dùng trong `run profile`.

### `waitElement` / `waitXPath`

Chờ XPath xuất hiện.

```flow
waitElement "//button" 10000
waitXPath "//textarea" 5000
```

Tham số:

1. XPath.
2. Timeout milliseconds, không bắt buộc. Default `10000`.

Chỉ dùng trong `run profile`.

### `click`

Click element đầu tiên match XPath.

```flow
click "//button[contains(., 'Submit')]"
```

Chỉ dùng trong `run profile`.

### `typeText`

Click element match XPath rồi gõ từng ký tự với delay ngẫu nhiên, mô phỏng người thật.

```flow
typeText "//input[@name='email']" "user@example.com"
```

Tham số:

1. XPath element.
2. Text cần gõ (có thể có khoảng trắng).

`type` là alias của `typeText`, vẫn hoạt động nhưng nên dùng `typeText` cho mới.

Chỉ dùng trong `run profile`.

### `pasteText`

Ghi text vào clipboard, click element match XPath rồi Ctrl+V. Phù hợp cho emoji, Unicode phức tạp, multiline.

```flow
pasteText "//textarea[@name='message']" "Hello 👋🌍"
```

Lưu ý:

- Cần browser hỗ trợ clipboard write (thông thường Camoufox hỗ trợ).
- Nếu clipboard bị chặn, sẽ báo lỗi rõ.
- Nên dùng `pasteText` thay `typeText` khi text chứa emoji hoặc text dài.

Chỉ dùng trong `run profile`.

### Navigation/tab commands

Chỉ dùng trong `run profile`.

```flow
navUrl "https://example.com"   # alias logic với nav/goto
newTab "https://example.com"   # mở tab mới và active
activeTab 0                    # chuyển tab theo index 0-based hoặc context id
closeTab
backNav 10000                  # timeout optional
reloadNav
getUrl                         # lưu vào ${pageUrl}
waitUrlChange "${pageUrl}" 10000
```

### Element/read commands

Chỉ dùng trong `run profile`. Kết quả lưu vào biến runtime để dùng bằng `${...}`.

```flow
waitElement "//h1" 10000
getElementText "//h1"                  # ${elementText}
getElementAttribute "//a" "href"       # ${elementAttribute}
countElement "//button"                # ${elementCount}
```

### Mouse, scroll, JS, upload

Chỉ dùng trong `run profile`.

```flow
moveMouse "//button"
scroll 600      # dương cuộn xuống, âm cuộn lên
js "document.title"                    # ${jsResult}
executeJs "document.body.innerText"
fileUpload "C:/tmp/a.png" "//input[@type='file']"
```

`fileUpload` validate file, nạp file vào XPath `input[type=file]`, rồi dispatch `input` và `change` event.

### HTTP commands

Dùng được trong mọi block vì không cần browser.

```flow
httpRequest "https://httpbin.org/post" "POST" "{\"content-type\":\"application/json\"}" "{\"ok\":true}"
log "status=${httpStatus} body=${httpBody}"

httpDownload "https://example.com/image.png" "./downloads/image.png"
log "saved=${downloadPath} bytes=${downloadBytes}"
```

`httpRequest` lưu: `${httpStatus}`, `${httpHeaders}`, `${httpBody}`, `${httpUrl}`.
`httpDownload` lưu: `${downloadPath}`, `${downloadBytes}`.

## 12. Control flow, biểu thức, `hasElement`

Block control flow dùng thụt dòng. Dòng con thụt vào sâu hơn dòng `if`, `while`, `for` thì thuộc block đó. `else if` và `else` phải cùng độ thụt với `if` để được hiểu là cùng nhánh.

```flow
run profile {
  nav "https://example.com"
  waitLoad

  if hasElement("//h1")
    log "Có h1"
  else if 1 + 1 == 3
    log "Không xảy ra"
  else
    log "Không có h1"
}
```

Hỗ trợ toán tử:

- Toán học: `+`, `-`, `*`, `/`, `%`
- So sánh: `==`, `!=`, `<`, `<=`, `>`, `>=`
- Logic: `&&`, `||`, `!`
- Nhóm: `( ... )`

### `set`

Gán biến runtime. Biến dùng được ở expression và `${...}` sau khi gán.

```flow
set n = 1
set ${title} = "hello"
n = n + 1
```

### `while`

```flow
run profile {
  set n = 0
  while n < 3
    log "while loopIndex=${loopIndex} n=${n}"
    set n = n + 1
}
```

### `nextLoop` / `exitLoop`

Điều khiển vòng lặp gần nhất.

```flow
run profile {
  for i = 0; i < 10; i = i + 1
    if i == 2
      nextLoop
    if i == 5
      exitLoop
    log "i=${i}"
}
```

- `nextLoop`: bỏ phần còn lại của iteration hiện tại.
- `exitLoop`: thoát khỏi loop gần nhất.
- Dùng ngoài `while`/`for` sẽ báo lỗi.

### `for`

```flow
run profile {
  for i = 0; i < 3; i = i + 1
    log "for loopIndex=${loopIndex} i=${i}"
}
```

`loopIndex` là số thứ tự vòng lặp gần nhất, bắt đầu từ `0`. Nếu loop lồng nhau, `loopIndex` trỏ tới vòng lặp trong cùng. Khi thoát loop trong, giá trị loop ngoài được khôi phục.

### `hasElement(xpath)`

`hasElement(xpath)` trả về `true` nếu XPath tồn tại trên page.

```flow
run profile {
  if hasElement("//button[contains(., 'Login')]")
    click "//button[contains(., 'Login')]"
  else
    log "Không thấy nút Login"
}
```

`hasElement` chỉ dùng trong `run profile` vì cần page đang mở.

## 13. XPath cơ bản

`.flow` dùng XPath cho các command element.

Ví dụ XPath phổ biến:

```flow
# Button có text Submit
click "//button[contains(., 'Submit')]"

# Input có placeholder Search
click "//input[@placeholder='Search']"

typeText "//input[@placeholder='Search']" "donut"

# Textarea đầu tiên
waitElement "//textarea" 10000

typeText "//textarea" "hello"

# Paste text có emoji
pasteText "//textarea" "Hello 👋🌍"

# Link chứa text Login
click "//a[contains(., 'Login')]"
```

## 14. Override input bằng CLI

Có thể truyền input từ command line:

```bash
pnpm dev run --profile <profile-id> --script ./scripts/my.flow --input keyword=donut --input mode=safe
```

Có thể dùng nhiều `--input`.

Format bắt buộc:

```text
--input key=value
```

Nếu value có khoảng trắng, bọc quote ở shell:

```bash
pnpm dev run --script ./scripts/my.flow --input "message=hello world"
```

## 15. Script legacy flat

File `.flow` cũ không có block vẫn chạy được.

Ví dụ cũ:

```flow
nav https://example.com
waitLoad
info
```

Runner hiểu đây là main logic tương đương:

```flow
run profile {
  nav https://example.com
  waitLoad
  info
}
```

Nhưng script mới nên dùng block rõ ràng.

## 16. Ví dụ đầy đủ

```flow
inputs {
  startUrl: input = "https://example.com"
  searchText: text = "donut browser"
  delayMinMs: number = 1000
  delayMaxMs: number = 3000
  outputDir: folder
  dryRun: checkbox = false
  mode: comboBox ["fast", "safe", "debug"] = "safe"
}

before run profile {
  log "Preparing job"
  log "mode=${mode} dryRun=${dryRun} outputDir=${outputDir}"
}

run profile {
  nav "${startUrl}"
  waitLoad
  delay "${delayMinMs}" "${delayMaxMs}"
  info

  # Ví dụ nếu page có ô search
  # waitElement "//input[@type='search']" 10000
  # type "//input[@type='search']" "${searchText}"
}

after kill profile {
  log "Browser killed. Job complete."
}
```

## 17. Lỗi thường gặp

### Thiếu `run profile`

Sai:

```flow
before run profile {
  log "hello"
}
```

Đúng:

```flow
run profile {
  log "hello"
}
```

### Dùng lệnh browser sai block

Sai:

```flow
before run profile {
  nav "https://example.com"
}
```

Đúng:

```flow
run profile {
  nav "https://example.com"
}
```

### ComboBox default không nằm trong options

Sai:

```flow
inputs {
  mode: comboBox ["fast", "safe"] = "debug"
}
```

Đúng:

```flow
inputs {
  mode: comboBox ["fast", "safe", "debug"] = "debug"
}
```

### Number input không phải số

Sai:

```flow
inputs {
  count: number = "abc"
}
```

Đúng:

```flow
inputs {
  count: number = 10
}
```

### Quên quote text có khoảng trắng

Sai:

```flow
log hello world
```

Lệnh này vẫn chạy nhưng bị tách thành nhiều argument. Với `log` không sao, nhưng với command khác có thể sai.

Nên viết:

```flow
log "hello world"
```

## 18. Quy ước nên dùng

- Dùng block mới cho mọi script mới.
- Khai báo input ở đầu file.
- Đặt tên input rõ nghĩa: `startUrl`, `apiEndpoint`, `outputDir`, `dryRun`.
- URL, path, token, mode nên đưa vào `inputs`, không hardcode.
- Dùng `before run profile` để log input quan trọng.
- Dùng `after kill profile` để log kết thúc.
- Quote mọi string có khoảng trắng hoặc ký tự đặc biệt.
- XPath nên test kỹ trong browser devtools trước khi đưa vào `.flow`.
