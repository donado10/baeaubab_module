import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

const useGetCarDocument = (fileID: string) => {
  const query = useQuery({
    queryKey: ["car_document"],
    queryFn: async () => {
      const response = await client.api.cars.file[":fileID"].$get({
        param: { fileID: fileID },
      });

      if (!response.ok) {
        throw new Error("error when downloading car file");
      }

      return await response.json();
    },
  });

  return query;
};

export default useGetCarDocument;
