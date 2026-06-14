import { BidiClient } from '../bidi/bidi-client.js';
import { countInteractiveElementsExpression, type InteractiveElementsResult } from './interactive-elements.js';
import { logger } from '../utils/logger.js';
import { sleep } from '../utils/retry.js';

export type ThreadsTaskOptions = {
  wsUrl: string;
  connectTimeoutMs: number;
  commandTimeoutMs: number;
};

export type ThreadsTaskResult = {
  title: string;
  url: string;
  interactiveElements: InteractiveElementsResult;
};

const waitForLoadExpression = `(() => {
  return new Promise((resolve) => {
    const check = () => {
      if (document.readyState === 'complete') {
        resolve(true);
        return;
      }
      setTimeout(check, 200);
    };
    check();
  });
})()`;

const getPageInfoExpression = `JSON.stringify({ title: document.title, url: location.href })`;

export async function runThreadsTask(options: ThreadsTaskOptions): Promise<ThreadsTaskResult> {
  const client = new BidiClient(options.connectTimeoutMs, options.commandTimeoutMs);
  await client.connect(options.wsUrl);

  try {
    await client.newSession();
    const tree = await client.getTree();
    const contextId = tree.contexts[0]?.context;
    if (!contextId) {
      throw new Error('No browsing context returned by BiDi.');
    }

    // Step 3: Navigate to threads.com
    logger.info('Navigating to https://www.threads.com/ ...');
    await client.navigate(contextId, 'https://www.threads.com/');

    // Wait for page load (poll document.readyState === 'complete')
    logger.info('Waiting for page load...');
    await client.evaluate(contextId, waitForLoadExpression);

    // Delay 5s after page loaded
    logger.info('Page loaded. Waiting 5s for content to render...');
    await sleep(5000);

    // Step 4: Get page info + count interactive elements
    const pageInfoStr = String(await client.evaluate(contextId, getPageInfoExpression));
    const pageInfo = JSON.parse(pageInfoStr) as { title: string; url: string };
    const interactiveElements = await client.evaluate(contextId, countInteractiveElementsExpression) as InteractiveElementsResult;

    return {
      title: pageInfo.title,
      url: pageInfo.url,
      interactiveElements,
    };
  } finally {
    await client.close();
  }
}
