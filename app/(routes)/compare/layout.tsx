// RSC — React Server Component. No client-side JavaScript.
import type { Metadata } from 'next';

const TITLE = 'Compare Tech Salaries Side-by-Side | TalentDash';
const DESCRIPTION =
  'Compare two salary records from any company side-by-side. See base salary, stock, bonus, and total compensation differences instantly.';
const CANONICAL = 'https://talentdash.com/compare';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: CANONICAL,
    siteName: 'TalentDash',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
  alternates: {
    canonical: CANONICAL,
  },
};

export default function CompareLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return <>{children}</>;
}
