// Country code to flag emoji mapping
export const getCountryFlag = (countryCode: string): string => {
  if (!countryCode || countryCode.length !== 2) return "🏳️";
  
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  
  return String.fromCodePoint(...codePoints);
};

// Common country codes and names
export const COUNTRIES = [
  { code: "DE", name: "Germany" },
  { code: "BR", name: "Brazil" },
  { code: "FR", name: "France" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "PT", name: "Portugal" },
  { code: "AR", name: "Argentina" },
  { code: "CO", name: "Colombia" },
  { code: "MX", name: "Mexico" },
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "IE", name: "Ireland" },
  { code: "PL", name: "Poland" },
  { code: "CZ", name: "Czech Republic" },
  { code: "SK", name: "Slovakia" },
  { code: "HU", name: "Hungary" },
  { code: "AT", name: "Austria" },
  { code: "CH", name: "Switzerland" },
  { code: "DK", name: "Denmark" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "FI", name: "Finland" },
  { code: "IS", name: "Iceland" },
  { code: "TR", name: "Turkey" },
  { code: "GR", name: "Greece" },
  { code: "HR", name: "Croatia" },
  { code: "RS", name: "Serbia" },
  { code: "BA", name: "Bosnia and Herzegovina" },
  { code: "SI", name: "Slovenia" },
  { code: "MK", name: "North Macedonia" },
  { code: "AL", name: "Albania" },
  { code: "BG", name: "Bulgaria" },
  { code: "RO", name: "Romania" },
  { code: "UA", name: "Ukraine" },
  { code: "RU", name: "Russia" },
  { code: "NG", name: "Nigeria" },
  { code: "GH", name: "Ghana" },
  { code: "CI", name: "Ivory Coast" },
  { code: "SN", name: "Senegal" },
  { code: "ML", name: "Mali" },
  { code: "CM", name: "Cameroon" },
  { code: "MA", name: "Morocco" },
  { code: "TN", name: "Tunisia" },
  { code: "EG", name: "Egypt" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "AU", name: "Australia" },
  { code: "NZ", name: "New Zealand" },
];

// Calculate age from date of birth
export const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Position display names
export const POSITION_DISPLAY_NAMES: Record<string, string> = {
  "Goalkeeper": "Goalkeeper",
  "Defender": "Defender",
  "Midfielder": "Midfielder",
  "Forward": "Forward",
  "Winger": "Winger",
  "Striker": "Striker",
  "Center-back": "Center-back",
  "Fullback": "Fullback",
  "Defensive-midfielder": "Defensive Midfielder",
  "Attacking-midfielder": "Attacking Midfielder",
};

// Availability status colors
export const AVAILABILITY_COLORS = {
  "available": "bg-green-100 text-green-800",
  "unavailable": "bg-gray-100 text-gray-800",
  "injured": "bg-red-100 text-red-800",
  "suspended": "bg-yellow-100 text-yellow-800",
};