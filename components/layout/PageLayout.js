import Head from 'next/head';
import Sidebar from './Sidebar';
import Header from './Header';

// Why created: shared layout wrapper extracted to avoid duplicating the Sidebar + Header
// shell across every page (spec Â§5 â no code duplication, reusable PageLayout wrapper).
// Each page just wraps its content in <PageLayout title="..."> and gets the full chrome.

export default function PageLayout({ title, children }) {
  return (
    <>
      <Head>
        <title>{title ? `${title} â MedAgent` : 'MedAgent â AI Post-Surgery Monitoring'}</title>
        <meta name="description" content="AI-powered post-surgery patient monitoring dashboard" />
      </Head>

      <div className="flex h-screen overflow-hidden bg-bg-base">
        <Sidebar />

        <div className="flex-1 flex flex-col ml-64 overflow-hidden">
          <Header />

          <main className="flex-1 overflow-y-auto pt-16">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
