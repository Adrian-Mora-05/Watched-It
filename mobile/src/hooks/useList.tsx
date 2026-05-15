import { useEffect, useState } from "react";
import { getMovieLists, getShowLists } from "@/services/list.service";

export function useLists(
  token: string,
  userId: string,
  type: "movies" | "shows"
) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLists = async () => {
    try {
      const res =
        type === "movies"
          ? await getMovieLists(token, { skip: 0, limit: 20, sort_order: "desc" })
          : await getShowLists(token, { skip: 0, limit: 20, sort_order: "desc" });

      setData(res.lists);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !userId) return;
    fetchLists();
  }, [token, userId, type]);

  return { data, loading, refetch: fetchLists };
}