import { LinkCarDriverContext } from "@/features/drivers/components/context/link-car-driver";
import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";

export const useGetCarByMarqueID = (marqueID: string) => {
  const linkCarDriverCtx = useContext(LinkCarDriverContext);
  const query = useQuery({
    queryKey: ["cars_marqueID", linkCarDriverCtx.processItem?.marque],
    queryFn: async () => {
      if (!marqueID) {
        return { result: [] };
      }

      const response = await client.api.cars.marque[":marqueID"].$get({
        param: { marqueID },
      });

      if (!response.ok) {
        throw new Error("error when getting the cars by marque");
      }

      return await response.json();
    },
  });

  return query;
};
export const useGetMarqueCar = () => {
  const query = useQuery({
    queryKey: ["car_marque"],
    queryFn: async () => {
      const response = await client.api.cars.marques.$get({});

      if (!response.ok) {
        throw new Error("error when getting the car marque");
      }

      return await response.json();
    },
  });

  return query;
};
