export type FlowCatalogItem = {
  name: string;
  aliases: string[];
  desc: string;
};

export type FlowCompletionKind = 'command' | 'function' | 'syntax';

export type FlowCompletionItem = FlowCatalogItem & {
  kind: FlowCompletionKind;
  snippet: string;
  pageOnly?: boolean;
};

export const FLOW_COMMANDS: FlowCompletionItem[] = [
  { name: 'goto', aliases: ['nav', 'navUrl', 'navurl'], desc: 'Navigate to URL', kind: 'command', snippet: "nav('')", pageOnly: true },
  { name: 'newTab', aliases: [], desc: 'Open and activate a new tab, optionally with URL', kind: 'command', snippet: "newTab('')", pageOnly: true },
  { name: 'closeTab', aliases: [], desc: 'Close active tab', kind: 'command', snippet: 'closeTab()', pageOnly: true },
  { name: 'activeTab', aliases: [], desc: 'Activate tab by zero-based index or context id', kind: 'command', snippet: 'activeTab()', pageOnly: true },
  { name: 'backNav', aliases: [], desc: 'Navigate browser history back', kind: 'command', snippet: 'backNav()', pageOnly: true },
  { name: 'reloadNav', aliases: [], desc: 'Reload current page', kind: 'command', snippet: 'reloadNav()', pageOnly: true },
  { name: 'getUrl', aliases: [], desc: 'Store current URL in pageUrl', kind: 'command', snippet: 'getUrl()', pageOnly: true },
  { name: 'waitUrlChange', aliases: [], desc: 'Wait until URL differs from given URL', kind: 'command', snippet: "waitUrlChange('',)", pageOnly: true },
  { name: 'waitLoad', aliases: [], desc: 'Wait for page load (2s settle + readyState)', kind: 'command', snippet: 'waitLoad()', pageOnly: true },
  { name: 'waitElement', aliases: ['waitXPath'], desc: 'Wait for XPath match (default 10s)', kind: 'command', snippet: "waitElement('',)", pageOnly: true },
  { name: 'getElementAttribute', aliases: [], desc: 'Store XPath attribute in elementAttribute', kind: 'command', snippet: "getElementAttribute('','')", pageOnly: true },
  { name: 'getElementText', aliases: [], desc: 'Store XPath text in elementText', kind: 'command', snippet: "getElementText('')", pageOnly: true },
  { name: 'countElement', aliases: [], desc: 'Store XPath match count in elementCount', kind: 'command', snippet: "countElement('')", pageOnly: true },
  { name: 'click', aliases: [], desc: 'Click element by XPath', kind: 'command', snippet: "click('')", pageOnly: true },
  { name: 'typeText', aliases: ['type'], desc: 'Type text into element', kind: 'command', snippet: "typeText('','')", pageOnly: true },
  { name: 'pasteText', aliases: [], desc: 'Paste text via clipboard', kind: 'command', snippet: "pasteText('','')", pageOnly: true },
  { name: 'moveMouse', aliases: [], desc: 'Move mouse to XPath element', kind: 'command', snippet: "moveMouse('')", pageOnly: true },
  { name: 'scroll', aliases: [], desc: 'Scroll page by pixels', kind: 'command', snippet: 'scroll()' , pageOnly: true },
  { name: 'js', aliases: ['executeJs', 'executeJS'], desc: 'Execute JavaScript and store result in jsResult', kind: 'command', snippet: "js('')", pageOnly: true },
  { name: 'fileUpload', aliases: [], desc: 'Upload file into input[type=file] XPath when supported', kind: 'command', snippet: "fileUpload('','')", pageOnly: true },
  { name: 'info', aliases: [], desc: 'Log page title and URL', kind: 'command', snippet: 'info()', pageOnly: true },
  { name: 'httpRequest', aliases: [], desc: 'Run HTTP request and store httpStatus/httpHeaders/httpBody/httpUrl', kind: 'command', snippet: "httpRequest('','','','',rDelay())" },
  { name: 'httpDownload', aliases: [], desc: 'Download URL to file and store downloadPath/downloadBytes', kind: 'command', snippet: "httpDownload('','')" },
  { name: 'fileWriteAllText', aliases: [], desc: 'Overwrite a text file', kind: 'command', snippet: "fileWriteAllText('','')" },
  { name: 'writeExcel', aliases: [], desc: 'Write a value to an Excel cell', kind: 'command', snippet: "writeExcel('',,, '')" },
  { name: 'delay', aliases: ['sleep'], desc: 'Sleep N ms (or N-M for random range)', kind: 'command', snippet: 'delay(,)' },
  { name: 'log', aliases: [], desc: 'Log message', kind: 'command', snippet: "log('')" },
  { name: 'help', aliases: [], desc: 'Show available commands', kind: 'command', snippet: 'help()' },
];

export const FLOW_FUNCTIONS: FlowCompletionItem[] = [
  { name: 'getUrl', aliases: [], desc: 'Return current page URL', kind: 'function', snippet: 'getUrl()', pageOnly: true },
  { name: 'httpRequest', aliases: [], desc: 'Run HTTP request and return raw response text', kind: 'function', snippet: "httpRequest('','','','')" },
  { name: 'js', aliases: ['executeJs', 'executeJS'], desc: 'Execute JavaScript and return result', kind: 'function', snippet: "js('')", pageOnly: true },
  { name: 'getElementText', aliases: [], desc: 'Return XPath text', kind: 'function', snippet: "getElementText('')", pageOnly: true },
  { name: 'getElementAttribute', aliases: [], desc: 'Return XPath attribute', kind: 'function', snippet: "getElementAttribute('','')", pageOnly: true },
  { name: 'countElement', aliases: [], desc: 'Return XPath match count', kind: 'function', snippet: "countElement('')", pageOnly: true },
  { name: 'hasElement', aliases: ['existsXPath'], desc: 'Check XPath exists', kind: 'function', snippet: "hasElement('')", pageOnly: true },
  { name: 'splitText', aliases: [], desc: 'Split text by delimiter and return an array', kind: 'function', snippet: "splitText('','')" },
  { name: 'contains', aliases: [], desc: 'Check whether one string contains another, or check whether second string is empty when first is empty', kind: 'function', snippet: "contains('','')" },
  { name: 'readJson', aliases: [], desc: 'Read JSON value by dotted path', kind: 'function', snippet: "readJson('',)" },
  { name: 'randomNum', aliases: [], desc: 'Return random integer between min and max', kind: 'function', snippet: 'randomNum(,)' },
  { name: 'fileExist', aliases: [], desc: 'Check file exists', kind: 'function', snippet: "fileExist('')" },
  { name: 'folderExist', aliases: [], desc: 'Check folder exists', kind: 'function', snippet: "folderExist('')" },
  { name: 'readExcel', aliases: [], desc: 'Read value from Excel cell by header and row', kind: 'function', snippet: "readExcel('',,)" },
  { name: 'fileReadAllText', aliases: [], desc: 'Read entire text file', kind: 'function', snippet: "fileReadAllText('')" },
  { name: '2FA', aliases: [], desc: 'Fetch TOTP token from https://2fa.live', kind: 'function', snippet: "2FA('')" },
];

export const FLOW_SYNTAX_COMPLETIONS: FlowCompletionItem[] = [
  { name: 'inputs', aliases: [], desc: 'Declare script inputs', kind: 'syntax', snippet: 'inputs {\n  \n}' },
  { name: 'before', aliases: ['before()'], desc: 'Run before launching browser profile', kind: 'syntax', snippet: 'before() {\n  \n}' },
  { name: 'running', aliases: ['running()'], desc: 'Run after browser connects', kind: 'syntax', snippet: 'running() {\n  \n}' },
  { name: 'after', aliases: ['after()'], desc: 'Run after browser profile is killed', kind: 'syntax', snippet: 'after() {\n  \n}' },
  { name: 'if', aliases: [], desc: 'Conditional block', kind: 'syntax', snippet: 'if  {\n  \n}' },
  { name: 'else if', aliases: ['elseif'], desc: 'Conditional branch', kind: 'syntax', snippet: 'else if  {\n  \n}' },
  { name: 'else', aliases: [], desc: 'Fallback branch', kind: 'syntax', snippet: 'else {\n  \n}' },
  { name: 'while', aliases: [], desc: 'While loop', kind: 'syntax', snippet: 'while  {\n  \n}' },
  { name: 'for', aliases: [], desc: 'For loop', kind: 'syntax', snippet: 'for i = 0; i < ; i = i + 1\n  ' },
  { name: 'nextLoop', aliases: [], desc: 'Skip to next loop iteration', kind: 'syntax', snippet: 'nextLoop' },
  { name: 'exitLoop', aliases: [], desc: 'Exit current loop', kind: 'syntax', snippet: 'exitLoop' },
  { name: 'rDelay', aliases: ['rDelay()'], desc: 'Append random delay after command', kind: 'syntax', snippet: 'rDelay()' },
];

export const FLOW_INPUT_COMPLETIONS: FlowCompletionItem[] = [
  { name: 'input', aliases: [], desc: 'Text or number input', kind: 'syntax', snippet: 'name: input = ""' },
  { name: 'text', aliases: [], desc: 'Text input', kind: 'syntax', snippet: 'name: text = ""' },
  { name: 'number', aliases: [], desc: 'Number input', kind: 'syntax', snippet: 'name: number = 0' },
  { name: 'file', aliases: [], desc: 'File picker', kind: 'syntax', snippet: 'name: file = ""' },
  { name: 'folder', aliases: [], desc: 'Folder picker', kind: 'syntax', snippet: 'name: folder = ""' },
  { name: 'checkbox', aliases: ['bool'], desc: 'Boolean input', kind: 'syntax', snippet: 'name: checkbox = false' },
  { name: 'comboBox', aliases: ['combo'], desc: 'Choice list', kind: 'syntax', snippet: 'name: comboBox ["fast", "safe"] = "fast"' },
  { name: 'inputExcelFile', aliases: ['excel'], desc: 'Excel file input', kind: 'syntax', snippet: 'name: inputExcelFile = ""' },
];

export const FLOW_COMPLETIONS: FlowCompletionItem[] = [
  ...FLOW_COMMANDS,
  ...FLOW_FUNCTIONS.filter((item) => !FLOW_COMMANDS.some((command) => command.name === item.name)),
  ...FLOW_SYNTAX_COMPLETIONS,
];

export const RDELAY_DESC = '  rDelay — append to any command for random delay after execution (optional), e.g. rDelay, rDelay(), or rDelay(3000,4000)';

export const COMMAND_LIST = FLOW_COMMANDS.map((c) => `  ${c.name}${c.aliases.length ? ` (${c.aliases.join('/')})` : ''} — ${c.desc}`).join('\n');
export const FUNCTION_LIST = FLOW_FUNCTIONS.map((f) => `  ${f.name}${f.aliases.length ? ` (${f.aliases.join('/')})` : ''} — ${f.desc}`).join('\n');

export const PAGE_COMMANDS = new Set(
  FLOW_COMMANDS
    .filter((item) => item.pageOnly)
    .flatMap((item) => [item.name, ...item.aliases])
    .map((item) => item.toLowerCase())
);

export const PAGE_FUNCTIONS = new Set(
  FLOW_FUNCTIONS
    .filter((item) => item.pageOnly)
    .flatMap((item) => [item.name, ...item.aliases])
    .map((item) => item.toLowerCase())
);
