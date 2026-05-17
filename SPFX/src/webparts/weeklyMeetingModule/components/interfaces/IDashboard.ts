import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IInvitees } from "../interfaces/ICommon";

export interface IMeeting {
  id: number;
  weekNo: string;
  startTime: string;
  endTime: string;
  invitees: IInvitees[];
  eventId: string;
  meetingStatus: string;
  author?: {
    id: number;
    title: string;
    email: string;
  };
}

export interface IDashboardProps {
  context: WebPartContext;
  refreshTrigger: number;
  onActionSuccess: (message: string) => void;
  access: boolean | null;
}
