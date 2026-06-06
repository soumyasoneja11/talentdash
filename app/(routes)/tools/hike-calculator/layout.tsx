// RSC — React Server Component. No client-side JavaScript.
import type { Metadata } from 'next';

const TITLE = 'Salary Hike Calculator — Estimate Your New Salary & Hike % | TalentDash';
const DESCRIPTION =
  'Calculate your salary hike percentage to new CTC, or derive your hike percentage from a target new salary. Compare against Indian tech industry benchmarks.';
const CANONICAL = 'https://talentdash.com/tools/hike-calculator';

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

export default function HikeCalculatorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return <>{children}</>;
}
