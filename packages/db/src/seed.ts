import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { randomUUID } from "crypto";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5435/marriage";

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client, { schema });

async function seed() {
  console.log("Seeding database...");

  // Clean in reverse FK order
  await db.delete(schema.giftContributions);
  await db.delete(schema.guestMembers);
  await db.delete(schema.guests);
  await db.delete(schema.photos);
  await db.delete(schema.gifts);
  await db.delete(schema.media);
  await db.delete(schema.pages);
  await db.delete(schema.siteConfig);

  // --- Guests ---
  const guestData = [
    {
      id: randomUUID(),
      token: "silva-family-token-001",
      familyName: "Familia Silva",
      phone: "+5542999110001",
      language: "pt-BR",
      members: [
        { name: "Joao Silva", isPrimary: true, ageGroup: "adult" as const },
        { name: "Maria Silva", isPrimary: false, ageGroup: "adult" as const },
        { name: "Pedro Silva", isPrimary: false, ageGroup: "child" as const },
      ],
    },
    {
      id: randomUUID(),
      token: "oliveira-family-token-002",
      familyName: "Familia Oliveira",
      phone: "+5542999110002",
      language: "pt-BR",
      members: [
        { name: "Carlos Oliveira", isPrimary: true, ageGroup: "adult" as const },
        { name: "Ana Oliveira", isPrimary: false, ageGroup: "adult" as const },
        { name: "Lucas Oliveira", isPrimary: false, ageGroup: "child" as const },
        { name: "Sofia Oliveira", isPrimary: false, ageGroup: "infant" as const },
      ],
    },
    {
      id: randomUUID(),
      token: "santos-couple-token-003",
      familyName: "Familia Santos",
      phone: "+5542999110003",
      language: "pt-BR",
      members: [
        { name: "Roberto Santos", isPrimary: true, ageGroup: "adult" as const },
        { name: "Patricia Santos", isPrimary: false, ageGroup: "adult" as const },
      ],
    },
    {
      id: randomUUID(),
      token: "costa-single-token-004",
      familyName: "Fernanda Costa",
      phone: "+5542999110004",
      language: "pt-BR",
      members: [
        { name: "Fernanda Costa", isPrimary: true, ageGroup: "adult" as const },
      ],
    },
    {
      id: randomUUID(),
      token: "smith-family-token-005",
      familyName: "Smith Family",
      phone: "+14155550005",
      email: "john@smith.com",
      language: "en",
      members: [
        { name: "John Smith", isPrimary: true, ageGroup: "adult" as const },
        { name: "Sarah Smith", isPrimary: false, ageGroup: "adult" as const },
      ],
    },
    {
      id: randomUUID(),
      token: "garcia-family-token-006",
      familyName: "Familia Garcia",
      phone: "+5491155550006",
      language: "es",
      members: [
        { name: "Miguel Garcia", isPrimary: true, ageGroup: "adult" as const },
        { name: "Isabella Garcia", isPrimary: false, ageGroup: "adult" as const },
        { name: "Mateo Garcia", isPrimary: false, ageGroup: "child" as const },
      ],
    },
    {
      id: randomUUID(),
      token: "pereira-single-token-007",
      familyName: "Bruno Pereira",
      phone: "+5542999110007",
      language: "pt-BR",
      members: [
        { name: "Bruno Pereira", isPrimary: true, ageGroup: "adult" as const },
      ],
    },
    {
      id: randomUUID(),
      token: "lima-family-token-008",
      familyName: "Familia Lima",
      phone: "+5542999110008",
      language: "pt-BR",
      members: [
        { name: "Marcos Lima", isPrimary: true, ageGroup: "adult" as const },
        { name: "Julia Lima", isPrimary: false, ageGroup: "adult" as const },
        { name: "Rafael Lima", isPrimary: false, ageGroup: "child" as const },
        { name: "Camila Lima", isPrimary: false, ageGroup: "child" as const },
      ],
    },
    {
      id: randomUUID(),
      token: "almeida-couple-token-009",
      familyName: "Familia Almeida",
      phone: "+5542999110009",
      language: "pt-BR",
      members: [
        { name: "Thiago Almeida", isPrimary: true, ageGroup: "adult" as const },
        { name: "Larissa Almeida", isPrimary: false, ageGroup: "adult" as const },
      ],
    },
    {
      id: randomUUID(),
      token: "ribeiro-single-token-010",
      familyName: "Camila Ribeiro",
      phone: "+5542999110010",
      language: "pt-BR",
      members: [
        { name: "Camila Ribeiro", isPrimary: true, ageGroup: "adult" as const },
      ],
    },
  ];

  for (const guest of guestData) {
    const { members, ...guestRow } = guest;
    await db.insert(schema.guests).values(guestRow);
    for (let i = 0; i < members.length; i++) {
      await db.insert(schema.guestMembers).values({
        guestId: guest.id,
        name: members[i]!.name,
        isPrimary: members[i]!.isPrimary,
        ageGroup: members[i]!.ageGroup,
        sortOrder: i,
      });
    }
  }
  console.log(`  Inserted ${guestData.length} guests with members`);

  // --- Gifts ---
  const giftsData = [
    { namePt: "Jogo de Panelas", nameEn: "Cookware Set", nameEs: "Juego de Ollas", descriptionPt: "Jogo completo de panelas antiaderentes", priceCents: 45000, category: "kitchen", sortOrder: 0 },
    { namePt: "Jogo de Toalhas", nameEn: "Towel Set", nameEs: "Juego de Toallas", descriptionPt: "Kit com 8 toalhas de banho e rosto", priceCents: 25000, category: "bedroom", sortOrder: 1 },
    { namePt: "Cafeteira Expresso", nameEn: "Espresso Machine", nameEs: "Cafetera Expreso", descriptionPt: "Cafeteira automatica com moedor", priceCents: 120000, category: "kitchen", sortOrder: 2 },
    { namePt: "Jogo de Cama Queen", nameEn: "Queen Bed Set", nameEs: "Juego de Cama Queen", descriptionPt: "Lencois 400 fios com edredom", priceCents: 80000, category: "bedroom", sortOrder: 3 },
    { namePt: "Liquidificador", nameEn: "Blender", nameEs: "Licuadora", descriptionPt: "Liquidificador profissional de alta potencia", priceCents: 35000, category: "kitchen", sortOrder: 4 },
    { namePt: "Aspirador Robot", nameEn: "Robot Vacuum", nameEs: "Aspiradora Robot", descriptionPt: "Aspirador autonomo com mapeamento", priceCents: 200000, category: "kitchen", sortOrder: 5 },
    { namePt: "Jantar Romantico", nameEn: "Romantic Dinner", nameEs: "Cena Romantica", descriptionPt: "Jantar especial para dois em restaurante premium", priceCents: 50000, category: "experience", sortOrder: 6 },
    { namePt: "Travesseiros Ortopedicos", nameEn: "Orthopedic Pillows", nameEs: "Almohadas Ortopedicas", descriptionPt: "Par de travesseiros viscoelasticos", priceCents: 30000, category: "bedroom", sortOrder: 7 },
    { namePt: "Viagem Lua de Mel", nameEn: "Honeymoon Trip", nameEs: "Viaje de Luna de Miel", descriptionPt: "Contribua para nossa lua de mel dos sonhos", priceCents: 500000, category: "travel", sortOrder: 8 },
    { namePt: "Air Fryer", nameEn: "Air Fryer", nameEs: "Freidora de Aire", descriptionPt: "Fritadeira eletrica digital grande", priceCents: 40000, category: "kitchen", sortOrder: 9 },
    { namePt: "Jogo de Talheres", nameEn: "Cutlery Set", nameEs: "Juego de Cubiertos", descriptionPt: "Faqueiro completo para 12 pessoas", priceCents: 35000, category: "kitchen", sortOrder: 10 },
    { namePt: "Cobertor King", nameEn: "King Blanket", nameEs: "Cobija King", descriptionPt: "Cobertor macio tamanho king", priceCents: 20000, category: "bedroom", sortOrder: 11 },
    { namePt: "Dia no Spa", nameEn: "Spa Day", nameEs: "Dia de Spa", descriptionPt: "Dia relaxante com massagem para dois", priceCents: 60000, category: "experience", sortOrder: 12 },
    { namePt: "Processador de Alimentos", nameEn: "Food Processor", nameEs: "Procesador de Alimentos", descriptionPt: "Processador multifuncional com acessorios", priceCents: 55000, category: "kitchen", sortOrder: 13 },
    { namePt: "Kit Vinho", nameEn: "Wine Kit", nameEs: "Kit de Vinos", descriptionPt: "Selecao de 6 vinhos premiados", priceCents: 45000, category: "experience", sortOrder: 14 },
  ];

  await db.insert(schema.gifts).values(giftsData);
  console.log(`  Inserted ${giftsData.length} gifts`);

  // --- Photos ---
  // Photos are uploaded via the admin panel (S3/MinIO).
  // No seed data needed — use the gallery admin to upload photos.
  console.log(`  Skipped photos (upload via admin panel)`);

  // --- Pages ---
  const pagesData = [
    {
      slug: "dress-code",
      titlePt: "Traje",
      titleEn: "Dress Code",
      titleEs: "Codigo de Vestimenta",
      contentPt: "## Traje Esporte Fino\n\nPara o nosso casamento, sugerimos traje **esporte fino**.\n\n### Para elas\n- Vestido midi ou longo\n- Cores claras ou terrosas\n- Evitar branco e off-white\n\n### Para eles\n- Camisa social com calca de alfaiataria\n- Blazer opcional\n- Sapato social",
      contentEn: "## Smart Casual\n\nFor our wedding, we suggest **smart casual** attire.\n\n### For her\n- Midi or long dress\n- Light or earthy tones\n- Please avoid white and off-white\n\n### For him\n- Dress shirt with tailored trousers\n- Blazer optional\n- Dress shoes",
      contentEs: "## Semi-formal\n\nPara nuestra boda, sugerimos vestimenta **semi-formal**.\n\n### Para ellas\n- Vestido midi o largo\n- Tonos claros o terrosos\n- Evitar blanco y crudo\n\n### Para ellos\n- Camisa de vestir con pantalon de vestir\n- Blazer opcional\n- Zapatos de vestir",
      icon: "\uD83D\uDC54",
      published: true,
      sortOrder: 0,
    },
    {
      slug: "accommodation",
      titlePt: "Hospedagem",
      titleEn: "Accommodation",
      titleEs: "Hospedaje",
      contentPt: "## Onde Ficar\n\nSeparamos algumas opcoes de hospedagem proximas ao local do evento.\n\n### Hotel Exemplo\n- 15 min do local do evento\n- (00) 0000-0000\n\n### Pousada Exemplo\n- 10 min do local do evento\n- (00) 0000-0000\n\n### Hotel Centro\n- 20 min do local do evento\n- Reservas pelo app",
      contentEn: "## Where to Stay\n\nHere are some accommodation options near the venue.\n\n### Example Hotel\n- 15 min from the venue\n- +00 00 0000-0000\n\n### Example Inn\n- 10 min from the venue\n- +00 00 0000-0000\n\n### Downtown Hotel\n- 20 min from the venue\n- Book via app",
      contentEs: "## Donde Hospedarse\n\nAqui hay algunas opciones de alojamiento cerca del evento.\n\n### Hotel Ejemplo\n- 15 min del lugar del evento\n- +00 00 0000-0000\n\n### Posada Ejemplo\n- 10 min del lugar del evento\n- +00 00 0000-0000\n\n### Hotel Centro\n- 20 min del lugar del evento\n- Reserva por la app",
      icon: "\uD83C\uDFE8",
      published: true,
      sortOrder: 1,
    },
    {
      slug: "directions",
      titlePt: "Como Chegar",
      titleEn: "How to Get There",
      titleEs: "Como Llegar",
      contentPt: "## Como Chegar ao Local\n\n**Endereco:** Endereco do evento\n\n### De carro\n- Siga o link de mapa na pagina inicial\n- Estacionamento no local\n\n### De aviao\n- Aeroporto mais proximo da sua regiao\n- Distancia e tempo variam\n\n### Transporte\n- Consulte os noivos para opcoes de traslado",
      contentEn: "## How to Get There\n\n**Address:** Event address\n\n### By car\n- Use the map link on the home page\n- Parking available on site\n\n### By plane\n- Choose the nearest airport for your trip\n- Distance and time may vary\n\n### Shuttle\n- Contact the couple for transfer options",
      contentEs: "## Como Llegar\n\n**Direccion:** Direccion del evento\n\n### En auto\n- Usa el enlace del mapa en la pagina inicial\n- Estacionamiento disponible\n\n### En avion\n- Elige el aeropuerto mas cercano para tu viaje\n- La distancia y el tiempo pueden variar\n\n### Transporte\n- Consulta con la pareja las opciones de traslado",
      icon: "\uD83D\uDCCD",
      published: true,
      sortOrder: 2,
    },
  ];

  await db.insert(schema.pages).values(pagesData);
  console.log(`  Inserted ${pagesData.length} pages`);

  // --- Site Config ---
  const configData = [
    { key: "couple_name_1", value: "Partner 1" },
    { key: "couple_name_2", value: "Partner 2" },
    { key: "event_date", value: "2026-12-31" },
    { key: "event_time", value: "16:00" },
    { key: "venue_name", value: "Wedding Venue" },
    { key: "venue_address", value: "123 Celebration Street, Your City" },
    { key: "venue_google_maps_url", value: null },
    { key: "google_maps_embed_url", value: null },
    { key: "venue_waze_url", value: null },
    { key: "pix_key", value: "email@example.com" },
    { key: "pix_name", value: "Partner 1 e Partner 2" },
    { key: "pix_city", value: "Sua cidade" },
    { key: "stripe_enabled", value: "false" },
    { key: "pix_enabled", value: "true" },
    { key: "rsvp_enabled", value: "true" },
    { key: "gifts_enabled", value: "true" },
    { key: "gallery_enabled", value: "true" },
    { key: "max_plus_ones", value: "4" },
    { key: "currency_code", value: "BRL" },
    { key: "currency_locale", value: "pt-BR" },
    { key: "contact_phone", value: "+55 00 00000-0000" },
    { key: "contact_email", value: "wedding@example.com" },
    { key: "rsvp_deadline", value: "2026-12-01" },
    {
      key: "hero_subtitle_pt",
      value: "convidam você para celebrar, com amor, o início de sua história como um só",
    },
    {
      key: "hero_subtitle_en",
      value: "invite you to celebrate, with love, the beginning of their story as one",
    },
    {
      key: "hero_subtitle_es",
      value: "los invitan a celebrar, con amor, el inicio de su historia como uno solo",
    },
  ];

  await db.insert(schema.siteConfig).values(configData);
  console.log(`  Inserted ${configData.length} site config entries`);

  console.log("Seed complete!");
  await client.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
