"use client";

import { Galaxy } from "./galaxy";
import "./hero-object.css";

export function HeroObject(): React.JSX.Element | null {
  return <Galaxy view="oblique" />;
}
