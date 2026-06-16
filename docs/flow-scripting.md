# Flow scripting

`*.flow` dùng syntax call chuẩn: `name(arg1, arg2)`.

## Syntax

- Command / function call: `name(arg1, arg2)`
- Tất cả args đi trong ngoặc đơn.
- Không cần JSON escape trong source `.flow`.
- Command names theo camelCase: `nav`, `waitLoad`, `fileUpload`, `httpRequest`, `readExcel`, ...

## Ví dụ

```flow
inputs {
  url: input = "https://example.com"
  xpath: text = "//button"
}

before() {
  log("Before run")
}

running() {
  nav("${url}")
  waitLoad()
  click("${xpath}")
  fileUpload("E:\\Temp\\upload.png", "//input[@type='file']")
  httpRequest("https://httpbin.org/post", POST, {"content-type":"application/json"}, {"ok":true})
}

after() {
  log("Done")
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
fileUpload("E:\\Code\\donumate\\docs\\upload.png", "//input[@type='file']")
fileWriteAllText("./out.txt", "hello")
```

### HTTP / data

```flow
httpRequest("https://httpbin.org/post", POST, {"content-type":"application/json"}, {"ok":true})
httpDownload("https://example.com/image.png", "./downloads/image.png")
readJson("{\"code\":200}", "code")
readExcel("C:\\Temp\\data.xlsx", "A", 2)
writeExcel("C:\\Temp\\data.xlsx", "A", 2, "value")
```

## Notes

- `before()` / `after()` không có page/browser.
- `running()` mới dùng command browser.
- Alias cũ kiểu `type` vẫn chạy, nhưng tên chuẩn là camelCase.
- Tất cả command/function call đều phải dùng ngoặc đơn.
- Windows path viết thẳng trong string, ví dụ `"E:\Code\donumate\docs"`.
