import type { WorkflowContext } from '../src/runtime/types.js';

export default async function threads(ctx: WorkflowContext) {
  ctx.log('Navigating to https://www.threads.com/ ...');
  await ctx.page.goto('https://www.threads.com/');
  await ctx.page.waitForLoad();
  ctx.log('Page loaded. Waiting 5s for content to render...');
  await ctx.sleep(5000);

  const info = await ctx.page.info();
  const interactive = await ctx.page.countInteractiveElements();

  ctx.log(`URL: ${info.url}`);
  ctx.log(`Title: ${info.title}`);
  ctx.log(`Interactive elements: total=${interactive.total}, visible=${interactive.visible}`);

  for (const [tag, count] of Object.entries(interactive.byTag).sort(([a], [b]) => a.localeCompare(b))) {
    ctx.log(`  ${tag}: ${count}`);
  }

  ctx.log(`Buttons/Links (${interactive.buttons.length}):`);
  for (const [i, btn] of interactive.buttons.entries()) {
    const label = btn.text || btn.ariaLabel || btn.href || '(no text)';
    ctx.log(`  [${i + 1}] <${btn.tag}> ${label.substring(0, 80)}`);
  }
}
