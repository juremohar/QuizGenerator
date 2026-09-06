import type { Metadata } from 'next';

import { LiteraturaTabs } from '@/components/literatura/LiteraturaTabs';

export const metadata: Metadata = { title: 'Literatura – Gasilski kviz' };

export default function LiteraturaPage() {
  return <LiteraturaTabs />;
}
