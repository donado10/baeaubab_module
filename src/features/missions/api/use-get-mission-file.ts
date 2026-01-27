import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

const useGetMissionDocument = (fileID: string) => {
  const query = useQuery({
    queryKey: ["mission_document"],
    queryFn: async () => {
      const response = await client.api.missions.file[":fileID"].$get({
        param: { fileID: fileID },
      });

      if (!response.ok) {
        throw new Error("error when downloading mission file");
      }

      return await response.json();
    },
  });

  return query;
};

export default useGetMissionDocument;
