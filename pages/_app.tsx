import type { AppProps } from 'next/app';
import '../styles/serp.css';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

