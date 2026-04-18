// frontend/pages/_app.js
// Custom Next.js App component — the single place we import global CSS.
// Every page gets rendered inside this component.

import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
