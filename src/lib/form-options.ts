export const DOMINANT_FOOT_OPTIONS = [
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
  { value: "both", label: "Both" },
] as const;

export const EXPERIENCE_LEVEL_OPTIONS = [
  { value: "academy", label: "Academy" },
  { value: "amateur", label: "Amateur" },
  { value: "semi_pro", label: "Semi-pro" },
  { value: "professional", label: "Professional" },
] as const;

export const AVAILABILITY_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "open_to_offers", label: "Open to offers" },
  { value: "not_available", label: "Not available" },
] as const;
