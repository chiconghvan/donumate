export type FlowCommandSpec = {
  name: string;
  aliases: string[];
  desc: string;
  pageOnly?: boolean;
  minArgs: number;
  maxArgs: number;
  sideEffects?: string[];
};

export type FlowFunctionSpec = {
  name: string;
  aliases: string[];
  desc: string;
  pageOnly?: boolean;
  minArgs: number;
  maxArgs: number;
};

export const FLOW_COMMAND_SPECS: FlowCommandSpec[] = [
  { name: 'goto', aliases: ['nav', 'navUrl', 'navurl'], desc: 'Navigate to URL', pageOnly: true, minArgs: 1, maxArgs: 1 },
  { name: 'newTab', aliases: [], desc: 'Open and activate a new tab, optionally with URL', pageOnly: true, minArgs: 0, maxArgs: 1 },
  { name: 'closeTab', aliases: [], desc: 'Close active tab', pageOnly: true, minArgs: 0, maxArgs: 0 },
  { name: 'activeTab', aliases: [], desc: 'Activate tab by zero-based index or context id', pageOnly: true, minArgs: 1, maxArgs: 1 },
  { name: 'backNav', aliases: [], desc: 'Navigate browser history back', pageOnly: true, minArgs: 0, maxArgs: 1 },
  { name: 'reloadNav', aliases: [], desc: 'Reload current page', pageOnly: true, minArgs: 0, maxArgs: 0 },
  { name: 'getUrl', aliases: [], desc: 'Store current URL in pageUrl', pageOnly: true, minArgs: 0, maxArgs: 0, sideEffects: ['pageUrl'] },
  { name: 'waitUrlChange', aliases: [], desc: 'Wait until URL differs from given URL', pageOnly: true, minArgs: 1, maxArgs: 2, sideEffects: ['pageUrl'] },
  { name: 'waitLoad', aliases: [], desc: 'Wait for page load (2s settle + readyState)', pageOnly: true, minArgs: 0, maxArgs: 1 },
  { name: 'waitElement', aliases: ['waitXPath'], desc: 'Wait for XPath match (default 10s)', pageOnly: true, minArgs: 1, maxArgs: 2 },
  { name: 'getElementAttribute', aliases: [], desc: 'Store XPath attribute in elementAttribute', pageOnly: true, minArgs: 2, maxArgs: 2, sideEffects: ['elementAttribute'] },
  { name: 'getElementText', aliases: [], desc: 'Store XPath text in elementText', pageOnly: true, minArgs: 1, maxArgs: 1, sideEffects: ['elementText'] },
  { name: 'countElement', aliases: [], desc: 'Store XPath match count in elementCount', pageOnly: true, minArgs: 1, maxArgs: 1, sideEffects: ['elementCount'] },
  { name: 'click', aliases: [], desc: 'Click element by XPath', pageOnly: true, minArgs: 1, maxArgs: 1 },
  { name: 'typeText', aliases: ['type'], desc: 'Type text into element', pageOnly: true, minArgs: 2, maxArgs: Infinity },
  { name: 'pasteText', aliases: [], desc: 'Paste text via clipboard', pageOnly: true, minArgs: 2, maxArgs: Infinity },
  { name: 'moveMouse', aliases: [], desc: 'Move mouse to XPath element', pageOnly: true, minArgs: 1, maxArgs: 1 },
  { name: 'scroll', aliases: [], desc: 'Scroll page by pixels', pageOnly: true, minArgs: 0, maxArgs: 1 },
  { name: 'js', aliases: ['executeJs', 'executeJS'], desc: 'Execute JavaScript and store result in jsResult', pageOnly: true, minArgs: 1, maxArgs: 1, sideEffects: ['jsResult'] },
  { name: 'fileUpload', aliases: [], desc: 'Upload file into input[type=file] XPath when supported', pageOnly: true, minArgs: 2, maxArgs: 2 },
  { name: 'info', aliases: [], desc: 'Log page title and URL', pageOnly: true, minArgs: 0, maxArgs: 0 },
  { name: 'httpRequest', aliases: [], desc: 'Run HTTP request and store httpStatus/httpHeaders/httpBody/httpUrl', minArgs: 2, maxArgs: 5, sideEffects: ['httpStatus', 'httpHeaders', 'httpBody', 'httpUrl'] },
  { name: 'httpDownload', aliases: [], desc: 'Download URL to file and store downloadPath/downloadBytes', minArgs: 2, maxArgs: 2, sideEffects: ['downloadPath', 'downloadBytes'] },
  { name: 'fileWriteAllText', aliases: [], desc: 'Overwrite a text file', minArgs: 2, maxArgs: 2 },
  { name: 'fileAppendText', aliases: [], desc: 'Append text to a file', minArgs: 2, maxArgs: 2 },
  { name: 'sendKey', aliases: [], desc: 'Send keyboard key(s), multiple keys = chord', pageOnly: true, minArgs: 1, maxArgs: Infinity },
  { name: 'exit', aliases: [], desc: 'Stop the flow script successfully', minArgs: 0, maxArgs: 1 },
  { name: 'writeExcel', aliases: [], desc: 'Write a value to an Excel cell', minArgs: 4, maxArgs: 4 },
  { name: 'delay', aliases: ['sleep'], desc: 'Sleep N ms (or N-M for random range)', minArgs: 1, maxArgs: 2 },
  { name: 'log', aliases: [], desc: 'Log message', minArgs: 1, maxArgs: Infinity },
  { name: 'help', aliases: [], desc: 'Show available commands', minArgs: 0, maxArgs: 0 },
];

export const FLOW_FUNCTION_SPECS: FlowFunctionSpec[] = [
  { name: 'getUrl', aliases: [], desc: 'Return current page URL', pageOnly: true, minArgs: 0, maxArgs: 0 },
  { name: 'httpRequest', aliases: [], desc: 'Run HTTP request and return raw response text', minArgs: 2, maxArgs: 4 },
  { name: 'js', aliases: ['executeJs', 'executeJS'], desc: 'Execute JavaScript and return result', pageOnly: true, minArgs: 1, maxArgs: 1 },
  { name: 'getElementText', aliases: [], desc: 'Return XPath text', pageOnly: true, minArgs: 1, maxArgs: 1 },
  { name: 'getElementAttribute', aliases: [], desc: 'Return XPath attribute', pageOnly: true, minArgs: 2, maxArgs: 2 },
  { name: 'countElement', aliases: [], desc: 'Return XPath match count', pageOnly: true, minArgs: 1, maxArgs: 1 },
  { name: 'hasElement', aliases: ['existsXPath'], desc: 'Check XPath exists', pageOnly: true, minArgs: 1, maxArgs: 1 },
  { name: 'splitText', aliases: [], desc: 'Split text by delimiter and return an array', minArgs: 2, maxArgs: 2 },
  { name: 'contains', aliases: [], desc: 'Check whether one string contains another, or check whether second string is empty when first is empty', minArgs: 2, maxArgs: 2 },
  { name: 'readJson', aliases: [], desc: 'Read JSON value by dotted path', minArgs: 1, maxArgs: 2 },
  { name: 'randomNum', aliases: [], desc: 'Return random integer between min and max', minArgs: 2, maxArgs: 2 },
  { name: 'fileExist', aliases: [], desc: 'Check file exists', minArgs: 1, maxArgs: 1 },
  { name: 'folderExist', aliases: [], desc: 'Check folder exists', minArgs: 1, maxArgs: 1 },
  { name: 'getFiles', aliases: [], desc: 'List files in folder (non-recursive, returns full paths)', minArgs: 1, maxArgs: 1 },
  { name: 'arrayLength', aliases: [], desc: 'Return array length', minArgs: 1, maxArgs: 1 },
  { name: 'readExcel', aliases: [], desc: 'Read value from Excel cell by header and row', minArgs: 3, maxArgs: 3 },
  { name: 'findRow', aliases: [], desc: 'Search text in Excel, return first matching row index (0-based) or null', minArgs: 2, maxArgs: 2 },
  { name: 'fileReadAllText', aliases: [], desc: 'Read entire text file', minArgs: 1, maxArgs: 1 },
  { name: '2FA', aliases: [], desc: 'Fetch TOTP token from https://2fa.live', minArgs: 1, maxArgs: 1 },
];

function indexByName<T extends { name: string; aliases: string[] }>(items: T[]): Map<string, T> {
  const map = new Map<string, T>();
  for (const item of items) {
    map.set(item.name.toLowerCase(), item);
    for (const alias of item.aliases) map.set(alias.toLowerCase(), item);
  }
  return map;
}

export const FLOW_COMMAND_SPEC_MAP = indexByName(FLOW_COMMAND_SPECS);
export const FLOW_FUNCTION_SPEC_MAP = indexByName(FLOW_FUNCTION_SPECS);

export function normalizeFlowCommandName(name: string): string {
  return FLOW_COMMAND_SPEC_MAP.get(name.toLowerCase())?.name ?? name;
}

export function normalizeFlowFunctionName(name: string): string {
  return FLOW_FUNCTION_SPEC_MAP.get(name.toLowerCase())?.name ?? name;
}

export function getFlowCommandSpec(name: string): FlowCommandSpec | undefined {
  return FLOW_COMMAND_SPEC_MAP.get(name.toLowerCase());
}

export function getFlowFunctionSpec(name: string): FlowFunctionSpec | undefined {
  return FLOW_FUNCTION_SPEC_MAP.get(name.toLowerCase());
}
