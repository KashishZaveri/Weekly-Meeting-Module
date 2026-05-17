import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IArchiveDiscussions {
  id: number,
  projectName: string;
}

export interface IAllArchiveDiscussions {
  context: WebPartContext;
}


