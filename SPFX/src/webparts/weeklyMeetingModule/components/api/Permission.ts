export const checkUserAccess = async (sp: any): Promise<boolean> => {
  try {
    const groups = await sp.web.currentUser.groups();
    const allowedGroupIds = [19];
    const hasAccess = groups.some(
      (groups: any) => allowedGroupIds.indexOf(groups.Id) !== -1
    );
    return hasAccess;
  } catch (error) {
    console.error("Error checking user groups", error);
    return false;
  }
};