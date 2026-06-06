// RSC — React Server Component. No client-side JavaScript.
import type { Metadata } from 'next';

const TITLE = 'Salary & Tax Calculator — Monthly In-Hand Pay | TalentDash';
const DESCRIPTION =
  'Calculate your exact monthly in-hand salary from Annual CTC. Supports New Tax Regime (2024–25) and Old Tax Regime with HRA, 80C, and standard deductions.';
const CANONICAL = 'https://talentdash.com/tools/salary-calculator';

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

export default function SalaryCalculatorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return <>{children}</>;
}
