# Gscript Runtime

## Tổng Quan
`gscript` là runtime riêng cho workflow `GPM Automate .gscript`, không phải `flow` DSL. CLI chạy qua lệnh:

```bash
pnpm start gscript --script ./scripts/example.gscript
```

File `.gscript` là JSON, được đọc từ thư mục hiện tại và phải có 3 block gốc: `before_init`, `main_logic`, `after_quit`.

## Cấu Trúc Codebase
- `src/cli.ts`: khai báo command `gscript` và chuyển vào `runGscriptWorkflow()`.
- `src/runtime/gscript/parser.ts`: đọc JSON, parse node cây, trích input, báo lỗi khi thiếu block hoặc gặp kiểu node không hỗ trợ.
- `src/runtime/gscript/runner.ts`: điều phối input, chọn profile, launch Donut profile, tạo context và chạy 3 pha workflow.
- `src/runtime/gscript/executor.ts`: thực thi block, vòng lặp, điều kiện, nhánh lỗi `failed_block`, và signal `next` / `exit` / `stop`.
- `src/runtime/gscript/actions.ts`: map action node sang thao tác thực tế trên profile, page, BiDi.

## Logic Thực Thi
Luồng chuẩn:
1. Load `.gscript` và collect input từ các action `type = 1` có `ALLOW_USER_INPUT = true`.
2. Hiển thị form input và lưu state vào bộ nhớ cục bộ để dùng lại lần sau.
3. Chọn hoặc nhận profile Camoufox.
4. Chạy `before_init`.
5. Launch profile, gắn `run`, `bidi`, `page` vào execution context.
6. Chạy `main_logic`.
7. Luôn cleanup và chạy `after_quit`, kể cả khi có lỗi.

`while` có giới hạn an toàn `10000` vòng lặp. `failed_block` chỉ chạy khi action bật `use_failed_block`.

## Hướng Dẫn Sử Dụng Script
- Đặt file trong `./scripts/` hoặc truyền đường dẫn tuyệt đối/tương đối qua `--script`.
- Script nên giữ tên rõ nghĩa, ví dụ `login.gscript`, `scrape-profile.gscript`.
- Nếu script lỗi JSON hoặc thiếu `before_init` / `main_logic` / `after_quit`, runtime sẽ dừng sớm và in lỗi chi tiết.

### Truyền Input Khi Chạy EXE
Bản exe được build không kèm Ink TUI, nên không có form nhập tương tác. Khi chạy `release/donumate-win-x64.exe`, bạn phải truyền input bằng `--input key=value`.

Ví dụ:

```bash
donumate.exe gscript --script .\scripts\example.gscript --input username=demo --input password=secret
```

Quy tắc:
- Mỗi biến là một cặp `key=value`.
- Có thể lặp nhiều lần, cùng key thì giá trị sau cùng được dùng.
- Giá trị có khoảng trắng cần được quote theo shell, ví dụ PowerShell: `--input query="camera lens"`.
- Với input kiểu `checkbox`, dùng `true` hoặc `false`.
- Với `number`, truyền số dạng text, ví dụ `--input retryCount=3`.

Trong runtime, các giá trị này được gom vào `ctx.inputs` và `ctx.args`. Script nên đọc từ đó thay vì phụ thuộc vào giao diện tương tác.
Nếu tất cả input mà script khai báo đều đã có trong `--input`, runtime sẽ tự bỏ qua form nhập và chạy thẳng.

## Bản Build EXE
Build bản đóng gói Windows bằng:

```bash
pnpm build:exe
```

Quy trình build:
- bundle `src/cli.ts` vào `dist-exe/cli.js`
- copy asset của script builder sang `dist-exe/script-builder/web`
- đóng gói ra `release/donumate-win-x64.exe`
- `src/ui/stub-ink.ts` và `src/ui/stub-react.ts` được dùng để loại bỏ giao diện TUI khỏi bản exe

Nếu cần dọn output cũ:

```bash
pnpm build:clean
```
