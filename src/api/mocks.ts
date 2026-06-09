import { Article, Category, Journalist, Program, Quote, Episode } from '@/types';

export const mockCategories: Category[] = [
  { id: '1', name: 'Política y Geopolítica', slug: 'politica', color: '#DC2626' },
  { id: '2', name: 'Análisis y Opinión', slug: 'analisis', color: '#c82022' },
  { id: '3', name: 'Economía e Internacional', slug: 'economia', color: '#EAB308' },
  { id: '4', name: 'Sucesos y Eventos', slug: 'sucesos', color: '#0A0A0A' },
  { id: '5', name: 'Cultura y Tecnología', slug: 'cultura', color: '#2563EB' },
  { id: '6', name: 'Deportes y Salud', slug: 'deportes', color: '#EA580C' },
  { id: '7', name: 'Virales y Farándula', slug: 'virales', color: '#9333EA' },
];

export const mockJournalists: Journalist[] = [
  {
    id: 'j1',
    slug: 'miguel-perez-pirela',
    name: 'Miguel Pérez Pirela',
    role: 'Director y Conductor',
    bio: 'Filósofo y analista político venezolano. Director de Laiguana.tv.',
    avatarUrl: 'https://ui-avatars.com/api/?name=Miguel+Perez+Pirela&background=15803D&color=fff&size=200',
    programIds: ['p2'],
  },
  {
    id: 'j2',
    slug: 'clodovaldo-hernandez',
    name: 'Clodovaldo Hernández',
    role: 'Analista Político',
    bio: 'Periodista con amplia experiencia en política.',
    avatarUrl: 'https://ui-avatars.com/api/?name=Clodovaldo+Hernandez&background=DC2626&color=fff&size=200',
    programIds: ['p1'],
  },
  {
    id: 'j3',
    slug: 'indira-urbaneja',
    name: 'Indira Urbaneja',
    role: 'Analista',
    bio: 'Experta en geopolítica y relaciones internacionales.',
    avatarUrl: 'https://ui-avatars.com/api/?name=Indira+Urbaneja&background=EAB308&color=fff&size=200',
    programIds: ['p1'],
  },
  {
    id: 'j4',
    slug: 'william-castillo',
    name: 'William Castillo',
    role: 'Comunicador',
    bio: 'Analista político y comunicador venezolano.',
    avatarUrl: 'https://ui-avatars.com/api/?name=William+Castillo&background=2563EB&color=fff&size=200',
    programIds: ['p1'],
  },
  {
    id: 'j5',
    slug: 'esther-quiaro',
    name: 'Esther Quiaro',
    role: 'Periodista',
    bio: 'Comunicadora destacada en análisis nacional.',
    avatarUrl: 'https://ui-avatars.com/api/?name=Esther+Quiaro&background=7C3AED&color=fff&size=200',
    programIds: ['p1'],
  },
  {
    id: 'j6',
    slug: 'ernesto-navarro',
    name: 'Ernesto J. Navarro',
    role: 'Conductor',
    bio: 'Periodista y escritor venezolano.',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    programIds: ['p4'],
  },
  {
    id: 'j7',
    slug: 'alberto-alvarado',
    name: 'Alberto Alvarado',
    role: 'Conductor',
    bio: 'Experto en resistencia comunicacional.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    programIds: ['p3'],
  },
];

export const mockQuotes: Quote[] = [
  { symbol: 'USD-BCV', label: 'USD BCV', value: 36.42, change: 0.15, updatedAt: new Date().toISOString() },
  { symbol: 'USD-PARALELO', label: 'Euros BCV', value: 39.55, change: 0.8, updatedAt: new Date().toISOString() },
  { symbol: 'WTI', label: 'Petróleo WTI', value: 82.3, change: -1.2, updatedAt: new Date().toISOString() },
  { symbol: 'PATRIA', label: 'Bono Guerra', value: 3200, change: 0, updatedAt: new Date().toISOString() },
];

export const mockPrograms: Program[] = [
  {
    id: 'p1',
    slug: 'los-mediodias',
    name: 'Los Mediodías de La Iguana',
    description: 'Análisis profundos, entrevistas a comunicadores y expertos, debates sobre política, economía, cultura y estrategia.',
    imageUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&q=80',
    schedule: 'Diario, lunes a viernes 1:00 PM',
    hostIds: ['j4', 'j2', 'j3', 'j5'],
    episodeCount: 350,
  },
  {
    id: 'p2',
    slug: 'la-iguana-al-dia',
    name: 'La Iguana al Día',
    description: 'Las noticias clave del día con análisis y contexto.',
    imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&q=80',
    schedule: 'Diario 6:00 PM',
    hostIds: ['j1'],
    episodeCount: 520,
  },
  {
    id: 'p3',
    slug: 'esto-no-es-un-misil',
    name: 'Esto No es un Misil',
    description: 'Espacio de lucha y resistencia comunicacional ante los ataques al país.',
    imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&q=80',
    schedule: 'Jueves 8:30 AM',
    hostIds: ['j7'],
    episodeCount: 85,
  },
  {
    id: 'p4',
    slug: 'el-sofa',
    name: 'El Sofá',
    description: 'Diálogo ameno y cultura. Lo positivo de Venezuela a través de personajes emblemáticos, valores y cultura.',
    imageUrl: 'https://images.unsplash.com/photo-1567593810070-7a3d471af022?w=600&q=80',
    schedule: 'Sábados 9:00 PM',
    hostIds: ['j6'],
    episodeCount: 110,
  },
  {
    id: 'p5',
    slug: 'desde-donde-sea',
    name: 'Desde Donde Sea',
    description: 'Reportes desde el terreno, corresponsales internacionales y voces de la calle.',
    imageUrl: 'https://images.unsplash.com/photo-1485579149621-3123dd979885?w=600&q=80',
    schedule: 'Semanal',
    hostIds: [],
    episodeCount: 142,
  },
  {
    id: 'p6',
    slug: 'aqui-y-ahora',
    name: 'Aquí y Ahora',
    description: 'Lo más importante del momento, en tiempo real.',
    imageUrl: 'https://images.unsplash.com/photo-1581368087028-58c14d9d3a6f?w=600&q=80',
    schedule: 'Diario',
    hostIds: [],
    episodeCount: 400,
  },
  {
    id: 'p7',
    slug: 'tubazos',
    name: 'Tubazos',
    description: 'Las exclusivas y revelaciones del momento.',
    imageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&q=80',
    schedule: 'Diario',
    hostIds: [],
    episodeCount: 200,
  },
  {
    id: 'p8',
    slug: 'entre-lineas',
    name: 'Entre Líneas',
    description: 'Lo que se dice y lo que no se dice en las noticias internacionales.',
    imageUrl: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=600&q=80',
    schedule: 'Semanal',
    hostIds: [],
    episodeCount: 150,
  },
];

const audioUrls = [
  'https://download.samplelib.com/mp3/sample-15s.mp3',
  'https://download.samplelib.com/mp3/sample-12s.mp3',
  'https://download.samplelib.com/mp3/sample-9s.mp3',
  'https://download.samplelib.com/mp3/sample-6s.mp3',
  'https://download.samplelib.com/mp3/sample-3s.mp3',
];

export const mockEpisodes: Episode[] = mockPrograms.flatMap((p) =>
  Array.from({ length: 5 }).map((_, i) => ({
    id: `e-${p.id}-${i}`,
    programId: p.id,
    title: `${p.name} - Episodio ${p.episodeCount - i}`,
    description: `Disfruta de este excelente episodio de ${p.name} con debates, análisis de la actualidad y mucho más.`,
    publishedAt: new Date(
      Date.now() - 3600000 * 24 * i * (p.schedule.includes('Diario') ? 1 : 7),
    ).toISOString(),
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    audioUrl: audioUrls[i % audioUrls.length],
    thumbnailUrl: p.imageUrl,
    durationSeconds: [900, 720, 540, 360, 180][i % 5],
  })),
);

const nH = () => new Date(Date.now() - Math.floor(Math.random() * 72 * 3600000)).toISOString();

const generateBody = (title: string, excerpt: string, categoryName: string) =>
  `Caracas. ${excerpt}\n\nEn el marco de la coyuntura actual de ${categoryName}, el tema de "${title}" ha generado amplias reacciones tanto a nivel nacional como internacional. Las autoridades y analistas han manifestado que este hecho es fundamental para entender el desarrollo de los acontecimientos en los últimos días.\n\nPuntos Clave\n\nExpertos en la materia señalan que los recientes acontecimientos forman parte de una agenda más amplia. "Estamos viendo un panorama que impactará directamente en el desarrollo político, económico y social de las próximas semanas", declaró este miércoles un especialista consultado por la redacción.\n\n"${excerpt} Esta es la realidad que enfrentamos hoy, y así lo asumimos."\n\nA medida que se desarrollan los hechos, el equipo multiplataforma de Laiguana.tv continuará brindando una cobertura ininterrumpida y análisis profundos sobre cada uno de los detalles y sus implicaciones para la sociedad venezolana.`;

const rawArticles: Article[] = [
  { id: 'a1', slug: 'presidenta-delcy-rodriguez-crecimiento', title: 'Presidenta Delcy Rodríguez destaca crecimiento económico y nuevos acuerdos de gran escala', subtitle: 'Reuniones de alto nivel buscan concretar acuerdos comerciales.', excerpt: 'La presidenta de la República resaltó las cifras alentadoras y el plan de desarrollo productivo que impulsará el futuro del país.', body: '', category: mockCategories[0], tags: ['Economía', 'Gobierno'], author: mockJournalists[4], publishedAt: nH(), updatedAt: nH(), imageUrl: 'https://gbvm.knoios.com/mmedia/20523/eeuu-reconoce-a-delcy-rodriguez-como-presidenta-de-venezuela-cortesia-57519.jpg', readingTimeMinutes: 5, isBreaking: true, isExclusive: true, relatedArticleIds: [], url: '/a1' },
  { id: 'a2', slug: 'ministro-miguel-perez-pirela-comunicacion', title: 'Ministro de Comunicación Miguel Pérez Pirela anuncia avances históricos en el modelo de comunicación nacional', excerpt: 'El titular de la cartera de Comunicación destacó la democratización de la información y la modernización de los medios.', body: '', category: mockCategories[0], tags: ['Comunicación', 'Medios'], author: mockJournalists[0], publishedAt: nH(), updatedAt: nH(), imageUrl: 'https://avn.info.ve/wp-content/uploads/2026/02/Pirela.jpg', readingTimeMinutes: 4, isBreaking: false, isExclusive: false, relatedArticleIds: [], url: '/a2' },
  { id: 'a3', slug: 'elecciones-eeuu', title: 'Tensión en EEUU: Cómo las elecciones impactarán la política exterior hacia Latinoamérica', excerpt: 'Analistas advierten sobre posibles cambios drásticos dependiendo del resultado.', body: '', category: mockCategories[0], tags: ['EEUU', 'Elecciones'], author: mockJournalists[2], publishedAt: nH(), updatedAt: nH(), imageUrl: 'https://gbvm.knoios.com/mmedia/20523/eeuu-reconoce-a-delcy-rodriguez-como-presidenta-de-venezuela-cortesia-57519.jpg', readingTimeMinutes: 6, isBreaking: false, isExclusive: false, relatedArticleIds: [], url: '/a3' },
  { id: 'a4', slug: 'china-comercio', title: 'China y Venezuela firman nuevos protocolos de cooperación tecnológica', excerpt: 'El gigante asiático invertirá en infraestructura de telecomunicaciones nacional.', body: '', category: mockCategories[0], tags: ['China', 'Alianzas'], author: mockJournalists[4], publishedAt: nH(), updatedAt: nH(), imageUrl: 'https://politikaucab.net/wp-content/uploads/2025/04/chi-1.jpg?w=1024', readingTimeMinutes: 3, isBreaking: false, isExclusive: false, relatedArticleIds: [], url: '/a4' },
  { id: 'a5', slug: 'oriente-medio-paz', title: 'Venezuela exige en la ONU un cese al fuego inmediato en el Oriente Medio', excerpt: 'El canciller venezolano urgió a la comunidad internacional a tomar medidas.', body: '', category: mockCategories[0], tags: ['ONU', 'Oriente Medio'], author: mockJournalists[3], publishedAt: nH(), updatedAt: nH(), imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoGkAKElLpH1L6-om1VCC9O72KZfnkiD-hkA&s', readingTimeMinutes: 4, isBreaking: false, isExclusive: false, relatedArticleIds: [], url: '/a5' },
  { id: 'a6', slug: 'petroleo-rusia', title: 'Rusia y Venezuela coordinan estrategias energéticas para estabilizar el mercado petrolero', excerpt: 'Ambos países buscan mantener el equilibrio de precios.', body: '', category: mockCategories[0], tags: ['Rusia', 'Petróleo'], author: mockJournalists[4], publishedAt: nH(), updatedAt: nH(), imageUrl: 'https://consuladorusiaadhgye.ec/wp-content/uploads/2023/04/1.jpg', readingTimeMinutes: 5, isBreaking: false, isExclusive: false, relatedArticleIds: [], url: '/a6' },
  { id: 'a7', slug: 'ley-antifascismo', title: 'Asamblea Nacional avanza en segunda discusión de la Ley contra el Fascismo', excerpt: 'Parlamentarios debaten los artículos clave de esta nueva legislación.', body: '', category: mockCategories[0], tags: ['AN', 'Legislación'], author: mockJournalists[3], publishedAt: nH(), updatedAt: nH(), imageUrl: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&q=80&auto=format&fit=crop', readingTimeMinutes: 7, isBreaking: false, isExclusive: false, relatedArticleIds: [], url: '/a7' },
  { id: 'a8', slug: 'dialogo-oposicion', title: 'Mesa de diálogo: Acuerdos preliminares sobre el cronograma electoral', excerpt: 'Participantes del proceso indican avances significativos.', body: '', category: mockCategories[0], tags: ['Política', 'Elecciones'], author: mockJournalists[4], publishedAt: nH(), updatedAt: nH(), imageUrl: 'https://images.unsplash.com/photo-1576267423048-15c0040fec78?w=800&q=80&auto=format&fit=crop', readingTimeMinutes: 3, isBreaking: false, isExclusive: false, relatedArticleIds: [], url: '/a8' },
  { id: 'a9', slug: 'perez-pirela-analisis', title: 'La desesperación imperial: Por qué atacan ahora', subtitle: 'Un análisis de fondo sobre las últimas maniobras extranjeras.', excerpt: 'El movimiento de las potencias obedece a una crisis interna estructural.', body: '', category: mockCategories[1], tags: ['Análisis', 'Imperio'], author: mockJournalists[0], publishedAt: nH(), updatedAt: nH(), imageUrl: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=80&auto=format&fit=crop', readingTimeMinutes: 8, isBreaking: false, isExclusive: true, relatedArticleIds: [], url: '/a9' },
  { id: 'a10', slug: 'clodovaldo-economia', title: 'Las verdades de la recuperación económica que los medios ocultan', excerpt: 'Cifras en mano, revisamos el impacto real de las políticas recientes.', body: '', category: mockCategories[1], tags: ['Economía', 'Análisis'], author: mockJournalists[1], publishedAt: nH(), updatedAt: nH(), imageUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80&auto=format&fit=crop', readingTimeMinutes: 5, isBreaking: false, isExclusive: false, relatedArticleIds: [], url: '/a10' },
  { id: 'a11', slug: 'indira-geopolitica', title: 'El nuevo orden mundial ya está aquí', excerpt: 'La hegemonía unipolar ha dado paso a un tablero mucho más complejo.', body: '', category: mockCategories[1], tags: ['Geopolítica', 'BRICS'], author: mockJournalists[2], publishedAt: nH(), updatedAt: nH(), imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80&auto=format&fit=crop', readingTimeMinutes: 6, isBreaking: false, isExclusive: false, relatedArticleIds: [], url: '/a11' },
  { id: 'a12', slug: 'william-castillo-medios', title: 'Guerra cognitiva y medios digitales', excerpt: 'Cómo se construyen matrices de opinión para desestabilizar naciones.', body: '', category: mockCategories[1], tags: ['Medios', 'Comunicación'], author: mockJournalists[3], publishedAt: nH(), updatedAt: nH(), imageUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&q=80&auto=format&fit=crop', readingTimeMinutes: 7, isBreaking: false, isExclusive: false, relatedArticleIds: [], url: '/a12' },
  { id: 'a13', slug: 'esther-quiaro-social', title: 'El rol de las comunidades en la defensa de los servicios', excerpt: 'La organización popular como eje central de la nueva política.', body: '', category: mockCategories[1], tags: ['Comunidades', 'Poder Popular'], author: mockJournalists[4], publishedAt: nH(), updatedAt: nH(), imageUrl: 'https://images.unsplash.com/photo-1595805562095-2ac5d15a95ef?w=800&q=80&auto=format&fit=crop', readingTimeMinutes: 4, isBreaking: false, isExclusive: false, relatedArticleIds: [], url: '/a13' },
  { id: 'a14', slug: 'bcv-intervencion', title: 'BCV inyecta $65 millones a la banca para contener tipo de cambio', excerpt: 'Buscan mantener la estabilidad del bolívar tras picos recientes.', body: '', category: mockCategories[2], tags: ['BCV', 'Dólar'], author: mockJournalists[4], publishedAt: nH(), updatedAt: nH(), imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80&auto=format&fit=crop', readingTimeMinutes: 3, isBreaking: false, isExclusive: false, relatedArticleIds: [], url: '/a14' },
  { id: 'a15', slug: 'petroleo-wti', title: 'Barril de petróleo superó los $85 empujado por tensiones en Medio Oriente', excerpt: 'El mercado energético reacciona a los recientes eventos geopolíticos.', body: '', category: mockCategories[2], tags: ['Petróleo', 'Internacional'], author: mockJournalists[2], publishedAt: nH(), updatedAt: nH(), imageUrl: 'https://images.unsplash.com/photo-1581093588267-28562d46e9df?w=800&q=80&auto=format&fit=crop', readingTimeMinutes: 4, isBreaking: false, isExclusive: false, relatedArticleIds: [], url: '/a15' },
  { id: 'a16', slug: 'pago-bonos', title: 'Atentos: Inició el pago del bono de Guerra Económica a través de Patria', excerpt: 'Usuarios reportan la acreditación progresiva del beneficio mensual.', body: '', category: mockCategories[2], tags: ['Bonos', 'Patria'], author: mockJournalists[3], publishedAt: nH(), updatedAt: nH(), imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80&auto=format&fit=crop', readingTimeMinutes: 2, isBreaking: false, isExclusive: false, relatedArticleIds: [], url: '/a16' },
  { id: 'a17', slug: 'sanciones-eeuu', title: 'EEUU reconsidera esquema de licencias petroleras ante demanda global', excerpt: 'La necesidad de crudo pesado obliga a Washington a ser pragmático.', body: '', category: mockCategories[2], tags: ['Sanciones', 'EEUU'], author: mockJournalists[1], publishedAt: nH(), updatedAt: nH(), imageUrl: 'https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?w=800&q=80&auto=format&fit=crop', readingTimeMinutes: 5, isBreaking: false, isExclusive: false, relatedArticleIds: [], url: '/a17' },
  { id: 'a18', slug: 'exportaciones-no-tradicionales', title: 'Exportaciones no tradicionales de Venezuela crecen un 15% interanual', excerpt: 'Cacao, camarones y productos manufacturados lideran el repunte.', body: '', category: mockCategories[2], tags: ['Comercio', 'Economía'], author: mockJournalists[4], publishedAt: nH(), updatedAt: nH(), imageUrl: 'https://images.unsplash.com/photo-1591033594798-33227a05780d?w=800&q=80&auto=format&fit=crop', readingTimeMinutes: 3, isBreaking: false, isExclusive: false, relatedArticleIds: [], url: '/a18' },
  { id: 'a19', slug: 'clima-lluvias', title: 'Onda tropical genera fuertes precipitaciones en la región central del país', excerpt: 'Autoridades recomiendan precaución en zonas vulnerables.', body: '', category: mockCategories[3], tags: ['Clima', 'Lluvias'], author: mockJournalists[4], publishedAt: nH(), updatedAt: nH(), imageUrl: 'https://images.unsplash.com/photo-1583912267550-d6c2ac3196c0?w=800&q=80&auto=format&fit=crop', readingTimeMinutes: 2, isBreaking: false, isExclusive: false, relatedArticleIds: [], url: '/a19' },
  { id: 'a20', slug: 'incautacion-drogas', title: 'GNB incautó más de 1.5 toneladas de estupefacientes en operativo fronterizo', excerpt: 'Un duro golpe a las mafias del narcotráfico transnacional.', body: '', category: mockCategories[3], tags: ['GNB', 'Seguridad'], author: mockJournalists[3], publishedAt: nH(), updatedAt: nH(), imageUrl: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=800&q=80&auto=format&fit=crop', readingTimeMinutes: 3, isBreaking: true, isExclusive: false, relatedArticleIds: [], url: '/a20' },
  { id: 'a21', slug: 'rescate-exitoso', title: 'Rescatados a salvo pescadores tras 48 horas a la deriva', excerpt: 'Fueron localizados por guardacostas cerca de Los Roques.', body: '', category: mockCategories[3], tags: ['Rescate', 'Sucesos'], author: mockJournalists[4], publishedAt: nH(), updatedAt: nH(), imageUrl: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80&auto=format&fit=crop', readingTimeMinutes: 2, isBreaking: false, isExclusive: false, relatedArticleIds: [], url: '/a21' },
  { id: 'a22', slug: 'accidente-vial', title: 'Aparatoso choque múltiple en la ARC generó gran congestionamiento', excerpt: 'No se reportaron víctimas fatales, pero sí daños materiales severos.', body: '', category: mockCategories[3], tags: ['Tránsito', 'Sucesos'], author: mockJournalists[3], publishedAt: nH(), updatedAt: nH(), imageUrl: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=800&q=80&auto=format&fit=crop', readingTimeMinutes: 2, isBreaking: false, isExclusive: false, relatedArticleIds: [], url: '/a22' },
  { id: 'a23', slug: 'festival-teatro', title: 'Inaugurado por todo lo alto el Festival Internacional de Teatro Progresista', excerpt: 'Compañías de más de 20 países se dan cita en Caracas.', body: '', category: mockCategories[4], tags: ['Cultura', 'Teatro'], author: mockJournalists[4], publishedAt: nH(), updatedAt: nH(), imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80&auto=format&fit=crop', readingTimeMinutes: 4, isBreaking: false, isExclusive: false, relatedArticleIds: [], url: '/a23' },
  { id: 'a24', slug: 'ia-educacion', title: 'Implementarán programas de Inteligencia Artificial en escuelas técnicas', excerpt: 'El proyecto busca modernizar el currículo educativo.', body: '', category: mockCategories[4], tags: ['Tecnología', 'Educación'], author: mockJournalists[2], publishedAt: nH(), updatedAt: nH(), imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80&auto=format&fit=crop', readingTimeMinutes: 5, isBreaking: false, isExclusive: false, relatedArticleIds: [], url: '/a24' },
  { id: 'a25', slug: 'feria-libro', title: 'La FILVEN recibe cifra récord de visitantes en su primera semana', excerpt: 'Toda una fiesta cultural para los amantes de la lectura.', body: '', category: mockCategories[4], tags: ['Libros', 'Cultura'], author: mockJournalists[4], publishedAt: nH(), updatedAt: nH(), imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80&auto=format&fit=crop', readingTimeMinutes: 3, isBreaking: false, isExclusive: false, relatedArticleIds: [], url: '/a25' },
  { id: 'a26', slug: 'vinotinto-victoria', title: '¡Goleada histórica! La Vinotinto brilla en casa rumbo al Mundial', excerpt: 'Con un fútbol impecable, Venezuela domina a su rival.', body: '', category: mockCategories[5], tags: ['Fútbol', 'Vinotinto'], author: mockJournalists[4], publishedAt: nH(), updatedAt: nH(), imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80&auto=format&fit=crop', readingTimeMinutes: 4, isBreaking: false, isExclusive: false, relatedArticleIds: [], url: '/a26' },
  { id: 'a27', slug: 'juegos-olimpicos', title: 'Atletas venezolanos aseguran nuevos cupos para París', excerpt: 'El ciclo olímpico avanza con buenas perspectivas para nuestra delegación.', body: '', category: mockCategories[5], tags: ['Deportes', 'Olimpiadas'], author: mockJournalists[3], publishedAt: nH(), updatedAt: nH(), imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80&auto=format&fit=crop', readingTimeMinutes: 3, isBreaking: false, isExclusive: false, relatedArticleIds: [], url: '/a27' },
  { id: 'a28', slug: 'vacunacion-nacional', title: 'Ministerio de Salud despliega jornada nacional de vacunación', excerpt: 'Más de 500 puntos activos en todo el territorio nacional.', body: '', category: mockCategories[5], tags: ['Salud', 'Prevención'], author: mockJournalists[4], publishedAt: nH(), updatedAt: nH(), imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80&auto=format&fit=crop', readingTimeMinutes: 3, isBreaking: false, isExclusive: false, relatedArticleIds: [], url: '/a28' },
  { id: 'a29', slug: 'concierto-caracas', title: 'Locura total por venta de entradas para esperado concierto en La Rinconada', excerpt: 'Fanáticos acampan desde días antes para conseguir los mejores puestos.', body: '', category: mockCategories[6], tags: ['Música', 'Conciertos'], author: mockJournalists[4], publishedAt: nH(), updatedAt: nH(), imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80&auto=format&fit=crop', readingTimeMinutes: 2, isBreaking: false, isExclusive: false, relatedArticleIds: [], url: '/a29' },
  { id: 'a30', slug: 'video-viral-mascotas', title: 'El tierno video de un perro rescatista que está conquistando las redes', excerpt: 'Se volvió viral tras ayudar en labores de búsqueda.', body: '', category: mockCategories[6], tags: ['Virales', 'Redes Sociales'], author: mockJournalists[4], publishedAt: nH(), updatedAt: nH(), imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80&auto=format&fit=crop', readingTimeMinutes: 2, isBreaking: false, isExclusive: false, relatedArticleIds: [], url: '/a30' },
];

export const mockArticles: Article[] = rawArticles.map((a) => ({
  ...a,
  body: generateBody(a.title, a.excerpt, a.category.name),
}));
