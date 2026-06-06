// RSC — React Server Component. No client-side JavaScript.
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Submit a Salary — Contribute Anonymously | TalentDash',
  description:
    'Share your compensation anonymously to help others make informed career decisions. All submissions are reviewed before publishing.',
};

export default function SubmitLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return <>{children}</>;
}
