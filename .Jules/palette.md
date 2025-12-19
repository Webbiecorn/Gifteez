## 2024-05-22 - Use aria-label for Icon Buttons

**Learning:** The application was using the `title` attribute for tooltips on icon-only buttons. While this provides a tooltip on hover, it's not reliably announced by all screen readers. The `aria-label` attribute is the more robust and accessible solution for providing a name to interactive elements that don't have visible text.

**Action:** In the future, always use `aria-label` for icon-only buttons to ensure they are properly announced by screen readers. For components that need both a visible tooltip and an accessible name, a combination of `aria-label` and a custom tooltip implementation (if the design system supports it) is necessary. Also, I've noted that the application's startup time is extremely slow, making Playwright tests difficult to run. This is a separate issue to be aware of.
