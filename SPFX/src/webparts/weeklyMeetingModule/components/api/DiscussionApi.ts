import { sp } from "@pnp/sp/presets/all";
import { IMeetingDiscussion } from "../interfaces/IDiscussion";
import { IInvitees } from "../interfaces/ICommon";
import { LIST_NAMES } from "../constants/ListNames";

function DiscussionApi() {
  const fetchAllDiscussions = async (
    sp: any
  ): Promise<IMeetingDiscussion[]> => {
    const data = await sp.web.lists
      .getByTitle(LIST_NAMES.ALL_DISCUSSIONS)
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
            id: item.AssignedTo.Id,
            title: item.AssignedTo.Title,
            email: item.AssignedTo.EMail,
          }
        : undefined,
      idOfProject: item.IdOfProject || "",
    }));
  };

  const createDiscussion = async (
    sp: any,
    discussion: IMeetingDiscussion,
    projectId: number
  ): Promise<void> => {
    await sp.web.lists.getByTitle(LIST_NAMES.ALL_DISCUSSIONS).items.add({
      Discussion: discussion.discussion,
      Decision: discussion.decision,
      DecidedTasks: discussion.decidedTasks,
      TargetDate: discussion.targetDate?.format("YYYY-MM-DD"),
      AssignedToId: discussion.assignedTo?.id,
      IdOfProject: projectId,
    });
  };

  return {
    fetchAllDiscussions,
    createDiscussion,
  };
}
export default DiscussionApi;
