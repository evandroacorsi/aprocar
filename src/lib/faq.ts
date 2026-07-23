export type FaqItem = {
  id: string;
  pergunta: string;
  resposta: string;
};

export const FAQ_INDEX_PATH = "/faq/index.json";

export const fetchPublicFaq = async (): Promise<FaqItem[]> => {
  const timestamp = Date.now();

  try {
    const apiResponse = await fetch(`/api/faq.php?v=${timestamp}`, { cache: "no-store" });
    const contentType = apiResponse.headers.get("content-type") || "";

    if (apiResponse.ok && contentType.includes("application/json")) {
      const apiData = await apiResponse.json();
      if (Array.isArray(apiData?.perguntas)) return apiData.perguntas;
    }
  } catch {
    // Static hosting can serve the JSON directly without PHP.
  }

  const response = await fetch(`${FAQ_INDEX_PATH}?v=${timestamp}`, { cache: "no-store" });
  if (!response.ok) return [];

  const data = await response.json();
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.perguntas) ? data.perguntas : [];
};
