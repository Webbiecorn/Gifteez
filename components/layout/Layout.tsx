import React, { useEffect } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title, description }) => {
  useEffect(() => {
    if (title) document.title = title;
    if (description) {
      let meta = document.head.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', description);
    }
  }, [title, description]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-accent text-white px-4 py-2 rounded-lg shadow-lg"
      >
        Skip to content
      </a>
      <main id="main" className="outline-none focus:outline-none">
        {children}
      </main>
    </>
  );
};

export default Layout;
