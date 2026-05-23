export type MetroAssociation = {
  name: string;
  type: string;
  contact: string;
  phone: string;
  email: string;
  websiteLabel: string;
  logo: string;
};

export const METRO_NSW_ASSOCIATIONS: MetroAssociation[] = [
  {
    name: "Bankstown FA",
    type: "Metro Association",
    contact: "Leanne Millar",
    phone: "(02) 9771 3322",
    email: "leanne@bdafa.com.au",
    websiteLabel: "Visit website",
    logo: "/logos/bankstown-fa.png",
  },
  {
    name: "Blacktown District",
    type: "Metro Association",
    contact: "Alex Hanna",
    phone: "(02) 9675 1211",
    email: "admin@bdsfa.com",
    websiteLabel: "Visit website",
    logo: "/logos/blacktown-district.png",
  },
  {
    name: "Canterbury DSFA",
    type: "Metro Association",
    contact: "Trent Thomas",
    phone: "(02) 9716 8558",
    email: "admin@footballcanterbury.com.au",
    websiteLabel: "Visit website",
    logo: "/logos/canterbury-dsfa.png",
  },
  {
    name: "Central Coast Football",
    type: "Metro Association",
    contact: "Alex Burgin",
    phone: "(02) 4362 4300",
    email: "admin@ccfootball.com.au",
    websiteLabel: "Visit website",
    logo: "/logos/central-coast-football.png",
  },
  {
    name: "Eastern Suburbs FA",
    type: "Metro Association",
    contact: "John Boulos",
    phone: "(02) 8347 8800",
    email: "info@esfa.com.au",
    websiteLabel: "Visit website",
    logo: "/logos/eastern-suburbs-fa.png",
  },
  {
    name: "Football South Coast",
    type: "Metro Association",
    contact: "Sonya Keir",
    phone: "(02) 4285 6929",
    email: "admin@footballsouthcoast.com",
    websiteLabel: "Visit website",
    logo: "/logos/football-south-coast.png",
  },
  {
    name: "Football St George",
    type: "Metro Association",
    contact: "Zoe Braithwaite",
    phone: "(02) 9556 3055",
    email: "info@footballstgeorge.com.au",
    websiteLabel: "Visit website",
    logo: "/logos/football-st-george.png",
  },
  {
    name: "Granville & Districts SFA",
    type: "Metro Association",
    contact: "Rosanna Lentini",
    phone: "0436 481 296",
    email: "office@granvillesoccer.com.au",
    websiteLabel: "Visit website",
    logo: "/logos/granville-districts-sfa.png",
  },
  {
    name: "Hills Football",
    type: "Metro Association",
    contact: "Jeremy Toivonen",
    phone: "N/A",
    email: "office@hillsfootball.com.au",
    websiteLabel: "Visit website",
    logo: "/logos/hills-football.png",
  },
  {
    name: "Macarthur District",
    type: "Metro Association",
    contact: "Paul Bertolissio",
    phone: "(02) 4625 1333",
    email: "gm@macarthursoccer.com.au",
    websiteLabel: "Visit website",
    logo: "/logos/macarthur-district.png",
  },
  {
    name: "Manly Warringah",
    type: "Metro Association",
    contact: "Lee-Anne Sestanovich",
    phone: "(02) 9982 6228",
    email: "admin@mwfa.com.au",
    websiteLabel: "Visit website",
    logo: "/logos/manly-warringah.png",
  },
  {
    name: "Nepean District FA",
    type: "Metro Association",
    contact: "Linda Cerone",
    phone: "(02) 4731 2911",
    email: "admin@nepeanfootball.com.au",
    websiteLabel: "Visit website",
    logo: "/logos/nepean-district-fa.png",
  },
  {
    name: "North West Sydney Football Ltd",
    type: "Metro Association",
    contact: "Phil Brown",
    phone: "(02) 9887 2116",
    email: "nwsf@nwsf.com.au",
    websiteLabel: "Visit website",
    logo: "/logos/north-west-sydney-football.png",
  },
  {
    name: "Northern Suburbs",
    type: "Metro Association",
    contact: "David Taylor",
    phone: "(02) 9449 4933",
    email: "admin@nsfa.asn.au",
    websiteLabel: "Visit website",
    logo: "/logos/northern-suburbs.png",
  },
  {
    name: "Southern Districts",
    type: "Metro Association",
    contact: "Admin",
    phone: "N/A",
    email: "admin@sdsfa.com",
    websiteLabel: "Visit website",
    logo: "/logos/southern-districts.png",
  },
  {
    name: "Sutherland Shire Football",
    type: "Metro Association",
    contact: "Jeff Stewart",
    phone: "(02) 9542 3577",
    email: "office@shirefootball.com",
    websiteLabel: "Visit website",
    logo: "/logos/sutherland-shire-football.png",
  },
];

export const METRO_ASSOCIATION_NAMES = METRO_NSW_ASSOCIATIONS.map((a) => a.name);

export const METRO_ASSOCIATION_OPTIONS = METRO_NSW_ASSOCIATIONS.map((a) => ({
  value: a.name,
  label: a.name,
}));

export function isMetroAssociation(value: string): boolean {
  return METRO_ASSOCIATION_NAMES.includes(value);
}

export function getMetroAssociationOptions(currentValue?: string | null) {
  if (currentValue?.trim() && !isMetroAssociation(currentValue)) {
    return [{ value: currentValue, label: currentValue }, ...METRO_ASSOCIATION_OPTIONS];
  }
  return METRO_ASSOCIATION_OPTIONS;
}
