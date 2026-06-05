// RSC — React Server Component. No client-side JavaScript.
import { redirect } from 'next/navigation';

export default function Home(): never {
  redirect('/salaries');
}
