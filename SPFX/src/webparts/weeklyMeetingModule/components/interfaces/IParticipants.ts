import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IParticipants {
  id: number;
  projectId: {
    id: number;
    projectId: number;
  };
  role: string;
  participant: string;
}
