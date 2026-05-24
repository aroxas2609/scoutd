import type { ComponentType } from "react";
import type { ConceptMarkProps, ConceptWordmarkProps, LogoConceptId } from "./types";
import { VelocityMark } from "./option-velocity/mark";
import { VelocityWordmark } from "./option-velocity/wordmark";
import { SignalMark } from "./option-signal/mark";
import { SignalWordmark } from "./option-signal/wordmark";
import { OrbitMark } from "./option-orbit/mark";
import { OrbitWordmark } from "./option-orbit/wordmark";
import { StrikeMark } from "./option-strike/mark";
import { StrikeWordmark } from "./option-strike/wordmark";

type ConceptComponents = {
  Mark: ComponentType<ConceptMarkProps>;
  Wordmark: ComponentType<ConceptWordmarkProps>;
};

export const conceptRegistry: Record<LogoConceptId, ConceptComponents> = {
  velocity: { Mark: VelocityMark, Wordmark: VelocityWordmark },
  signal: { Mark: SignalMark, Wordmark: SignalWordmark },
  orbit: { Mark: OrbitMark, Wordmark: OrbitWordmark },
  strike: { Mark: StrikeMark, Wordmark: StrikeWordmark },
};
