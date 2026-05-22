export const packs = {
  // place types in order of cheapest to most expensive
  types: {
    basic: ["kilo"],
    boosted: ["kilo", "mega"],
    turbo: ["kilo", "mega", "giga"],
    quantum: ["kilo", "giga", "tera"],
    singularity: ["kilo", "giga", "tera", "exa"],
  } as const,

  minPrice: 1000,
  maxPrice: 100000,

  cardCount: 5,
};
