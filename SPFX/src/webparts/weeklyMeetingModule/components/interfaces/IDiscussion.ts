import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IInvitees } from "../interfaces/ICommon";
import dayjs, { Dayjs } from "dayjs";
import { IParticipants } from "./IParticipants";


export interface IProject {
  id: number;
  projectName: string;
  projectDescription: string;
  startDate: string;
  endDate: string;
  projectStatus: string;
  projectSiteURL: {
    Url: string;
    Description?: string;
  } | null;
  projectId: number;
  projectManager: IInvitees;
  context: WebPartContext;
}

export interface IAllProjectsProps {
  context: WebPartContext;
  refreshTrigger: number;
  onSuccess: (message: string) => void;
  access: boolean | null;
}

export interface IMeetingDiscussion {
  id?: number;
  discussion: string;
  decision: string;
  decidedTasks: string;
  assignedTo?: IInvitees;
  targetDate: Dayjs | null;
  idOfProject: number;
  created: Date;
}

export interface IProjectCardProps {
  project: IProject;
  participants: IParticipants[]; 
  discussions: IMeetingDiscussion[];
  showAddDiscussion?: boolean | null;
  onOpenHistory: (project: IProject) => void;
  variant: "active" | "archive";
  context: WebPartContext;
  onSuccess?: (msg: string) => void;
}



export interface IDiscussionDrawerProps {
  open: boolean;
  onClose: () => void;
  project: IProject | null;
  discussions: IMeetingDiscussion[];
  showWeekFilter?: boolean;
  weekFilterValue?: string;
  onWeekFilterChange?: (value: string) => void;
}
