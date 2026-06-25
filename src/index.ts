// Core
export { DonutApiClient } from './donut/api-client.js';
export { BidiClient } from './bidi/bidi-client.js';

// Runtime (for user scripts)
export type { AutomationContext, InputValue } from './runtime/types.js';
export { PageAutomation } from './runtime/page-automation.js';
export { PlaywrightPageAutomation } from './runtime/playwright-page-automation.js';
export type { BrowserPageAutomation, HumanTypingOptions } from './runtime/page-automation-types.js';
export { runGscriptWorkflow, type GscriptRunnerOptions } from './runtime/gscript/runner.js';

// Types re-export
export type { ApiProfile, RunProfileResponse } from './donut/api-types.js';
export type { InteractiveElementsResult, ButtonInfo } from './automation/interactive-elements.js';
