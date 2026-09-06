import type { SectionConfig, Starost } from './types';

export const KATEGORIJE = ['pionirji', 'mladinci', 'pripravniki'] as const;
export type Kategorija = (typeof KATEGORIJE)[number];

export interface KategorijaConfig {
  readonly slug: Kategorija;
  readonly naslov: string;
  readonly kartica: string;
  readonly opis: string;
  readonly znacka: string;
  readonly sections: readonly SectionConfig[];
}

const TF_PODNASLOV = 'Spodaj je 10 vprašanj. Ugotovite ali je odgovor na vprašanje pravilen.';
const MC_PODNASLOV = 'Spodaj je 10 vprašanj. Izberite kateri odgovor je pravilen.';

/**
 * `starosti` is a UNION, and that is what fixes the Pripravniki bug.
 *
 * The old Pripravniki.jsx passed Constants.Mladinec to two of its three sections,
 * so pripravniki were served mladinec-age questions. The naive fix - swapping in
 * Constants.Pripravnik - would have shipped an EMPTY "Prva pomoč" section, because
 * data/prva_pomoc.json has zero `pripravnik`-tagged questions (likewise oznake and
 * vescine). The data is otherwise tagged cumulatively (every `pionir` question is
 * also `mladinec`, every `mladinec` question is also `pripravnik` in ves_neves), so
 * those three fields were simply never tagged for pripravnik.
 *
 * Reading pripravnik pools as `['pripravnik', 'mladinec']` repairs the intent without
 * rewriting the brigade's curated question data, and matches what the Literatura page
 * already says out loud: "Pripravniki potrebuje znati tudi celotno literaturo od
 * pionirjev in mladincev."
 */
function sections(starosti: readonly Starost[], tfFields: readonly SectionConfig['fields'][number][]) {
  return [
    {
      id: 'drzi-ne-drzi',
      naslov: 'Drži/ne drži',
      podnaslov: TF_PODNASLOV,
      tip: 'trueFalse',
      starosti,
      fields: tfFields,
      count: 10,
    },
    {
      id: 'prva-pomoc',
      naslov: 'Prva pomoč',
      podnaslov: MC_PODNASLOV,
      tip: 'multipleChoice',
      starosti,
      fields: ['prva_pomoc'],
      count: 10,
    },
    {
      id: 'pozarna-preventiva',
      naslov: 'Požarna preventiva',
      podnaslov: MC_PODNASLOV,
      tip: 'multipleChoice',
      starosti,
      fields: ['ves_neves', 'zgodovina', 'vescine'],
      count: 10,
    },
  ] as const satisfies readonly SectionConfig[];
}

export const KVIZI: Record<Kategorija, KategorijaConfig> = {
  pionirji: {
    slug: 'pionirji',
    naslov: 'Pionirji',
    kartica: 'Pionir',
    opis: 'Kviz za pionirčke.',
    znacka: '/images/oznake/pionir.png',
    sections: sections(['pionir'], ['ves_neves', 'zgodovina', 'vescine']),
  },
  mladinci: {
    slug: 'mladinci',
    naslov: 'Mladinci',
    kartica: 'Mladinec',
    opis: 'Kviz za mladince.',
    znacka: '/images/oznake/mladinec.png',
    sections: sections(['mladinec'], ['ves_neves', 'zgodovina', 'vescine', 'oznake']),
  },
  pripravniki: {
    slug: 'pripravniki',
    naslov: 'Pripravniki',
    kartica: 'Pripravnik',
    opis: 'Kviz za pripravnike.',
    znacka: '/images/oznake/pripravnik.png',
    sections: sections(['pripravnik', 'mladinec'], ['ves_neves', 'zgodovina', 'vescine', 'oznake']),
  },
};

export function isKategorija(value: string): value is Kategorija {
  return (KATEGORIJE as readonly string[]).includes(value);
}
