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
    <main id="main-content" className="outline-none focus:outline-none" tabIndex={-1}>
      {children}
    </main>
  );
};

export default Layout;
