import { sp } from "@pnp/sp/presets/all";
import { IProject } from "../interfaces/IDiscussion";
import { LIST_NAMES } from "../constants/ListNames";

function ProjectApi () {
 const fetchInProgressStopProjects = async (
  sp: any
): Promise<IProject[]> => {
  const data = await sp.web.lists
    .getByTitle(LIST_NAMES.PROJECT_MASTER)
    .items.select(
      "Id",
      "ProjectName",
      "ProjectDescription",
      "StartDate",
      "EndDate",
      "ProjectStatus",
      "ProjectSiteURL/Url",
      "ProjectSiteURL/Description",
      "ProjectId",
      "ProjectManager/Id",
      "ProjectManager/Title",
      "ProjectManager/EMail"
    )
    .filter("ProjectStatus eq 'InProgress' or ProjectStatus eq 'Stop'")
    .expand("ProjectManager")
    .getAll();

  return data.map((item: any) => ({
    id: item.Id || 0,
    projectName: item.ProjectName || "",
    projectDescription: item.ProjectDescription || "",
    startDate: item.StartDate || null,
    endDate: item.EndDate || null,
    projectStatus: item.ProjectStatus || "",
    projectSiteURL: item.ProjectSiteURL
      ? {
          Url: item.ProjectSiteURL.Url,
          Description: item.ProjectSiteURL.Description || "",
        }
      : null,
    projectId: item.ProjectId,
    projectManager: item.ProjectManager
      ? {
          id: item.ProjectManager?.Id,
          title: item.ProjectManager?.Title,
          email: item.ProjectManager?.EMail,
        }
      : undefined,
  }));
};

 const fetchCompletedProjects = async (sp: any): Promise<IProject[]> => {
  const data = await sp.web.lists
    .getByTitle(LIST_NAMES.PROJECT_MASTER)
    .items.select(
      "Id",
      "ProjectName",
      "ProjectDescription",
      "StartDate",
      "EndDate",
      "ProjectStatus",
      "ProjectSiteURL/Url",
      "ProjectSiteURL/Description",
      "ProjectId",
      "ProjectManager/Id",
      "ProjectManager/Title",
      "ProjectManager/EMail"
    )
    .filter("ProjectStatus eq 'Completed'")
    .expand("ProjectManager")
    .getAll();

  return data.map((item: any) => ({
    id: item.Id || 0,
    projectName: item.ProjectName || "",
    projectDescription: item.ProjectDescription || "",
    startDate: item.StartDate || null,
    endDate: item.EndDate || null,
    projectStatus: item.ProjectStatus || "",
    projectSiteURL: item.ProjectSiteURL
      ? {
          Url: item.ProjectSiteURL.Url,
          Description: item.ProjectSiteURL.Description || "",
        }
      : null,
    projectId: item.ProjectId,
    projectManager: item.ProjectManager
      ? {
          id: item.ProjectManager?.Id,
          title: item.ProjectManager?.Title,
          email: item.ProjectManager?.EMail,
        }
      : undefined,
  }));
};
 return {
  fetchInProgressStopProjects,
    fetchCompletedProjects,
 };
}
export default ProjectApi;