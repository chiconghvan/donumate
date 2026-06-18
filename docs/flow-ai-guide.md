# AI guide for `.flow`

Tài liệu cho AI: nhận yêu cầu, chọn đúng hướng, sinh/chỉnh sửa `.flow` nhanh.

## 1) Mục tiêu

Dùng file này để:
- thiết kế script `.flow` mới theo yêu cầu user
- chỉnh sửa script `.flow` có sẵn
- giải thích nên dùng `.flow` hay TypeScript `.js/.ts`

## 2) Chọn `.flow` hay `.ts/.js`

### Chọn `.flow` khi
- luồng rõ ràng, tuyến tính
- thao tác page bằng XPath / click / type / paste / wait
- có input form đơn giản
- cần chạy nhanh, dễ đọc, dễ chỉnh

### Chọn `.ts/.js` khi
- workflow phức tạp ngoài khả năng command `.flow`
- cần logic nhiều nhánh, map/filter/reduce, async custom
- cần gọi API, xử lý dữ liệu lớn, parse phức tạp
- cần reuse helper code hoặc tách module

## 3) Create flow script CLI

Trong CLI interactive (`pnpm start`), root menu có:

- `Run Scripts`: chạy script có sẵn trong `./scripts/` hoặc built-in.
- `Create flow script`: hỏi tên script, lưu file mới vào `./scripts/`, mở Ink editor có autocomplete từ runtime `.flow` catalog.

Autocomplete chèn snippet theo loại input: text có quote, number/boolean để trống raw. Ví dụ `nav` -> `nav('')`, `delay` -> `delay(,)`, `httpRequest` -> `httpRequest('','','','',rDelay())`.

## 4) Cách AI phải trả lời yêu cầu

Khi user muốn tạo script:
1. tóm tắt mục tiêu 1 câu
2. chọn kiểu: `.flow` hoặc `.ts/.js`
3. nếu `.flow`, xuất script hoàn chỉnh hoặc patch nhỏ
4. nếu `.ts/.js`, đề xuất skeleton ngắn
5. nêu input cần khai báo
6. nêu command/XPath chính

## 5) Template nhanh để sinh `.flow`

```flow
inputs {
  startUrl: input = "https://example.com"
  keyword: text = "donut"
  dryRun: checkbox = false
}

before() {
  log("Start keyword=${keyword} dryRun=${dryRun}")
}

running() {
  nav("${startUrl}")
  waitLoad()

  # page steps here
  # click("//button[contains(., 'Search')]")
}

after() {
  log("Done")
}
```

## 6) Pattern theo nhu cầu

### A. Login / form fill
Dùng:
- `nav`
- `waitElement`
- `typeText` hoặc `pasteText`
- `click`
- `waitLoad`
- `hasElement`

```flow
running() {
  nav("${startUrl}")
  waitLoad()
  typeText("//input[@name='email']", "${email}")
  pasteText("//textarea[@name='note']", "${message}")
}
```

### B. Search / list / scrape nhẹ
Dùng:
- `set`
- `while` / `for`
- `waitElement`
- `getElementText`
- `countElement`

### C. File / Excel
Dùng:
- `file` / `folder` input
- `fileUpload`
- `readExcel`
- `writeExcel`
- `fileWriteAllText`

### D. HTTP / data prep
Dùng:
- `httpRequest`
- `httpDownload`
- `splitText`
- `contains`
- `readJson`
- `randomNum`
- `fileReadAllText`
- `2FA` (fetch TOTP token từ 2fa.live)

### E. String check
Dùng:
- `contains`
- `if contains(str1, str2)` để test string có chứa string khác
- `if contains("", str2)` để test `str2` có rỗng không

## 7) Quy tắc chọn command

- page/browser action → chỉ `running()`
- chuẩn bị/log dữ liệu → `before()`
- cleanup/log cuối → `after()`
- không có browser → dùng `httpRequest`, helper data/file, Excel
- text có khoảng trắng/emoji → quote + ưu tiên `pasteText`
- command/function call luôn dạng `name(arg1, arg2)`
- command names camelCase: `navUrl`, `waitLoad`, `fileUpload`, `httpRequest`, `readExcel`

## 8) Cách chỉnh sửa script `.flow` có sẵn

Khi user đưa file `.flow` cũ, AI cần:
1. giữ command cũ nếu đúng mục tiêu
2. thêm `inputs {}` nếu thiếu param
3. chuyển script legacy sang block mới nếu hợp
4. tách bước page vào `running()`
5. đưa log/prepare vào `before()`
6. đưa cleanup vào `after()`
7. tối giản XPath và quote string

## 9) Output format gợi ý cho AI

### Nếu tạo mới
- `Mục tiêu`
- `Nên dùng`
- `Script`
- `Lưu ý`

### Nếu sửa script
- `Điểm cần đổi`
- `Bản cập nhật`
- `Lý do`
