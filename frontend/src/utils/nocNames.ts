/**
 * Maps IOC/NOC codes to their commonly-known display names.
 * Keys are official IOC 3-letter codes stored in the dataset.
 */
const NOC_NAMES: Record<string, string> = {
    URS: 'USSR',
    GDR: 'East Germany',
    FRG: 'West Germany',
    TCH: 'Czechoslovakia',
    YUG: 'Yugoslavia',
    SCG: 'Serbia & Montenegro',
    ANZ: 'Australasia',
    BOH: 'Bohemia',
    RU1: 'Russian Empire',
    EUA: 'Unified Germany',
    EUN: 'Unified Team',
    IOP: 'Independent',
    ROC: 'Russia (ROC)',
    TTO: 'Trinidad & Tobago',
    GBR: 'Great Britain',
    USA: 'United States',
    CHN: 'China',
    GER: 'Germany',
    AUS: 'Australia',
    FRA: 'France',
    ITA: 'Italy',
    NED: 'Netherlands',
    SWE: 'Sweden',
    NOR: 'Norway',
    FIN: 'Finland',
    HUN: 'Hungary',
    ROU: 'Romania',
    BUL: 'Bulgaria',
    CUB: 'Cuba',
    KOR: 'South Korea',
    JPN: 'Japan',
    CAN: 'Canada',
};

/** Return the display name for a NOC code, or the code itself if not mapped. */
export function nocName(code: string): string {
    return NOC_NAMES[code] ?? code;
}
