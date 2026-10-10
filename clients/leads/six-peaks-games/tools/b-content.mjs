// Direction B: Press Start. Site content used by the page.
// Every string wrapped in V() is verbatim from research/site-content.md or research/games/*.md;
// tools/b-build.mjs checks each one against those files and fails loudly on a mismatch.
// Strings not wrapped in V() are UI labels (navigation, controls), not claims.
// Edits made for house law are listed in EDITS and in direction-b-press-start/README.md.

export const VERBATIM = [];
const V = (s) => { VERBATIM.push(s); return s; };

// Copy edits forced by house law (no spaced en dash; no buzzwords outside quotes).
export const EDITS = [
  { where: 'Pull quote (Dani Allum)', from: 'development teams – they never felt', to: 'development teams: they never felt', why: 'house law: no spaced en dashes' },
  { where: 'Pillar: Technically Excellent', from: 'strengthened by AAA leadership, ongoing training, and best-in-class tech.', to: 'strengthened by AAA leadership and ongoing training.', why: 'house law: "best-in-class" outside a quote' },
  { where: 'Stat label', from: 'IS0 27001 Security Compliance', to: 'ISO 27001 security adherence', why: 'site typo (zero) and claim measured as adherence (BRIEF)' },
];

export const site = {
  title: 'Six Peaks Games · Game QA Studio',
  eyebrow: 'Game QA Studio · Embedded Game Testing',
  hero: {
    h1: 'Beyond standard QA.',
    // Direction B spec line, assembled from site facts (embedded approach; console, mobile and PC; George; Western Europe time zone).
    sub: 'Embedded test teams for PC, console and mobile games, from George, South Africa, on Western Europe’s working hours.',
    siteSub: V('We live and breathe your games with you.'),
  },
  offer: {
    lead: V('Six Peaks Games provides rigorous, expert QA to publishers and developers worldwide.'),
    beyond: V('We go beyond standard QA by bringing care, consistency, and a true partnership mindset to every project, no matter the size.'),
    embedded: V('Our embedded approach lets us learn your game inside out, building trust through smarter testing, faster iteration, and in-house consistency with the efficiency of an external partner.'),
    retention: V('Our high client retention rate is a clear reflection of the quality we deliver.'),
  },
  pillars: [
    { t: V('Technically Excellent'), b: 'A team of well-educated gamers from an exceptional local talent pool are strengthened by AAA leadership and ongoing training.' },
    { t: V('Competitively Priced'), b: V('South African value aligned to Western expectations means you can stretch your QA budget further without sacrificing quality.') },
    { t: V('Native English Speaking'), b: V('Clear, nuanced communication speeds up alignment and smoothes delivery while ensuring a good understanding of tone, behaviour, and intent.') },
    { t: V('Western Europe Time Zone'), b: V('Based in South Africa, we support clients worldwide, with natural time zone overlap for easier daily collaboration with game teams in Western Europe.') },
    { t: V('Culturally Aligned'), b: V('Technicians that are lifelong gamers, heavily shaped by Western entertainment, bring shared context and strong player awareness to their testing.') },
    { t: V('Consistent Dedicated Teams'), b: V('The same technicians stay on your project from start to finish with no mid-project swap-outs ensuring deep, retained knowledge and consistent communication.') },
  ],
  pullQuote: {
    q: 'What set them apart was their ability to truly integrate with our development teams: they never felt like an external vendor, but rather like an extension of our own staff.',
    name: 'Dani Allum', role: 'Lead Producer', studio: 'The Powell Group/Humble Games', partner: 'powell-group',
  },
  // key: matches categories in research/games.json servicesProvided (see b-build.mjs SERVICE_MATCH)
  services: [
    { key: 'functional', icon: 'pad', name: V('Functional QA'), d: V('Testing all functional aspects of your game, including core gameplay systems, UI, progression, saves, integrations, and edge cases, to ensure stable, polished, and release-ready builds throughout development.') },
    { key: 'compliance', icon: 'shield', name: V('Compliance QA'), d: V('Validating platform-holder requirements, including TRCs, TCRs, and Lotchecks standards, across console and storefront submissions, reducing certification risk and preventing costly resubmissions.') },
    { key: 'loc', icon: 'globe', name: V('Functional Localisation QA'), d: V('Testing the functional implementation of localised content, ensuring text displays correctly, fits within UI constraints, renders properly, and follows regional formatting standards without technical defects.') },
    { key: 'bugs', icon: 'clip', name: V('Bug Reporting & Environment Management'), d: V('Providing clear, reproducible bugs with strong evidence and prioritisation, while keeping test environments, builds, accounts, and permissions organised for smooth delivery.') },
    { key: 'cases', icon: 'list', name: V('Test Case Management'), d: V('Designing and maintaining structured test suites to ensure consistent coverage across features, platforms, and releases, helping teams track progress and reduce regression risk.') },
    { key: 'usability', icon: 'cursor', name: V('Usability Testing'), d: V('Evaluating gameplay flow, readability, onboarding, accessibility considerations, and UI clarity to identify friction points and improve the overall player experience.') },
    { key: 'performance', icon: 'gauge', name: V('Performance Testing'), d: V('Identifying crashes, frame rate instability, memory and load issues, and other stability risks, validating smooth performance across consoles, mobile devices, and representative PC configurations.') },
    { key: 'rc', icon: 'flag', name: V('Release Candidate Oversight'), d: V('Running final pass validation, regression checks, and sign-off support on your RC builds to confirm launch readiness and minimise day-one issues.') },
  ],
  // Partner order as on the site. logo: file stem under assets/web/partners/ (resolved in b-build.mjs).
  partners: [
    { id: 'humble-games', name: 'Humble Games' },
    { id: 'auroch-digital', name: 'Auroch Digital' },
    { id: 'impossible-home', name: 'Impossible Home' },
    { id: 'thunderful', name: 'Thunderful' },
    { id: 'supercell', name: 'Supercell' },
    { id: 'powell-group', name: 'The Powell Group' },
    { id: 'firestoke', name: 'Firestoke' },
    { id: 'balor-games', name: 'Balor Games' },
    { id: 'torpor-games', name: 'Torpor Games' },
    { id: 'hardball', name: 'Hardball' },
    { id: 'playtonic-friends', name: 'Playtonic Friends' },
    { id: 'microids', name: 'Microids' },
    { id: 'silver-lining', name: 'Silver Lining Interactive' },
    { id: 'chuhai-labs', name: 'Chuhai Labs' },
    { id: 'bossa-games', name: 'Bossa Games' },
  ],
  reviews: [
    { partner: 'bossa-games', name: 'Anthony Kyne', role: 'Head of Studio', studio: 'Bossa Games', q: V('The Six Peaks team integrated well into our team and never felt like a separate entity. From start to finish they owned the QA process for us, were both super professional, enthusiastic and also fed back like genuine players of the game. Having them on board made the game better.') },
    { partner: 'hardball', name: 'Dylan Harfoot', role: 'QA Manager', studio: 'Hardball Games', q: V('Six Peaks showed a degree of technical expertise that is hard to find in external QA vendors. They quickly became a core part of our QA operations and could be relied on not just to hunt bugs, but critically also be arbiters of game quality, healthy development processes, integration with production, and build and release management.') },
    { partner: 'playtonic-friends', name: 'Liam Wales', role: 'Publishing Producer', studio: 'Playtonic', q: V('Responsiveness and enthusiasm has encapsulated the Six Peaks experience from first contact to final delivery. I highly recommend them as an outsourcing partner for your titles!') },
    { partner: 'thunderful', name: 'Dean Scott', role: 'Senior External Producer', studio: 'Thunderful', q: V('Six Peaks were enthusiastic and knowledgeable from day one, working to a reliably high standard. Timezone alignment is a bonus, and English as a first language means nuanced instructions are understood first time.') },
    { partner: 'silver-lining', name: 'Daniel Fraser', role: 'Producer', studio: 'Silver Lining Interactive', q: V('The team at Six Peaks provided professional, thorough QA services for Service with a Shotgun. They were highly knowledgeable, finding critical bugs we would have missed and helping to significantly improve the final product’s quality. Working with them was seamless, with clear communication and detailed reports delivered on time.') },
    { partner: 'chuhai-labs', name: 'Zach Aikman', role: 'Technical Director', studio: 'Chuhai Labs', q: V('The entire QA team at Six Peaks quickly became an invaluable extension of the Wild Blue Skies development team, and it’s hard to imagine the project’s success without their involvement. Their contributions consistently exceeded expectations. Six Peaks set a new benchmark for what we look for in a quality assurance partner.') },
    { partner: 'powell-group', name: 'Dani Allum', role: 'Lead Producer', studio: 'The Powell Group/Humble Games', q: V('Six Peaks Games professional, English-speaking teams are committed to excellence, consistently elevating our projects with their keen attention to detail and dedication. They have far exceeded our expectations in every regard.') },
    { partner: 'hardball', name: 'Jason Avent', role: 'CEO', studio: 'Hardball Games', q: V('Working with Six Peaks is just like adding more members to your internal team. They integrated seamlessly with us at Hardball and were consistently excellent in every discipline.') },
    { partner: 'firestoke', name: 'Calum Watson', role: 'Technical Production Manager', studio: 'Firestoke Games', q: V('Partnering with Six Peaks Games for QA on ‘It’s Only Money’ was instrumental in our success. Their attention to detail and commitment to quality significantly enhanced our project, ensuring a flawless final product.') },
  ],
  stats: [
    { v: '99%', n: 99, suffix: '%', label: 'Staff retention', b: V('Our high staff retention provides stability, continuity, retained knowledge and consistency for your project and over the long term.') },
    { v: '100%', n: 100, suffix: '%', label: 'In-office staff', b: V('A tight-knit team culture, close collaboration and strong work ethic, means you get a consistent standard of quality backed by clear oversight and secure processes.') },
    { v: '1–20+', label: 'Team sizes', b: V('Whether you need one tester or 20+, short-term or long-term, Six Peaks scales to fit. We’re small enough to care, big enough to deliver.') },
    { v: 'ISO 27001', label: 'Security adherence', b: V('Adherence to this benchmark ensures your builds, data, and access are protected by proven security processes and clear accountability.') },
  ],
  squad: {
    line: V('Whether you need one tester or 20+, short-term or long-term, Six Peaks scales to fit.'),
    lead: V('Each project is supported by a dedicated QA Lead, overseen by our in-studio QA Manager to maintain quality, communication, and alignment across every engagement.'),
  },
  crew: {
    body: [
      V('Based in George in the Western Cape, we’re a proudly South African QA Team with a global perspective.'),
      V('Our team blends lifelong gamers, competitive players, and seasoned testers across every genre and platform.'),
      V('With a broad mix of backgrounds, playstyles, and perspectives, we bring well-rounded insight to every project.'),
    ],
    aaa: V('Six Peaks Games is led by an experienced team with roots in global AAA studios including Eidos Interactive, Disney Interactive and Black Rock Studios, and a proven track record of creating successful, high-quality game franchises.'),
    team: [
      { name: 'Jason Ried', role: 'Founder & CEO', photo: 'headshot-jason-ried', li: 'https://www.linkedin.com/in/jasonried/' },
      { name: 'Jason Avent', role: 'Founder & Non-Exec Director', photo: 'headshot-jason-avent', li: 'https://www.linkedin.com/in/jason-avent-171898/' },
      { name: 'Louise Ried', role: 'Business Development Director', photo: 'headshot-louise-ried', li: 'https://www.linkedin.com/in/louise-ried-six-peaks/' },
      { name: 'Callan Schroder', role: 'QA Manager', photo: 'headshot-callan-schroder', li: 'https://www.linkedin.com/in/callan-schroder-17a260222/' },
    ],
  },
  careers: {
    body: [
      V('We’re always looking for exceptional people to join our team and help us deliver outstanding testing services for game developers and publishers worldwide across console, mobile and PC platforms.'),
      V('If you have a passion for gaming and an eye for quality, we’d love to hear from you. Experience in game and software testing is beneficial but not required.'),
    ],
    url: 'https://wkf.ms/4s5yyRp',
  },
  projectsIntro: [
    V('We have supported titles across a diverse range of genres, platforms, and audiences, from narrative adventures to open-world multiplayer experiences.'),
    V('We ramp up fast, spot the right risks early, and test within the context that matters so you can be confident that your game is in experienced hands.'),
  ],
  contact: {
    intro: V('If you’re looking for a QA partner that will go beyond standard QA, delivering high-quality, rigorous testing as an extension of your team, then please get in touch! We’d love to discuss how we can support your game!'),
    office: V('Joubert Plaza 2, Office 24, Corner of Meade and Market, George'),
    phone: '+27 83 244 8880',
    phoneHref: 'tel:+27832448880',
    email: 'contact@sixpeaks.games',
    reasons: ['I’d like to discuss a project', 'I’d like to book a free trial', 'I’d like more information', 'Other reason'],
    submit: 'Submit Your Request',
    linkedin: 'https://www.linkedin.com/company/six-peaks-games/',
  },
  platforms: ['Xbox', 'PlayStation', 'Nintendo', 'Epic', 'Steam', 'Windows', 'Meta', 'Apple', 'Android'],
  underwayLine: 'Project underway, further details on release.',
};

// Hero rotation: six released titles whose 2.4:1 key art leaves a calm zone right of the copy column
// (chosen from a simulated 1440x846 crop of all 13 shipped keys; OutRage and Wild Blue Skies were dropped:
// faces and characters fill both calm zones, so checkpoints would cover them).
// cps: checkpoint positions as fractions of the KEY ART image (x, y) on calm areas, never on faces or logos.
// s: preferred chip side ('r' = chip right of the reticle, 'l' = left). pos/mpos: object-position desktop/mobile.
export const heroes = [
  { slug: 'lost-skies', pos: '50% 50%', mpos: '46% 50%', cps: [{ x: 0.56, y: 0.22, s: 'r' }, { x: 0.68, y: 0.37, s: 'l' }, { x: 0.60, y: 0.50, s: 'r' }] },
  { slug: 'god-breakers', pos: '50% 50%', mpos: '40% 50%', cps: [{ x: 0.66, y: 0.19, s: 'r' }, { x: 0.785, y: 0.34, s: 'l' }, { x: 0.785, y: 0.48, s: 'l' }] },
  { slug: 'suzerain', pos: '50% 50%', mpos: '46% 50%', cps: [{ x: 0.585, y: 0.24, s: 'r' }, { x: 0.63, y: 0.38, s: 'r' }, { x: 0.60, y: 0.50, s: 'r' }] },
  { slug: 'whimel-academy', pos: '50% 50%', mpos: '50% 50%', cps: [{ x: 0.56, y: 0.30, s: 'r' }, { x: 0.74, y: 0.44, s: 'l' }, { x: 0.605, y: 0.58, s: 'l' }] },
  { slug: 'lil-gator', pos: '50% 50%', mpos: '82% 50%', cps: [{ x: 0.665, y: 0.20, s: 'l' }, { x: 0.64, y: 0.34, s: 'l' }, { x: 0.66, y: 0.50, s: 'l' }] },
  { slug: 'town-of-zoz', pos: '50% 50%', mpos: '60% 50%', cps: [{ x: 0.52, y: 0.20, s: 'r' }, { x: 0.72, y: 0.34, s: 'l' }, { x: 0.55, y: 0.48, s: 'r' }] },
];
