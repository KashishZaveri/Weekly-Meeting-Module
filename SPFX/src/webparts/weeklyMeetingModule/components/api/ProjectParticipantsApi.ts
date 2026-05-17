import { sp } from "@pnp/sp/presets/all";
import {IParticipants} from "../interfaces/IParticipants";
import {LIST_NAMES} from "../constants/ListNames";

export const fetchAllProjectParticipants = async(sp: any): Promise<IParticipants[]> => {
    const data = await sp.web.lists.getByTitle(LIST_NAMES.ALL_PARTICIPANTS).items
        .select(
            "Id",
            "Role",
            "Participant",
            "ProjectId/Id",
            "ProjectId/ProjectId",
        )
        .expand("ProjectId")
        .getAll();

    return data.map((item: any) => ({
        id: item.Id || 0,
        projectId: {
            id: item.ProjectId?.Id,
            projectId: item.ProjectId?.ProjectId,
        },
        role: item.Role || "",
        participant: item.Participant || "",
    }));
};