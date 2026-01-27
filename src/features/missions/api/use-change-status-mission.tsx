import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ToastSuccess } from "@/components/ToastComponents";

type RequestType = InferRequestType<
    (typeof client.api.missions.statusMission)["$post"]
>;
type ResponseType = InferResponseType<
    (typeof client.api.missions.statusMission)["$post"]
>;

const useChangeStatusMission = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationKey: ["status_mission"],
        mutationFn: async ({ json }) => {
            const res = await client.api.missions.statusMission["$post"]({
                json,
            });

            if (!res.ok) {
                throw new Error("Failed to change the mission status!");
            }

            return res.json();
        },
        onSuccess: async ({ status }) => {
            await queryClient.invalidateQueries({ queryKey: ["Missions_ressource", "Missions_info_table"] });
            toast(<ToastSuccess toastTitle={(() => {
                if (status === 'en_cours') {
                    return "Mission démarrée"
                }
                if (status === 'echouees') {
                    return "Mission suspendue"
                }
                if (status === 'créer') {
                    return "Mission retourné"
                }
                if (status === 'terminees') {
                    return "Mission terminée"
                }
                return ""
            })()} />, {
                style: {
                    backgroundColor: "green",
                },
            });
            router.refresh();
        },
    });

    return mutation;
};

export default useChangeStatusMission;
