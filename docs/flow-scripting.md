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

## 2. Vòng đời chạy script

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

## 3. Khi nào dùng từng block

### `before run profile`

Dùng để log, chuẩn bị dữ liệu, xác nhận input trước khi browser mở.

Có thể dùng:

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

## 4. Khai báo input

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

## 5. Các loại input

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

## 6. Input UI

Nếu script có `inputs`, CLI mở một khung UI duy nhất.

Phím điều khiển:

| Phím | Tác dụng |
|------|----------|
| `Tab` | Đi xuống field tiếp theo |
| `↑` / `↓` | Di chuyển field |
| `←` / `→` | Toggle checkbox, đổi comboBox, mở file/folder browser |
| `Enter` | Submit nếu đang ở `Run flow`, hoặc mở file/folder browser |
| `Esc` | Hủy |

Với file/folder browser:

| Phím | Tác dụng |
|------|----------|
| `↑` / `↓` | Di chuyển |
| `Enter` | Mở folder hoặc chọn file/folder |
| `←` | Lên folder cha |
| `Esc` | Quay lại form input |

## 7. Dùng biến input trong command

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

## 8. Comment

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

## 9. Quote và khoảng trắng

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

## 10. Danh sách command

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

### `type`

Nhập text vào element match XPath.

```flow
type "//textarea" "hello world"
```

Chỉ dùng trong `run profile`.

## 11. Control flow, biểu thức, `hasElement`

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

### `while`

```flow
run profile {
  set n = 0
  while n < 3
    log "while loopIndex=${loopIndex} n=${n}"
    set n = n + 1
}
```

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

## 12. XPath cơ bản

`.flow` dùng XPath cho các command element.

Ví dụ XPath phổ biến:

```flow
# Button có text Submit
click "//button[contains(., 'Submit')]"

# Input có placeholder Search
click "//input[@placeholder='Search']"

type "//input[@placeholder='Search']" "donut"

# Textarea đầu tiên
waitElement "//textarea" 10000

type "//textarea" "hello"

# Link chứa text Login
click "//a[contains(., 'Login')]"
```

## 12. Override input bằng CLI

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

## 13. Script legacy flat

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

## 14. Ví dụ đầy đủ

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

## 15. Lỗi thường gặp

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

## 16. Quy ước nên dùng

- Dùng block mới cho mọi script mới.
- Khai báo input ở đầu file.
- Đặt tên input rõ nghĩa: `startUrl`, `apiEndpoint`, `outputDir`, `dryRun`.
- URL, path, token, mode nên đưa vào `inputs`, không hardcode.
- Dùng `before run profile` để log input quan trọng.
- Dùng `after kill profile` để log kết thúc.
- Quote mọi string có khoảng trắng hoặc ký tự đặc biệt.
- XPath nên test kỹ trong browser devtools trước khi đưa vào `.flow`.
