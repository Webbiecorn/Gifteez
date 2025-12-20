## 2025-12-20 - Tooltip Accessibility for Keyboard Users
**Learning:** Tooltips implemented with Tailwind CSS's `group-hover:block` utility are inaccessible to keyboard-only users. The tooltip will not appear when the element is focused via the Tab key.
**Action:** To ensure accessibility, always add the `group-focus-within:block` utility alongside `group-hover:block`. This ensures the tooltip is displayed on both mouse hover and keyboard focus, providing a consistent experience for all users.
