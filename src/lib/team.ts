export type TeamMember = {
  id: string;
  nome: string;
  cargo: string;
  area: string;
  foto?: string;
};

export const TEAM_INDEX_PATH = "/team/index.json";

export const TEAM_AREAS = [
  "Diretoria",
  "Conselho Fiscal",
  "Conselho Deliberativo",
  "Colaboradores",
] as const;

export const initialTeam: TeamMember[] = [
  { id: "erica-cristina-chezini-mellotti", nome: "Érica Cristina Chezini Mellotti", cargo: "Presidente", area: "Diretoria" },
  { id: "erica-maria-acorsi-lima", nome: "Érica Maria Acorsi Lima", cargo: "Vice Presidente", area: "Diretoria" },
  { id: "juliana-fernanda-gemente-thome", nome: "Juliana Fernanda Gemente Thomé", cargo: "Secretária", area: "Diretoria" },
  { id: "natanael-jose-ribeiro", nome: "Natanael Jose Ribeiro", cargo: "Tesoureiro", area: "Diretoria" },
  { id: "cleide-delattore-nunes", nome: "Cleide Delattore Nunes", cargo: "Diretor de Patrimônio", area: "Diretoria" },
  { id: "vinicius-ferro-roberto", nome: "Vinicius Ferro Roberto", cargo: "Procurador Jurídico", area: "Diretoria" },
  { id: "rachel-de-almeida-calvo", nome: "Rachel de Almeida Calvo", cargo: "Presidente", area: "Conselho Deliberativo" },
  { id: "jansen-franco-branco", nome: "Jansen Franco Branco", cargo: "Vice Presidente", area: "Conselho Deliberativo" },
  { id: "vanessa-cristina-de-oliveira", nome: "Vanessa Cristina de Oliveira", cargo: "Secretária", area: "Conselho Deliberativo" },
  { id: "camila-reginato-pedro", nome: "Camila Reginato Pedro", cargo: "Conselheira", area: "Conselho Fiscal" },
  { id: "soraya-el-gharib-jorge-estevam", nome: "Soraya El Gharib Jorge Estevam", cargo: "Conselheira", area: "Conselho Fiscal" },
  { id: "luzia-trova", nome: "Luzia Trova", cargo: "Conselheira", area: "Conselho Fiscal" },
  { id: "julia-maria-dos-santos", nome: "Júlia Maria Dos Santos", cargo: "Coordenadora", area: "Colaboradores" },
  { id: "cristiane-lima-da-silva", nome: "Cristiane Lima da Silva", cargo: "Auxiliar Administrativo", area: "Colaboradores" },
  { id: "janaina-s-vieira-da-silva", nome: "Janaina S. Vieira Da Silva", cargo: "Psicóloga Institucional", area: "Colaboradores" },
  { id: "patricia-altieri", nome: "Patrícia Altieri", cargo: "Educadora Social", area: "Colaboradores" },
  { id: "patricia-peixoto-da-cruz", nome: "Patrícia Peixoto da Cruz", cargo: "Assistente Social", area: "Colaboradores" },
  { id: "ana-maria-rodrigues-da-silva", nome: "Ana Maria Rodrigues Da Silva", cargo: "Auxiliar de Educador", area: "Colaboradores" },
  { id: "jeane-tenorio-da-silva-sumida", nome: "Jeane Tenorio da Silva Sumida", cargo: "Auxiliar de Educador", area: "Colaboradores" },
  { id: "lourdes-pereira-da-silva", nome: "Lourdes Pereira da Silva", cargo: "Auxiliar de Educador", area: "Colaboradores" },
  { id: "maria-auxiliadora-da-silva", nome: "Maria Auxiliadora da Silva", cargo: "Auxiliar de Educador", area: "Colaboradores" },
  { id: "maria-benedita-de-oliveira-ribeiro", nome: "Maria Benedita de Oliveira Ribeiro", cargo: "Auxiliar de Educador", area: "Colaboradores" },
  { id: "valdeli-dos-santos-souza", nome: "Valdeli Dos Santos Souza", cargo: "Auxiliar de Educador", area: "Colaboradores" },
  { id: "silvana-batista-moura", nome: "Silvana Batista Moura", cargo: "Auxiliar de Cozinha", area: "Colaboradores" },
  { id: "karina-biaggio-roca-monti", nome: "Karina Biaggio Roca Monti", cargo: "Nutricionista", area: "Colaboradores" },
];

const getAreaRank = (area: string) => {
  const index = TEAM_AREAS.findIndex((item) => item === area);
  return index === -1 ? TEAM_AREAS.length : index;
};

export const compareTeamMembers = (a: TeamMember, b: TeamMember) =>
  getAreaRank(a.area) - getAreaRank(b.area);

export const groupTeamByArea = (team: TeamMember[]) =>
  Array.from(
    team.reduce<Map<string, TeamMember[]>>((groups, member) => {
      const members = groups.get(member.area) ?? [];
      members.push(member);
      groups.set(member.area, members);
      return groups;
    }, new Map()),
  )
    .sort(([areaA], [areaB]) => getAreaRank(areaA) - getAreaRank(areaB))
    .map(([area, membros]) => ({ area, membros }));

export const fetchPublicTeam = async (): Promise<TeamMember[]> => {
  const timestamp = Date.now();

  try {
    const apiResponse = await fetch(`/api/team.php?v=${timestamp}`, { cache: "no-store" });
    const contentType = apiResponse.headers.get("content-type") || "";

    if (apiResponse.ok && contentType.includes("application/json")) {
      const apiData = await apiResponse.json();
      if (Array.isArray(apiData?.equipe)) return apiData.equipe;
    }
  } catch {
    // Static hosting can serve the JSON directly without PHP.
  }

  const response = await fetch(`${TEAM_INDEX_PATH}?v=${timestamp}`, { cache: "no-store" });
  if (!response.ok) return [];

  const data = await response.json();
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.equipe) ? data.equipe : [];
};
