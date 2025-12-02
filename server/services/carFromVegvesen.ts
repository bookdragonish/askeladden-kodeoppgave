const VEGVESEN_BASE_URL =
  "https://kjoretoyoppslag.atlas.vegvesen.no/ws/no/vegvesen/kjoretoy/kjoretoyoppslag/v1/kjennemerkeoppslag/kjoretoy/";

// Adjust the fields to match the actual Vegvesen JSON structure
type VegvesenResponse = {
  registrering?: {
    forstegangsregistrering?: string; // "2015-12-18"
  };
  tekniskKjoretoy?: {
    merke?: string; // "KIA"
    handelsbetegnelse?: string; // "SOUL"
    typebetegnelse?: string; // "PSEV"
    karosseri?: {
      farge?: string; // "Svart"
    };
  };
};

export async function fetchCarInfoFromVegvesen(regNr: string) {

  const res = await fetch(
    VEGVESEN_BASE_URL + encodeURIComponent(regNr.toUpperCase())
  );
  

  if (!res.ok) {
    throw new Error(`Vegvesen API error: ${res.status}`);
  }

  const data = (await res.json()) as VegvesenResponse;

  const tech = data.tekniskKjoretoy;
  const reg = data.registrering;

  const make = tech?.merke ?? "Ukjent";
  const model = tech?.handelsbetegnelse ?? tech?.typebetegnelse ?? "Ukjent";
  const color = tech?.karosseri?.farge ?? "Ukjent";

  let year = 0;
  if (reg?.forstegangsregistrering) {
    const yearStr = reg.forstegangsregistrering.slice(0, 4);
    const parsed = Number(yearStr);
    if (!Number.isNaN(parsed)) {
      year = parsed;
    }
  }

  console.log(make, model, year, color)
  return { make, model, year, color };
}
