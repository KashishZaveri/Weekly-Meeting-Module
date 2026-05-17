import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IPeoplePickerContext } from "@pnp/spfx-controls-react/lib/PeoplePicker";

export const buildPeoplePickerContext = (
  context: WebPartContext
): IPeoplePickerContext => ({
  absoluteUrl: context.pageContext.web.absoluteUrl,
  spHttpClient: context.spHttpClient as any,
  msGraphClientFactory: context.msGraphClientFactory as any,
});

