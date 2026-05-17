import { sp } from "@pnp/sp/presets/all";
import { LIST_NAMES } from "../constants/ListNames";
import { IMeetingDiscussion } from "../interfaces/IDiscussion";

export const fetchAllArchiveDiscussions = async (
  sp: any
): Promise<IMeetingDiscussion[]> => {
  const data = await sp.web.lists
    .getByTitle(LIST_NAMES.ALL_ARCHIVEDDISSCUSSION)
    .items.select(
      "Id",
      "Discussion",
      "Decision",
      "DecidedTasks",
      "TargetDate",
      "Created",
      "IdOfProject",
      "AssignedTo/Id",
      "AssignedTo/Title",
      "AssignedTo/EMail"
    )
    .expand("AssignedTo")
    .getAll();

  return data.map((item: any) => ({
    id: item.Id || 0,
    discussion: item.Discussion || "",
    decision: item.Decision || "",
    decidedTasks: item.DecidedTasks || "",
    targetDate: item.TargetDate || "",
    created: item.Created || "",
    assignedTo: item.AssignedTo
      ? {
          Id: item.AssignedTo.Id,
          Title: item.AssignedTo.Title,
          EMail: item.AssignedTo.EMail,
        }
      : undefined,
    idOfProject: item.IdOfProject || "",
  }));
};
