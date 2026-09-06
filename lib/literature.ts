import type { Kategorija } from './quiz/config';

export interface LiteratureFile {
  readonly name: string;
  readonly href: string;
  readonly kategorija: Kategorija;
}

/** Was webpack `require('../../assets/literature/<path>')`; now plain public/ paths. */
export const LITERATURA: readonly LiteratureFile[] = [
  { name: 'Drži - ne drži', href: '/literatura/pionirji/drzi-nedrzi.pdf', kategorija: 'pionirji' },
  { name: 'Prva pomoč', href: '/literatura/pionirji/prva-pomoc.pdf', kategorija: 'pionirji' },
  { name: 'Zgodovina', href: '/literatura/pionirji/zgodovina.pdf', kategorija: 'pionirji' },
  { name: 'Oznake in veščine', href: '/literatura/pionirji/oznake-vescine.pdf', kategorija: 'pionirji' },

  { name: 'Drži - ne drži', href: '/literatura/mladinci/drzi-nedrzi.pdf', kategorija: 'mladinci' },
  { name: 'Prva pomoč', href: '/literatura/mladinci/prva-pomoc.pdf', kategorija: 'mladinci' },
  { name: 'Zgodovina', href: '/literatura/mladinci/zgodovina.pdf', kategorija: 'mladinci' },
  { name: 'Oznake in veščine', href: '/literatura/mladinci/oznake-vescine.pdf', kategorija: 'mladinci' },
  { name: 'Čini', href: '/literatura/mladinci/cini.pdf', kategorija: 'mladinci' },

  { name: 'Drži - ne drži', href: '/literatura/pripravniki/drzi-nedrzi.pdf', kategorija: 'pripravniki' },
  { name: 'Prva pomoč', href: '/literatura/pripravniki/prva-pomoc.pdf', kategorija: 'pripravniki' },
  { name: 'Zgodovina', href: '/literatura/pripravniki/zgodovina.pdf', kategorija: 'pripravniki' },
  { name: 'Oznake in veščine', href: '/literatura/pripravniki/oznake-vescine.pdf', kategorija: 'pripravniki' },
  { name: 'Čini', href: '/literatura/pripravniki/cini.pdf', kategorija: 'pripravniki' },
];

/** Copy preserved verbatim from the original Literature.jsx, including its grammar. */
export const LITERATURA_OPIS: Record<Kategorija, { naslov: string; opis: string }> = {
  pionirji: { naslov: 'Pionirji', opis: 'Seznam literature za pionirje.' },
  mladinci: {
    naslov: 'Mladinci',
    opis: 'Seznam literature za mladince. Mladinci potrebuje znati tudi celotno literaturo od pionirjev.',
  },
  pripravniki: {
    naslov: 'Pripravniki',
    opis: 'Seznam dodatne literature za pripravnike. Pripravniki potrebuje znati tudi celotno literaturo od pionirjev in mladincev.',
  },
};
