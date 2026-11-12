/**
 * Translations for the static parts of the public site: navigation, buttons,
 * footer and the homepage's fixed sections. English is the source text and lives
 * next to each <T> in the code, so it is not repeated here.
 *
 * CMS-managed content (hero, call-to-action band, products, articles) comes from
 * Supabase and stays in the language it was written in.
 *
 * Have a native speaker review these before relying on them for formal material.
 */
export const LANGUAGES = [
  { code: 'en', short: 'EN', native: 'English' },
  { code: 'sw', short: 'SW', native: 'Kiswahili' },
  { code: 'fr', short: 'FR', native: 'Français' },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]['code'];

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

type Dictionary = Record<string, string>;

export const MESSAGES: Record<Exclude<LanguageCode, 'en'>, Dictionary> = {
  sw: {
    'nav.solutions': 'Suluhisho',
    'nav.products': 'Bidhaa',
    'nav.about': 'Kuhusu sisi',
    'nav.insights': 'Makala',
    'nav.contact': 'Wasiliana nasi',
    'cta.talk': 'Ongea na Softronics',
    'footer.company': 'Kampuni',
    'footer.work': 'Kazi',
    'footer.legal': 'Sheria',
    'footer.privacy': 'Faragha',
    'footer.terms': 'Masharti',
    'footer.email': 'Barua pepe',
    'footer.basedIn': 'Mahali tulipo',
    'footer.rights': 'Haki zote zimehifadhiwa.',
    'lang.label': 'Lugha',
    'home.what.eyebrow': 'Tunachofanya',
    'home.what.title': 'Tunachoweza kujenga pamoja nawe.',
    'home.what.lead': 'Kila mradi huanza na tatizo, kwa maneno ya wale wanaolikabili.',
    'cap.01.title': 'Programu Maalum',
    'cap.01.summary':
      'Programu za wavuti na majukwaa ya kidijitali yaliyojengwa kulingana na jinsi shirika lako linavyofanya kazi.',
    'cap.02.title': 'Mifumo ya Biashara',
    'cap.02.summary':
      'Kumbukumbu, hesabu ya bidhaa, ankara na ripoti kwa mashirika yaliyokua kuliko lahajedwali.',
    'cap.03.title': 'Akili Bandia na Otomatiki',
    'cap.03.summary':
      'Kutumia akili bandia na otomatiki za kisasa pale zinapoleta thamani halisi ya vitendo.',
    'home.solutions.all': 'Tazama suluhisho zote',
    'home.products.eyebrow': 'Bidhaa',
    'home.products.title': 'Tunachotengeneza.',
    'home.products.lead': 'Programu zilizojengwa kwa mashirika ya Afrika na watu wanaozitegemea.',
    'home.products.all': 'Tazama bidhaa zote',
    'home.why.eyebrow': 'Kwa nini Softronics',
    'home.why.title': 'Matatizo halisi kwanza. Imejengwa kwa mazingira halisi.',
    'home.why.lead':
      'Mifumo lazima ifanye kazi kwenye simu, mitandao na njia za malipo ambazo watu wanatumia kweli.',
    'home.why.link': 'Jinsi tunavyofanya kazi',
    'home.writing': 'Makala za hivi karibuni',
    'home.writing.all': 'Makala zote',
  },
  fr: {
    'nav.solutions': 'Solutions',
    'nav.products': 'Produits',
    'nav.about': 'À propos',
    'nav.insights': 'Articles',
    'nav.contact': 'Contact',
    'cta.talk': 'Parler à Softronics',
    'footer.company': 'Entreprise',
    'footer.work': 'Réalisations',
    'footer.legal': 'Mentions légales',
    'footer.privacy': 'Confidentialité',
    'footer.terms': 'Conditions',
    'footer.email': 'E-mail',
    'footer.basedIn': 'Basé à',
    'footer.rights': 'Tous droits réservés.',
    'lang.label': 'Langue',
    'home.what.eyebrow': 'Ce que nous faisons',
    'home.what.title': 'Ce que nous pouvons construire avec vous.',
    'home.what.lead':
      'Chaque mission commence par le problème, dans les mots de ceux qui le vivent.',
    'cap.01.title': 'Logiciels sur mesure',
    'cap.01.summary':
      'Applications web et plateformes numériques conçues autour de la façon dont votre organisation travaille réellement.',
    'cap.02.title': "Systèmes d'entreprise",
    'cap.02.summary':
      'Dossiers, stocks, facturation et rapports pour les organisations qui ont dépassé les tableurs.',
    'cap.03.title': 'IA et automatisation',
    'cap.03.summary':
      "Recourir à l'IA et à l'automatisation modernes là où elles apportent une réelle valeur pratique.",
    'home.solutions.all': 'Voir toutes les solutions',
    'home.products.eyebrow': 'Produits',
    'home.products.title': 'Ce que nous créons.',
    'home.products.lead':
      'Des logiciels conçus pour les organisations africaines et les personnes qui en dépendent.',
    'home.products.all': 'Voir tous les produits',
    'home.why.eyebrow': 'Pourquoi Softronics',
    'home.why.title': "D'abord les vrais problèmes. Conçu pour les conditions réelles.",
    'home.why.lead':
      'Les systèmes doivent fonctionner sur les téléphones, réseaux et moyens de paiement que les gens utilisent vraiment.',
    'home.why.link': 'Notre façon de travailler',
    'home.writing': 'Articles récents',
    'home.writing.all': 'Tous les articles',
  },
};
