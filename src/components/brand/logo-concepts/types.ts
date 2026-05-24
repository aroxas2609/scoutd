export type LogoConceptTheme = "dark" | "light";

export type LogoConceptId = "velocity" | "signal" | "orbit" | "strike";

export type ConceptMarkProps = {
  size?: number;
  className?: string;
  theme?: LogoConceptTheme;
};

export type ConceptWordmarkProps = ConceptMarkProps & {
  showMark?: boolean;
};
