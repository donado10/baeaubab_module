import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

const useGetDriverDocument = (fileID: string) => {
  const query = useQuery({
    queryKey: ["driver_document"],
    queryFn: async () => {
      const response = await client.api.drivers.file[":fileID"].$get({
        param: { fileID: fileID },
      });

      if (!response.ok) {
        throw new Error("error when downloading driver file");
      }

      return await response.json();
    },
  });

  return query;
};

export default useGetDriverDocument;
