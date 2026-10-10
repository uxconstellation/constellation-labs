// Direction A2 (Bug Hunt): verbatim content model.
// Every string here traces to research/site-content.md or research/games.json.
// Documented edits (house law): spaced en dash in Dani Allum's pull quote -> colon;
// "best-in-class tech" dropped from Technically Excellent (banned word outside a quote);
// "IS0 27001" typo -> "ISO 27001"; underway status note uses a comma, not a spaced en dash.

export const META = {
  title: 'Six Peaks Games · Game QA Studio · Embedded Game Testing',
  description: 'Six Peaks Games is a game QA studio delivering rigorous testing for publishers and developers worldwide with care and consistency.',
};

export const HERO = {
  h1: 'Beyond standard QA.',
  sub: 'We live and breathe your games with you.',
};

export const OFFER = [
  'Six Peaks Games provides rigorous, expert QA to publishers and developers worldwide.',
  'We go beyond standard QA by bringing care, consistency, and a true partnership mindset to every project, no matter the size.',
  'Our embedded approach lets us learn your game inside out, building trust through smarter testing, faster iteration, and in-house consistency with the efficiency of an external partner.',
  'Our high client retention rate is a clear reflection of the quality we deliver.',
];

// Order = the six peaks, left to right (DIRECTION-A2).
export const PILLARS = [
  { key: 'excellent', title: 'Technically Excellent', text: 'A team of well-educated gamers from an exceptional local talent pool are strengthened by AAA leadership and ongoing training.' },
  { key: 'priced', title: 'Competitively Priced', text: 'South African value aligned to Western expectations means you can stretch your QA budget further without sacrificing quality.' },
  { key: 'english', title: 'Native English Speaking', text: 'Clear, nuanced communication speeds up alignment and smoothes delivery while ensuring a good understanding of tone, behaviour, and intent.' },
  { key: 'timezone', title: 'Western Europe Time Zone', text: 'Based in South Africa, we support clients worldwide, with natural time zone overlap for easier daily collaboration with game teams in Western Europe.' },
  { key: 'culture', title: 'Culturally Aligned', text: 'Technicians that are lifelong gamers, heavily shaped by Western entertainment, bring shared context and strong player awareness to their testing.' },
  { key: 'team', title: 'Consistent Dedicated Teams', text: 'The same technicians stay on your project from start to finish with no mid-project swap-outs ensuring deep, retained knowledge and consistent communication.' },
];

export const PULL_QUOTE = {
  text: 'What set them apart was their ability to truly integrate with our development teams: they never felt like an external vendor, but rather like an extension of our own staff.',
  name: 'Dani Allum', role: 'Lead Producer', studio: 'The Powell Group/Humble Games',
};

// The eight services = the bestiary. Bug names and faults per DIRECTION-A2.
// match: keywords searched in each shipped title's Key Testing Focus (homepage card), then
// the service category on the game page as a fallback.
export const SERVICES = [
  { key: 'functional', name: 'Functional QA',
    text: 'Testing all functional aspects of your game, including core gameplay systems, UI, progression, saves, integrations, and edge cases, to ensure stable, polished, and release-ready builds throughout development.',
    bug: 'Clipper', fault: 'A beetle half sunk through the ground: collision clipping.',
    match: ['Gameplay Systems', 'Core Gameplay', 'Open-World Systems', 'Critical Path'], cats: ['Functional QA'] },
  { key: 'compliance', name: 'Compliance QA',
    text: 'Validating platform-holder requirements, including TRCs, TCRs, and Lotchecks standards, across console and storefront submissions, reducing certification risk and preventing costly resubmissions.',
    bug: 'Wrong Glyph', fault: 'A save sign that shows the wrong platform’s button prompt.',
    match: ['Compliance', 'Certification', 'Console Functionality', 'Steam Deck'], cats: ['Compliance QA'] },
  { key: 'localisation', name: 'Functional Localisation QA',
    text: 'Testing the functional implementation of localised content, ensuring text displays correctly, fits within UI constraints, renders properly, and follows regional formatting standards without technical defects.',
    bug: 'Overflow', fault: 'A German sign whose text runs out of its box.',
    match: [], cats: ['Functional Loc QA', 'Functional Localization QA'] },
  { key: 'reporting', name: 'Bug Reporting & Environment Management',
    text: 'Providing clear, reproducible bugs with strong evidence and prioritisation, while keeping test environments, builds, accounts, and permissions organised for smooth delivery.',
    bug: 'Ghost', fault: 'A bug that only shows every few seconds.',
    match: ['Investigation', 'Save & Build'], cats: ['Bug Reporting & Environment Management'] },
  { key: 'testcase', name: 'Test Case Management',
    text: 'Designing and maintaining structured test suites to ensure consistent coverage across features, platforms, and releases, helping teams track progress and reduce regression risk.',
    bug: 'Missing Step', fault: 'A staircase with one step gone.',
    match: ['Coverage', 'Regression'], cats: ['Test Case Management'] },
  { key: 'usability', name: 'Usability Testing',
    text: 'Evaluating gameplay flow, readability, onboarding, accessibility considerations, and UI clarity to identify friction points and improve the overall player experience.',
    bug: 'Tiny Text', fault: 'A sign with unreadably small text.',
    match: ['Player Experience', 'Opening Experience', 'Accessibility', 'Player Flow', 'Combat Feel'], cats: ['Usability Testing'] },
  { key: 'performance', name: 'Performance Testing',
    text: 'Identifying crashes, frame rate instability, memory and load issues, and other stability risks, validating smooth performance across consoles, mobile devices, and representative PC configurations.',
    bug: 'Stutter', fault: 'A zone where the tester’s animation drops frames.',
    match: ['Stability', 'Soak Testing', 'Performance', 'Multiplayer Sync'], cats: [] },
  { key: 'rc', name: 'Release Candidate Oversight',
    text: 'Running final pass validation, regression checks, and sign-off support on your RC builds to confirm launch readiness and minimise day-one issues.',
    bug: 'Last-minute Regression', fault: 'The summit sign reads SIX PAEKS.',
    match: ['Gold Master', 'Launch Readiness'], cats: ['Release Candidate Oversight'] },
];

// The nine homepage testimonials, verbatim (site-content.md "What Our Partners Say").
export const QUOTES = [
  { id: 'allum', partner: 'powell-group', name: 'Dani Allum', role: 'Lead Producer', studio: 'The Powell Group/Humble Games',
    text: 'Six Peaks Games professional, English-speaking teams are committed to excellence, consistently elevating our projects with their keen attention to detail and dedication. They have far exceeded our expectations in every regard.' },
  { id: 'scott', partner: 'thunderful', name: 'Dean Scott', role: 'Senior External Producer', studio: 'Thunderful',
    text: 'Six Peaks were enthusiastic and knowledgeable from day one, working to a reliably high standard. Timezone alignment is a bonus, and English as a first language means nuanced instructions are understood first time.' },
  { id: 'aikman', partner: 'chuhai-labs', name: 'Zach Aikman', role: 'Technical Director', studio: 'Chuhai Labs',
    text: 'The entire QA team at Six Peaks quickly became an invaluable extension of the Wild Blue Skies development team, and it’s hard to imagine the project’s success without their involvement. Their contributions consistently exceeded expectations. Six Peaks set a new benchmark for what we look for in a quality assurance partner.' },
  { id: 'wales', partner: 'playtonic-friends', name: 'Liam Wales', role: 'Publishing Producer', studio: 'Playtonic',
    text: 'Responsiveness and enthusiasm has encapsulated the Six Peaks experience from first contact to final delivery. I highly recommend them as an outsourcing partner for your titles!' },
  { id: 'kyne', partner: 'bossa-games', name: 'Anthony Kyne', role: 'Head of Studio', studio: 'Bossa Games',
    text: 'The Six Peaks team integrated well into our team and never felt like a separate entity. From start to finish they owned the QA process for us, were both super professional, enthusiastic and also fed back like genuine players of the game. Having them on board made the game better.' },
  { id: 'harfoot', partner: 'hardball', name: 'Dylan Harfoot', role: 'QA Manager', studio: 'Hardball Games',
    text: 'Six Peaks showed a degree of technical expertise that is hard to find in external QA vendors. They quickly became a core part of our QA operations and could be relied on not just to hunt bugs, but critically also be arbiters of game quality, healthy development processes, integration with production, and build and release management.' },
  { id: 'avent', partner: 'hardball', name: 'Jason Avent', role: 'CEO', studio: 'Hardball Games',
    text: 'Working with Six Peaks is just like adding more members to your internal team. They integrated seamlessly with us at Hardball and were consistently excellent in every discipline.' },
  { id: 'fraser', partner: 'silver-lining', name: 'Daniel Fraser', role: 'Producer', studio: 'Silver Lining Interactive',
    text: 'The team at Six Peaks provided professional, thorough QA services for Service with a Shotgun. They were highly knowledgeable, finding critical bugs we would have missed and helping to significantly improve the final product’s quality. Working with them was seamless, with clear communication and detailed reports delivered on time.' },
  { id: 'watson', partner: 'firestoke', name: 'Calum Watson', role: 'Technical Production Manager', studio: 'Firestoke Games',
    text: 'Partnering with Six Peaks Games for QA on ‘It’s Only Money’ was instrumental in our success. Their attention to detail and commitment to quality significantly enhanced our project, ensuring a flawless final product.' },
];

// 15 partner studios in homepage marquee order.
export const PARTNERS = [
  { slug: 'humble-games', name: 'Humble Games' },
  { slug: 'auroch-digital', name: 'Auroch Digital' },
  { slug: 'impossible-home', name: 'Impossible Home' },
  { slug: 'thunderful', name: 'Thunderful' },
  { slug: 'supercell', name: 'Supercell' },
  { slug: 'powell-group', name: 'The Powell Group' },
  { slug: 'firestoke', name: 'Firestoke' },
  { slug: 'balor-games', name: 'Balor Games' },
  { slug: 'torpor-games', name: 'Torpor Games' },
  { slug: 'hardball', name: 'Hardball' },
  { slug: 'playtonic-friends', name: 'Playtonic Friends' },
  { slug: 'microids', name: 'Microids' },
  { slug: 'silver-lining', name: 'Silver Lining Interactive' },
  { slug: 'chuhai-labs', name: 'Chuhai Labs' },
  { slug: 'bossa-games', name: 'Bossa Games' },
];

// games.json partner string -> partner logo slugs (first = credit logo).
export const PARTNER_IDS = {
  'Auroch Digital': ['auroch-digital'],
  'Playtonic Friends': ['playtonic-friends'],
  'Thunderful': ['thunderful'],
  'The Powell Group (Humble Games now Balor Games)': ['powell-group', 'humble-games', 'balor-games'],
  'The Powell Group & Balor Games': ['powell-group', 'balor-games'],
  'Silver Lining Interactive': ['silver-lining'],
  'Torpor Games': ['torpor-games'],
  'Microids': ['microids'],
  'Impossible Home': ['impossible-home'],
  'Hardball': ['hardball'],
  'Chuhai Labs': ['chuhai-labs'],
  'Firestoke': ['firestoke'],
};

// Titles as on the homepage project cards (site-content.md table).
export const TITLE_FIX = {
  'yooka-replaylee': 'Yooka Re-Playlee',
  'boltgun-2': 'Warhammer 40,000: Boltgun 2',
  'god-breakers': 'God Breakers',
  'lil-gator': 'Lil’Gator Game: In the Dark',
  'king-of-tokyo': 'King Of Tokyo',
};

export const UNDERWAY_LINE = 'Project underway, further details on release.';

export const PLATFORMS = [
  { slug: 'xbox', name: 'Xbox', w: 59, h: 63 },
  { slug: 'playstation', name: 'PlayStation', w: 59, h: 63 },
  { slug: 'nintendo', name: 'Nintendo', w: 59, h: 63 },
  { slug: 'epic', name: 'Epic', w: 59, h: 63 },
  { slug: 'steam', name: 'Steam', w: 59, h: 63 },
  { slug: 'windows', name: 'Windows', w: 59, h: 63 },
  { slug: 'meta', name: 'Meta', w: 55, h: 37 },
  { slug: 'apple', name: 'Apple', w: 45, h: 53 },
  { slug: 'android', name: 'Android', w: 44, h: 52 },
];
// games.json platform strings -> icon slug + display name
export const PLATFORM_MAP = {
  'Steam': ['steam', 'Steam'], 'Steam (DLC)': ['steam', 'Steam (DLC)'], 'Playstation': ['playstation', 'PlayStation'],
  'XBOX': ['xbox', 'Xbox'], 'Epic': ['epic', 'Epic'], 'Nintendo Switch': ['nintendo', 'Nintendo Switch'],
  'iOS': ['apple', 'iOS'], 'Android': ['android', 'Android'],
};

export const PROJECTS_INTRO = 'We have supported titles across a diverse range of genres, platforms, and audiences, from narrative adventures to open-world multiplayer experiences. We ramp up fast, spot the right risks early, and test within the context that matters so you can be confident that your game is in experienced hands.';

export const STATS = [
  { figure: '1-20+', label: 'Team sizes', text: 'Whether you need one tester or 20+, short-term or long-term, Six Peaks scales to fit. We’re small enough to care, big enough to deliver.' },
  { figure: '100%', label: 'In-office staff', text: 'A tight-knit team culture, close collaboration and strong work ethic, means you get a consistent standard of quality backed by clear oversight and secure processes.' },
  { figure: '99%', label: 'Staff retention', text: 'Our high staff retention provides stability, continuity, retained knowledge and consistency for your project and over the long term.' },
  { figure: 'ISO 27001', label: 'Security adherence', text: 'Adherence to this benchmark ensures your builds, data, and access are protected by proven security processes and clear accountability.' },
];

export const TEAM_BODY = [
  'Based in George in the Western Cape, we’re a proudly South African QA Team with a global perspective. Our team blends lifelong gamers, competitive players, and seasoned testers across every genre and platform.',
  'Our South African roots add to that diversity, giving us strong player awareness from first-time UX to high-skill balance. Each project is supported by a dedicated QA Lead, overseen by our in-studio QA Manager to maintain quality, communication, and alignment across every engagement.',
  'With a broad mix of backgrounds, playstyles, and perspectives, we bring well-rounded insight to every project.',
];

export const MANAGEMENT_INTRO = 'Six Peaks Games is led by an experienced team with roots in global AAA studios including Eidos Interactive, Disney Interactive and Black Rock Studios, and a proven track record of creating successful, high-quality game franchises.';
export const MANAGEMENT = [
  { name: 'Jason Ried', role: 'Founder & CEO', img: 'assets/brand/headshot-jason-ried.webp', linkedin: 'https://www.linkedin.com/in/jasonried/' },
  { name: 'Jason Avent', role: 'Founder & Non-Exec Director', img: 'assets/brand/headshot-jason-avent.webp', linkedin: 'https://www.linkedin.com/in/jason-avent-171898/' },
  { name: 'Louise Ried', role: 'Business Development Director', img: 'assets/brand/headshot-louise-ried.webp', linkedin: 'https://www.linkedin.com/in/louise-ried-six-peaks/' },
  { name: 'Callan Schroder', role: 'QA Manager', img: 'assets/brand/headshot-callan-schroder.webp', linkedin: 'https://www.linkedin.com/in/callan-schroder-17a260222/' },
];

export const CAREERS = {
  text: [
    'We’re always looking for exceptional people to join our team and help us deliver outstanding testing services for game developers and publishers worldwide across console, mobile and PC platforms.',
    'You’ll play a role in maintaining the highest quality standards and supporting successful game submissions ahead of release.',
    'If you have a passion for gaming and an eye for quality, we’d love to hear from you. Experience in game and software testing is beneficial but not required.',
  ],
  url: 'https://wkf.ms/4s5yyRp',
};

export const CONTACT = {
  text: 'If you’re looking for a QA partner that will go beyond standard QA, delivering high-quality, rigorous testing as an extension of your team, then please get in touch! We’d love to discuss how we can support your game!',
  office: 'Joubert Plaza 2, Office 24, Corner of Meade and Market, George',
  phone: '+27 83 244 8880',
  email: 'contact@sixpeaks.games',
  reasons: ['I’d like to discuss a project', 'I’d like to book a free trial', 'I’d like more information', 'Other reason'],
  linkedin: 'https://www.linkedin.com/company/six-peaks-games/',
  copyright: 'Copyright @ 2025 all rights reserved',
};

// Team photos as polaroid pickups. Captions describe the photo (manifest notes) and pair it with one
// team fact from the site, so each pickup reveals real content (The Tie-break mechanic).
export const PHOTOS = [
  { id: 'rooftop', src: 'assets/brand/team-1.webp', w: 1900, h: 890, alt: 'The Six Peaks core team on the office rooftop in George, with the mountain range behind them',
    caption: 'The core team on the office rooftop in George.', fact: 'team-body-0' },
  { id: 'desk', src: 'assets/brand/vert-9.webp', w: 864, h: 1092, alt: 'A member of the Six Peaks team working at a laptop in the studio',
    caption: 'Heads down in the studio.', fact: 'stat-1' },
  { id: 'pair', src: 'assets/brand/vert-4.webp', w: 864, h: 1092, alt: 'Two members of the Six Peaks team looking at one screen together',
    caption: 'Two of the team at one screen.', fact: 'stat-2' },
  { id: 'company', src: 'assets/brand/team-4.webp', w: 1900, h: 890, alt: 'The whole Six Peaks company on a lawn with mountains on the horizon',
    caption: 'The whole company, with the mountains on the horizon.', fact: 'stat-0' },
  { id: 'screens', src: 'assets/brand/vert-10.webp', w: 864, h: 1092, alt: 'Two members of the Six Peaks team at a computer in the studio',
    caption: 'At work in the studio.', fact: 'stat-3' },
  { id: 'crew', src: 'assets/brand/team-3.webp', w: 1900, h: 890, alt: 'The Six Peaks core team posing on the office rooftop',
    caption: 'The core team, off the clock.', fact: 'management' },
];
