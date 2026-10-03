/**
 * Central content for the Vidhi Ekta Sangh website.
 *
 * NOTE: Names, numbers, dates, and contact details below are SAMPLE content
 * so the design can be reviewed end-to-end. Replace them with VES's real data
 * before going live. Images live in /public/images (see scripts/generate-placeholders.mjs).
 */

export const site = {
  name: "Vidhi Ekta Sangh",
  short: "VES",
  hindi: "विधि एकता संघ",
  tagline: "United for Law. Committed to Justice.",
  description:
    "Vidhi Ekta Sangh is a national community of legal professionals and law students — opening doors to internships, scholarships, mentorship and events across India.",
  founded: 2020,
  email: "contact@vidhiektasangh.org",
  phone: "+91 98765 43210",
  address: "Chamber Block, Patiala House Courts, New Delhi — 110001",
  hours: "Mon – Sat, 10:00 AM – 6:00 PM IST",
  socials: {
    youtube: "https://www.youtube.com/@VidhiEktaSangh",
    linkedin: "https://www.linkedin.com/company/vidhi-ekta-sangh",
    instagram: "https://www.instagram.com/vidhiektasangh",
    x: "https://x.com/vidhiektasangh",
  },
};

export const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/internships", label: "Internships" },
  { href: "/wings", label: "Wings" },
  { href: "/journey", label: "Journey" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

/** Joined members per state / UT, keyed by the map's location id. */
export const stateMembers: Record<string, { members: number; cities: string[] }> = {
  dl: { members: 214, cities: ["New Delhi", "Dwarka", "Rohini"] },
  up: { members: 186, cities: ["Lucknow", "Prayagraj", "Noida", "Varanasi"] },
  mh: { members: 162, cities: ["Mumbai", "Pune", "Nagpur"] },
  rj: { members: 148, cities: ["Jaipur", "Jodhpur", "Udaipur"] },
  mp: { members: 112, cities: ["Bhopal", "Indore", "Jabalpur"] },
  ka: { members: 104, cities: ["Bengaluru", "Mysuru", "Dharwad"] },
  wb: { members: 92, cities: ["Kolkata", "Siliguri"] },
  gj: { members: 88, cities: ["Ahmedabad", "Gandhinagar", "Surat"] },
  tn: { members: 84, cities: ["Chennai", "Madurai", "Coimbatore"] },
  br: { members: 78, cities: ["Patna", "Gaya"] },
  hr: { members: 72, cities: ["Gurugram", "Chandigarh", "Rohtak"] },
  pb: { members: 66, cities: ["Ludhiana", "Amritsar", "Patiala"] },
  tg: { members: 62, cities: ["Hyderabad", "Warangal"] },
  kl: { members: 58, cities: ["Kochi", "Thiruvananthapuram"] },
  or: { members: 46, cities: ["Bhubaneswar", "Cuttack"] },
  ap: { members: 44, cities: ["Visakhapatnam", "Amaravati"] },
  jh: { members: 38, cities: ["Ranchi", "Jamshedpur"] },
  ut: { members: 34, cities: ["Dehradun", "Nainital"] },
  as: { members: 32, cities: ["Guwahati", "Dibrugarh"] },
  ct: { members: 28, cities: ["Raipur", "Bilaspur"] },
  hp: { members: 24, cities: ["Shimla", "Dharamshala"] },
  jk: { members: 22, cities: ["Jammu", "Srinagar", "Leh"] },
  ch: { members: 20, cities: ["Chandigarh"] },
  ga: { members: 14, cities: ["Panaji", "Margao"] },
  ml: { members: 10, cities: ["Shillong"] },
  mn: { members: 8, cities: ["Imphal"] },
  tr: { members: 7, cities: ["Agartala"] },
  sk: { members: 6, cities: ["Gangtok"] },
  py: { members: 5, cities: ["Puducherry"] },
  nl: { members: 5, cities: ["Kohima"] },
  mz: { members: 4, cities: ["Aizawl"] },
  ar: { members: 4, cities: ["Itanagar"] },
};

const memberCounts = Object.values(stateMembers);
export const totalMembers = memberCounts.reduce((sum, s) => sum + s.members, 0);
export const statesReached = memberCounts.filter((s) => s.members > 0).length;

export const stats = [
  { value: totalMembers, suffix: "", label: "Members nationwide" },
  { value: 420, suffix: "+", label: "Internships facilitated" },
  { value: 96, suffix: "", label: "Events & seminars" },
  { value: statesReached, suffix: "", label: "States & UTs reached" },
];

export const founder = {
  name: "Adv. Rohan Malhotra",
  title: "Founder & National President",
  initials: "RM",
  quote:
    "The law is not a profession of the privileged few. Every student who walks into a courtroom for the first time deserves a mentor beside them — that is why Vidhi Ekta Sangh exists.",
  bio: [
    "An advocate practising before the High Court of Delhi with over a decade at the Bar, Adv. Malhotra founded VES in 2020 after witnessing how many talented law students from smaller towns never found their first internship.",
    "What began as a WhatsApp group of 40 students has grown into a national network spanning more than 30 states and union territories, with chapters, wings and a mentorship programme run entirely by volunteers.",
  ],
  credentials: [
    "Advocate, High Court of Delhi",
    "LL.M., Constitutional Law",
    "Pro bono counsel, District Legal Services Authority",
  ],
};

export const pillars = [
  {
    key: "integrity",
    title: "Integrity",
    hindi: "निष्ठा",
    text: "We hold ourselves to the ethics of the Bar — honesty in counsel, transparency in action and fairness to every member.",
  },
  {
    key: "unity",
    title: "Unity",
    hindi: "एकता",
    text: "Students, advocates, academicians and judges — one fraternity, bound together across states, languages and backgrounds.",
  },
  {
    key: "justice",
    title: "Justice",
    hindi: "न्याय",
    text: "Access to justice is a constitutional promise. Our legal-aid camps and awareness drives carry it to every doorstep.",
  },
  {
    key: "empowerment",
    title: "Empowerment",
    hindi: "सशक्तिकरण",
    text: "Internships, scholarships and mentorship that turn ambition into opportunity — especially for first-generation lawyers.",
  },
] as const;

export type Internship = {
  id: string;
  title: string;
  organization: string;
  location: string;
  mode: "On-site" | "Remote" | "Hybrid";
  domain: "Litigation" | "Corporate" | "Policy & Research" | "Legal Aid" | "Judiciary";
  duration: string;
  stipend: string;
  deadline: string;
  seats: number;
  description: string;
  eligibility: string;
};

export const internships: Internship[] = [
  {
    id: "lit-delhi-hc",
    title: "Litigation Intern — Constitutional & Writ Practice",
    organization: "Chambers of a Senior Advocate, High Court of Delhi",
    location: "New Delhi",
    mode: "On-site",
    domain: "Litigation",
    duration: "4 weeks",
    stipend: "₹5,000 / month",
    deadline: "31 Oct 2026",
    seats: 4,
    description:
      "Research on writ petitions, drafting of synopses and list of dates, and attending hearings before the Division Bench.",
    eligibility: "3rd year onwards (5-yr) / 2nd year onwards (3-yr LL.B.)",
  },
  {
    id: "corp-mumbai",
    title: "Corporate & M&A Intern",
    organization: "Tier-II Law Firm, Mumbai",
    location: "Mumbai",
    mode: "Hybrid",
    domain: "Corporate",
    duration: "6 weeks",
    stipend: "₹10,000 / month",
    deadline: "15 Nov 2026",
    seats: 3,
    description:
      "Due diligence reports, drafting of shareholder agreements and regulatory research under SEBI and Companies Act frameworks.",
    eligibility: "4th & 5th year students with a corporate law elective",
  },
  {
    id: "policy-remote",
    title: "Legal Policy & Research Fellow",
    organization: "VES Research & Publication Wing",
    location: "Pan-India",
    mode: "Remote",
    domain: "Policy & Research",
    duration: "8 weeks",
    stipend: "Certificate + publication credit",
    deadline: "20 Nov 2026",
    seats: 10,
    description:
      "Co-author policy briefs on criminal law reforms and the new BNS/BNSS/BSA codes for the VES Quarterly Law Review.",
    eligibility: "Any year; strong writing sample required",
  },
  {
    id: "legal-aid-jaipur",
    title: "Legal Aid Clinic Volunteer",
    organization: "District Legal Services Authority, Jaipur",
    location: "Jaipur",
    mode: "On-site",
    domain: "Legal Aid",
    duration: "3 weeks",
    stipend: "Travel allowance",
    deadline: "05 Nov 2026",
    seats: 12,
    description:
      "Assist panel lawyers at legal-aid camps, draft applications and conduct rights-awareness sessions in rural blocks.",
    eligibility: "All years; Hindi proficiency preferred",
  },
  {
    id: "judiciary-lucknow",
    title: "Judicial Research Intern",
    organization: "Under a District & Sessions Judge (Retd.), Lucknow",
    location: "Lucknow",
    mode: "On-site",
    domain: "Judiciary",
    duration: "4 weeks",
    stipend: "Unpaid · Certificate",
    deadline: "12 Nov 2026",
    seats: 2,
    description:
      "Case-law research, judgment summaries and exposure to trial-court procedure — ideal for judiciary aspirants.",
    eligibility: "Final-year students and recent graduates",
  },
  {
    id: "lit-bengaluru",
    title: "Civil & Commercial Litigation Intern",
    organization: "Advocate Chambers, High Court of Karnataka",
    location: "Bengaluru",
    mode: "On-site",
    domain: "Litigation",
    duration: "4 weeks",
    stipend: "₹4,000 / month",
    deadline: "25 Nov 2026",
    seats: 3,
    description:
      "Drafting plaints and written statements, commercial court filings and client conferences.",
    eligibility: "3rd year onwards",
  },
];

export const internshipSteps = [
  {
    title: "Register",
    text: "Create your VES membership profile with your CV and areas of interest.",
  },
  {
    title: "Apply",
    text: "Pick from verified openings across chambers, firms, NGOs and legal-aid bodies.",
  },
  {
    title: "Get matched",
    text: "Our Internship Wing shortlists and connects you with the mentor directly.",
  },
  {
    title: "Intern & grow",
    text: "Complete the internship with a VES certificate and a mentor's reference.",
  },
];

export const internshipFaqs = [
  {
    q: "Is VES membership required to apply?",
    a: "Membership is free for law students. Registering helps us verify your enrolment and match you with mentors who fit your interests.",
  },
  {
    q: "Do you charge any placement fee?",
    a: "Never. VES does not charge students for internships, and we only list openings from verified advocates, firms and institutions.",
  },
  {
    q: "Can first-year students apply?",
    a: "Yes — many legal-aid, research and NGO internships are open to first-year students. Each listing mentions its eligibility.",
  },
  {
    q: "Will I receive a certificate?",
    a: "Every VES-facilitated internship includes a completion certificate. Outstanding interns may also receive a mentor's letter of recommendation.",
  },
];

export const scholarships = [
  {
    title: "VES Merit Scholarship",
    amount: "₹25,000",
    text: "For law students with outstanding academic records from economically weaker backgrounds.",
    deadline: "30 Nov 2026",
  },
  {
    title: "Nyaya Access Grant",
    amount: "₹15,000",
    text: "Covers travel and stay for students taking up internships outside their home city.",
    deadline: "Rolling",
  },
  {
    title: "Women in Law Fellowship",
    amount: "₹30,000",
    text: "Supports women law students pursuing litigation, with a year-long mentorship from senior advocates.",
    deadline: "15 Dec 2026",
  },
];

export const events = [
  {
    title: "National Moot Court Competition 2026",
    date: "14 – 16 Aug 2026",
    location: "New Delhi",
    image: "/images/event-moot-court.svg",
    text: "64 teams from 22 states argued a constitutional problem on digital privacy before benches of senior advocates and retired judges.",
  },
  {
    title: "Rural Legal Aid Camp",
    date: "02 Jul 2026",
    location: "Alwar, Rajasthan",
    image: "/images/event-legal-aid.svg",
    text: "120 volunteers offered free consultations on land, pension and domestic-violence matters to over 900 villagers.",
  },
  {
    title: "Constitution Day Seminar",
    date: "26 Nov 2025",
    location: "Lucknow",
    image: "/images/event-constitution-day.svg",
    text: "A day-long reading and panel discussion on the Preamble, fundamental duties and 75 years of the Republic.",
  },
  {
    title: "Legal Career Conclave",
    date: "18 Jan 2026",
    location: "Mumbai",
    image: "/images/event-career-conclave.svg",
    text: "Partners, in-house counsel and judiciary toppers on building a career in law — beyond the usual paths.",
  },
  {
    title: "Women & the Law Workshop",
    date: "08 Mar 2026",
    location: "Bengaluru",
    image: "/images/event-womens-rights.svg",
    text: "Hands-on sessions on POSH compliance, maintenance law and courtroom confidence for young women advocates.",
  },
  {
    title: "Legal Writing Bootcamp",
    date: "22 – 24 May 2026",
    location: "Online",
    image: "/images/event-legal-writing.svg",
    text: "Three days on drafting, citation and persuasive writing, with personalised feedback on every submission.",
  },
];

export const news = [
  {
    date: "28 Sep 2026",
    category: "Announcement",
    title: "Applications open for the Winter Internship Cycle",
    text: "Over 60 openings across 14 cities — litigation, corporate, policy and legal aid. Applications close on 30 November.",
  },
  {
    date: "19 Sep 2026",
    category: "Chapters",
    title: "VES launches its Northeast Chapter in Guwahati",
    text: "The new chapter will coordinate legal-aid camps and internships across all eight northeastern states.",
  },
  {
    date: "02 Sep 2026",
    category: "Publication",
    title: "Quarterly Law Review — Issue 07 released",
    text: "This issue examines the first year of the new criminal codes, with contributions from 18 student authors.",
  },
  {
    date: "21 Aug 2026",
    category: "Recognition",
    title: "VES volunteers honoured by State Legal Services Authority",
    text: "Recognised for organising 40+ legal-awareness drives in rural Rajasthan over the past year.",
  },
  {
    date: "05 Aug 2026",
    category: "Partnership",
    title: "MoU signed with three National Law Universities",
    text: "The partnership opens joint research projects, guest lectures and shared moot-court infrastructure.",
  },
];

const memberSeed: [string, string, string][] = [
  ["Ananya Sharma", "National General Secretary", "Delhi"],
  ["Kabir Verma", "National Treasurer", "Uttar Pradesh"],
  ["Ishita Rao", "Head, Internship Wing", "Karnataka"],
  ["Arjun Nair", "Head, Legal Aid Wing", "Kerala"],
  ["Meera Joshi", "Head, Women's Rights Wing", "Maharashtra"],
  ["Siddharth Chauhan", "Head, Moot Court Wing", "Rajasthan"],
  ["Priya Iyer", "Head, Research Wing", "Tamil Nadu"],
  ["Aditya Banerjee", "Head, Media Wing", "West Bengal"],
  ["Riya Kapoor", "Head, Student Wing", "Punjab"],
  ["Vivaan Mishra", "Head, Events Wing", "Bihar"],
  ["Sneha Patel", "State Coordinator", "Gujarat"],
  ["Rahul Yadav", "State Coordinator", "Madhya Pradesh"],
  ["Aisha Khan", "State Coordinator", "Telangana"],
  ["Devansh Gupta", "State Coordinator", "Haryana"],
  ["Tanvi Deshmukh", "State Coordinator", "Maharashtra"],
  ["Harsh Vardhan", "State Coordinator", "Uttarakhand"],
  ["Nandini Reddy", "State Coordinator", "Andhra Pradesh"],
  ["Karan Sethi", "State Coordinator", "Delhi"],
  ["Pooja Mahapatra", "State Coordinator", "Odisha"],
  ["Rohit Sinha", "State Coordinator", "Jharkhand"],
  ["Simran Kaur", "State Coordinator", "Chandigarh"],
  ["Manav Thakur", "State Coordinator", "Himachal Pradesh"],
  ["Lavanya Menon", "State Coordinator", "Kerala"],
  ["Yash Agarwal", "State Coordinator", "Uttar Pradesh"],
  ["Diya Bora", "State Coordinator", "Assam"],
  ["Aman Tiwari", "State Coordinator", "Chhattisgarh"],
  ["Shreya Pandey", "Campus Ambassador Lead", "Uttar Pradesh"],
  ["Nikhil Saxena", "Mentorship Coordinator", "Rajasthan"],
  ["Zoya Qureshi", "Content & Outreach", "Jammu & Kashmir"],
  ["Pranav Kulkarni", "Technology Lead", "Karnataka"],
  ["Ira Fernandes", "Partnerships Lead", "Goa"],
  ["Abhinav Dubey", "Alumni Relations", "Madhya Pradesh"],
];

export const members = memberSeed.map(([name, role, state]) => ({
  name,
  role,
  state,
  initials: name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2),
}));

export const patrons = [
  {
    name: "Hon'ble Justice (Retd.) S. N. Kashyap",
    title: "Chief Patron",
    detail: "Former Judge, High Court of Judicature at Allahabad",
    initials: "SK",
  },
  {
    name: "Sr. Adv. Meenakshi Raghavan",
    title: "Patron",
    detail: "Senior Advocate, Supreme Court of India",
    initials: "MR",
  },
  {
    name: "Prof. (Dr.) Alok Bhattacharya",
    title: "Academic Patron",
    detail: "Former Vice-Chancellor, National Law University",
    initials: "AB",
  },
  {
    name: "Sr. Adv. Harpreet Gill",
    title: "Patron",
    detail: "Senior Advocate, Punjab & Haryana High Court",
    initials: "HG",
  },
];

export const videos = [
  {
    // Paste the YouTube video id (the part after "v=") to embed it inline.
    youtubeId: "",
    title: "National Moot Court 2026 — Final Round Highlights",
    duration: "12:48",
    image: "/images/event-moot-court.svg",
  },
  {
    youtubeId: "",
    title: "Know Your Rights: Free Legal Aid Explained",
    duration: "08:15",
    image: "/images/event-legal-aid.svg",
  },
  {
    youtubeId: "",
    title: "How to Land Your First Litigation Internship",
    duration: "15:02",
    image: "/images/event-career-conclave.svg",
  },
];

export const wings = [
  {
    key: "internship",
    name: "Internship & Placement Wing",
    head: "Ishita Rao",
    summary:
      "Sources, verifies and matches internships with chambers, firms, NGOs and legal-aid bodies.",
    activities: ["Bi-annual internship cycles", "Mentor matching", "CV & interview clinics"],
  },
  {
    key: "legal-aid",
    name: "Legal Aid Wing",
    head: "Arjun Nair",
    summary:
      "Takes free legal advice and rights awareness to villages, slums and under-served districts.",
    activities: ["Rural legal-aid camps", "Para-legal volunteer training", "DLSA partnerships"],
  },
  {
    key: "moot",
    name: "Moot Court & Advocacy Wing",
    head: "Siddharth Chauhan",
    summary: "Builds courtroom skills through national moots, mock trials and advocacy workshops.",
    activities: [
      "National Moot Court Competition",
      "Mock trial series",
      "Oral advocacy masterclasses",
    ],
  },
  {
    key: "research",
    name: "Research & Publication Wing",
    head: "Priya Iyer",
    summary: "Publishes the VES Quarterly Law Review and policy briefs on emerging areas of law.",
    activities: ["Quarterly Law Review", "Policy briefs", "Legal writing bootcamps"],
  },
  {
    key: "women",
    name: "Women's Rights Wing",
    head: "Meera Joshi",
    summary:
      "Champions women in law and works on awareness around gender justice and workplace safety.",
    activities: ["Women in Law Fellowship", "POSH awareness", "Helpline referrals"],
  },
  {
    key: "student",
    name: "Student Wing",
    head: "Riya Kapoor",
    summary: "The voice of law students — campus chapters, ambassadors and peer-learning circles.",
    activities: ["Campus chapters", "Ambassador programme", "Peer study circles"],
  },
  {
    key: "events",
    name: "Events & Outreach Wing",
    head: "Vivaan Mishra",
    summary:
      "Plans seminars, conclaves and commemorations that bring the legal fraternity together.",
    activities: ["Constitution Day", "Career conclaves", "Guest lecture series"],
  },
  {
    key: "media",
    name: "Media & Communication Wing",
    head: "Aditya Banerjee",
    summary:
      "Tells the VES story through video, social media, newsletters and the YouTube channel.",
    activities: ["YouTube explainers", "Monthly newsletter", "Event coverage"],
  },
];

export const journey = [
  {
    year: "2020",
    title: "A WhatsApp group becomes a movement",
    text: "Founded in New Delhi with 40 law students during the pandemic, VES began by sharing virtual internship openings and study material.",
  },
  {
    year: "2021",
    title: "First internship cycle",
    text: "The Internship Wing was formed and placed 60 students with advocates across five states — free of cost.",
  },
  {
    year: "2022",
    title: "Legal aid on the ground",
    text: "Our first rural legal-aid camp in Rajasthan reached 400 villagers. The Legal Aid Wing was formally constituted.",
  },
  {
    year: "2023",
    title: "Going national",
    text: "State coordinators appointed in 15 states. The VES Quarterly Law Review published its first issue.",
  },
  {
    year: "2024",
    title: "Scholarships launched",
    text: "The VES Merit Scholarship and Women in Law Fellowship were instituted with the support of our patrons.",
  },
  {
    year: "2025",
    title: "1,000 members strong",
    text: "Crossed 1,000 registered members and hosted the first National Moot Court Competition with 40 teams.",
  },
  {
    year: "2026",
    title: "30+ states and counting",
    text: "MoUs with National Law Universities, a Northeast chapter, and nearly 1,900 members across 32 states and UTs.",
  },
];

export type GalleryItem = {
  src: string;
  title: string;
  category: "Events" | "Moot Court" | "Legal Aid" | "Seminars" | "Community";
  w: number;
  h: number;
};

export const gallery: GalleryItem[] = [
  {
    src: "/images/gallery-01.svg",
    title: "Final round, National Moot Court",
    category: "Moot Court",
    w: 900,
    h: 1200,
  },
  {
    src: "/images/gallery-02.svg",
    title: "Volunteers at the Alwar legal-aid camp",
    category: "Legal Aid",
    w: 1200,
    h: 800,
  },
  {
    src: "/images/gallery-03.svg",
    title: "Keynote at the Career Conclave",
    category: "Seminars",
    w: 1000,
    h: 1000,
  },
  {
    src: "/images/gallery-04.svg",
    title: "Felicitation of scholarship awardees",
    category: "Events",
    w: 900,
    h: 1200,
  },
  {
    src: "/images/gallery-05.svg",
    title: "Library visit, Supreme Court of India",
    category: "Community",
    w: 1200,
    h: 800,
  },
  {
    src: "/images/gallery-06.svg",
    title: "Legal writing bootcamp",
    category: "Seminars",
    w: 1000,
    h: 1000,
  },
  {
    src: "/images/gallery-07.svg",
    title: "MoU signing with partner universities",
    category: "Events",
    w: 1200,
    h: 800,
  },
  {
    src: "/images/gallery-08.svg",
    title: "Constitution Day reading circle",
    category: "Seminars",
    w: 900,
    h: 1200,
  },
  {
    src: "/images/gallery-09.svg",
    title: "Best Speaker award ceremony",
    category: "Moot Court",
    w: 1000,
    h: 1000,
  },
  {
    src: "/images/gallery-10.svg",
    title: "Rights awareness at a village school",
    category: "Legal Aid",
    w: 1200,
    h: 800,
  },
  {
    src: "/images/gallery-11.svg",
    title: "Annual national meet",
    category: "Community",
    w: 900,
    h: 1200,
  },
  {
    src: "/images/gallery-12.svg",
    title: "Women & the Law workshop",
    category: "Events",
    w: 1200,
    h: 800,
  },
];
