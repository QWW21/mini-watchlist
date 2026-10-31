export type Instrument = {
  ticker: string;
  name: string;
  sector: string;
  startCents: number;
};

const row = (
  ticker: string,
  name: string,
  sector: string,
  startCents: number,
): Instrument => ({ ticker, name, sector, startCents });

/** Every company here is made up. */
export const INSTRUMENTS: readonly Instrument[] = [
  row('ACME', 'Acme Industries', 'Industrials', 12345),
  row('NOVA', 'Nova Semiconductors', 'Technology', 48720),
  row('ORBT', 'Orbit Aerospace', 'Industrials', 8915),
  row('LUMN', 'Lumina Energy', 'Energy', 3260),
  row('QBIT', 'Qubit Computing', 'Technology', 21075),
  row('HLTH', 'Hale Health Group', 'Healthcare', 15640),
  row('BRKN', 'Bracken Foods', 'Consumer', 5430),
  row('VRDE', 'Verde Renewables', 'Energy', 2785),
  row('FLUX', 'Flux Robotics', 'Technology', 9310),
  row('MRDN', 'Meridian Bank', 'Financials', 6750),
  row('CRUX', 'Crux Pharma', 'Healthcare', 18290),
  row('TIDE', 'Tidewater Shipping', 'Industrials', 4120),
  row('ZEPH', 'Zephyr Airlines', 'Consumer', 1985),
  row('PIXL', 'Pixel Forge Games', 'Technology', 7640),
  row('AURM', 'Aurum Mining', 'Materials', 3875),
  row('CDAR', 'Cedar Timber', 'Materials', 2240),
  row('HVST', 'Harvest Agri', 'Consumer', 4590),
  row('SLNT', 'Silent Networks', 'Technology', 13120),
  row('KEEL', 'Keel Insurance', 'Financials', 8460),
  row('BOLT', 'Bolt Motors', 'Consumer', 27350),
  row('GRID', 'Gridline Utilities', 'Utilities', 5125),
  row('WAVE', 'Wave Telecom', 'Telecom', 2960),
  row('ONYX', 'Onyx Materials', 'Materials', 6380),
  row('PEAK', 'Peak Outdoor', 'Consumer', 3715),
  row('RUNE', 'Rune Software', 'Technology', 34210),
  row('MOSS', 'Moss Biotech', 'Healthcare', 1240),
  row('ANVL', 'Anvil Steel', 'Materials', 2895),
  row('FERN', 'Fernwood Homes', 'Real Estate', 7120),
  row('DUNE', 'Dune Oil & Gas', 'Energy', 5680),
  row('HALO', 'Halo Optics', 'Technology', 11940),
  row('IVRY', 'Ivory Capital', 'Financials', 16385),
  row('JADE', 'Jade Cosmetics', 'Consumer', 4275),
  row('KITE', 'Kite Logistics', 'Industrials', 6010),
  row('LARK', 'Lark Media', 'Telecom', 1875),
  row('MAPL', 'Maple Beverages', 'Consumer', 5345),
  row('NEST', 'Nest Property Trust', 'Real Estate', 3490),
  row('OPAL', 'Opal Payments', 'Financials', 22760),
  row('PINE', 'Pine Paper', 'Materials', 1560),
  row('QUIL', 'Quill Publishing', 'Telecom', 2130),
  row('RIDG', 'Ridgeline Rail', 'Industrials', 9875),
  row('SAGE', 'Sage Diagnostics', 'Healthcare', 7290),
  row('THRN', 'Thorn Security', 'Technology', 14530),
  row('UMBR', 'Umbra Solar', 'Energy', 980),
  row('VALE', 'Vale Water', 'Utilities', 4410),
  row('WREN', 'Wren Retail', 'Consumer', 2675),
  row('XENO', 'Xeno Therapeutics', 'Healthcare', 31420),
  row('YARR', 'Yarrow Foods', 'Consumer', 1725),
  row('ZINC', 'Zinc Batteries', 'Materials', 8140),
  row('ARCH', 'Archway Finance', 'Financials', 10265),
  row('BEAM', 'Beam Lasers', 'Technology', 19850),
];
