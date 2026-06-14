export type InteractiveElementsResult = {
  total: number;
  visible: number;
  byTag: Record<string, number>;
  buttons: ButtonInfo[];
};

export type ButtonInfo = {
  tag: string;
  text: string;
  ariaLabel: string;
  role: string;
  type: string;
  href: string;
  classes: string;
};

export const countInteractiveElementsExpression = `(() => {
  const selectors = ['a','button','input','textarea','select','[role=button]','[role=link]','[tabindex]:not([tabindex="-1"])'];
  const elements = Array.from(document.querySelectorAll(selectors.join(',')));
  const visible = elements.filter((el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none';
  });
  return {
    total: elements.length,
    visible: visible.length,
    byTag: visible.reduce((acc, el) => {
      const key = el.tagName.toLowerCase();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {}),
    buttons: visible.map((el) => ({
      tag: el.tagName.toLowerCase(),
      text: (el.textContent || '').trim().substring(0, 120),
      ariaLabel: el.getAttribute('aria-label') || '',
      role: el.getAttribute('role') || '',
      type: el.getAttribute('type') || '',
      href: el.getAttribute('href') || '',
      classes: el.className || '',
    })),
  };
})()`;
