import { sp } from "@pnp/sp/presets/all";
import { WebPartContext } from "@microsoft/sp-webpart-base"; 

export const getSP = (context: WebPartContext) => {
  if (context) {
    sp.setup({
      spfxContext: context as any,
    });
  }
  return sp;
};
