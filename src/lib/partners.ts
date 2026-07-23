export type Partner = {
  id: string;
  nome: string;
  foto?: string;
  link?: string;
};

export const PARTNERS_INDEX_PATH = "/partners/index.json";

export const fetchPublicPartners = async (): Promise<Partner[]> => {
  const timestamp = Date.now();

  try {
    const apiResponse = await fetch(`/api/partners.php?v=${timestamp}`, { cache: "no-store" });
    const contentType = apiResponse.headers.get("content-type") || "";

    if (apiResponse.ok && contentType.includes("application/json")) {
      const apiData = await apiResponse.json();
      if (Array.isArray(apiData?.parceiros)) return apiData.parceiros;
    }
  } catch {
    // Static hosting can serve the JSON directly without PHP.
  }

  const response = await fetch(`${PARTNERS_INDEX_PATH}?v=${timestamp}`, { cache: "no-store" });
  if (!response.ok) return [];

  const data = await response.json();
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.parceiros) ? data.parceiros : [];
};
