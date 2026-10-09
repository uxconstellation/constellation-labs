import type { ComponentType } from "react";
import type { ProductSlug } from "@/content/products";
import AcreScene from "./AcreScene";
import PinpointsScene from "./PinpointsScene";
import PrismScene from "./PrismScene";
import NodScene from "./NodScene";
import type { ScenePieceProps } from "./Scene";

export const SCENES: Record<ProductSlug, ComponentType<ScenePieceProps>> = {
  acre: AcreScene,
  pinpoints: PinpointsScene,
  prism: PrismScene,
  nod: NodScene,
};
