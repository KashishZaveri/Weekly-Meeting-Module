import { sp } from "@pnp/sp/presets/all";
import { IMeeting } from "../interfaces/IDashboard";
import { IInvitees } from "../interfaces/ICommon";
import { LIST_NAMES } from "../constants/ListNames";
import { MSGraphClientV3 } from "@microsoft/sp-http";

function MeetingApi() {
  const fetchLatestWeekMeetingToShowOnDashboard = async (): Promise<any> => {
    const data = await sp.web.lists
      .getByTitle(LIST_NAMES.ALL_MEETINGS)
      .items.select(
        "Id",
        "WeekNo",
        "StartTime",
        "EndTime",
        "Invitees/Id",
        "Invitees/Title",
        "EventId",
        "MeetingStatus",
        "Author/Id",
        "Author/Title",
        "Author/EMail"
      )
      .expand("Invitees", "Author")
      .orderBy("Id", false)
      .top(1)
      .get();

    const item = data[0];
    return {
      id: item.Id,
      weekNo: item.WeekNo,
      startTime: item.StartTime,
      endTime: item.EndTime,
      invitees:
        item.Invitees?.map((u: any) => ({ id: u.Id, title: u.Title })) || [],
      eventId: item.EventId,
      meetingStatus: item.MeetingStatus,
      author: item.Author
        ? {
            id: item.Author.Id,
            title: item.Author.Title,
            email: item.Author.EMail,
          }
        : null,
    };
  };

  const fetchMeetingForWeekFilter = async (week: string): Promise<any[]> => {
    try {
      const data = await sp.web.lists
        .getByTitle(LIST_NAMES.ALL_MEETINGS)
        .items.select(
          "Id",
          "WeekNo",
          "StartTime",
          "EndTime",
          "Invitees/Id",
          "Invitees/Title",
          "EventId",
          "MeetingStatus",
          "Author/Id",
          "Author/Title",
          "Author/EMail"
        )
        .filter(`WeekNo eq '${week.trim()}'`)
        .expand("Invitees", "Author")
        .get();

      return data.map((item: any) => ({
        id: item.Id,
        weekNo: item.WeekNo,
        startTime: item.StartTime,
        endTime: item.EndTime,
        invitees:
          item.Invitees?.map((u: any) => ({ id: u.Id, title: u.Title })) || [],
        eventId: item.EventId,
        meetingStatus: item.MeetingStatus,
        author: item.Author
          ? { id: item.Author.Id, title: item.Author, email: item.Author.EMail }
          : null,
      }));
    } catch (error) {
      console.error(`Error fetching meetings for week ${week}:`, error);
      throw error;
    }
  };

  const createMeetingInGraph = async (
    context: any,
    event: any
  ): Promise<string> => {
    const client: MSGraphClientV3 =
      await context.msGraphClientFactory.getClient("3");
    const response = await client
      .api("/me/events?sendNotifications=all")
      .post(event);

    console.log("Graph Response:", response);

    return response.id;
  };

  const createMeeting = async (
    context: any,
    sp: any,
    weekNo: string | number,
    startTime: string,
    endTime: string,
    invitees: IInvitees[]
  ): Promise<void> => {
    const emails = invitees
      .map((u: any) => u.email)
      .filter((email: string): email is string => !!email);

    const event = {
      subject: "Weekly Meeting",
      start: {
        dateTime: new Date(startTime).toISOString(),
        timeZone: "UTC",
      },
      end: {
        dateTime: new Date(endTime).toISOString(),
        timeZone: "UTC",
      },
      attendees: emails.map((email: string) => ({
        emailAddress: {
          address: email,
          name: email,
        },
        type: "required",
      })),

      isOnlineMeeting: true,
      onlineMeetingProvider: "teamsForBusiness",
    };

    const eventId = await createMeetingInGraph(context, event);
    const inviteeIds = invitees.map((u: IInvitees) => u?.id);
    console.log("Event Id: ", eventId);

    await sp.web.lists.getByTitle(LIST_NAMES.ALL_MEETINGS).items.add({
      WeekNo: weekNo,
      StartTime: startTime,
      EndTime: endTime,
      InviteesId: { results: inviteeIds },
      EventId: eventId,
    });
  };

  const handleCancleMeeting = async (
    context: any,
    sp: any,
    itemId: number,
    eventId: string
  ): Promise<void> => {
    try {
      const client = await context.msGraphClientFactory.getClient("3");

      if (eventId) {
        await client.api(`/me/events/${eventId}`).delete();
      }

      await sp.web.lists
        .getByTitle(LIST_NAMES.ALL_MEETINGS)
        .items.getById(itemId)
        .update({
          MeetingStatus: "Cancelled",
        });

      console.log("Meeting cancelled successfully!");
    } catch (error) {
      console.log("Error in cancelling meeting: ", error);
    }
  };

  const updateMeeting = async (
    context: any,
    sp: any,
    id: number,
    weekNo: string | number,
    startTime: string,
    endTime: string,
    eventId: string,
    invitees: IInvitees[]
  ): Promise<void> => {
    const client: MSGraphClientV3 =
      await context.msGraphClientFactory.getClient("3");

    const existingEvent = await client
      .api(`/me/events/${eventId}`)
      .select("attendees")
      .get();
    const currentAttendees = existingEvent.attendees || [];

    const updatedAttendees = invitees.map((invitee) => {
      const existing = currentAttendees.find(
        (a: any) =>
          a.emailAddress.address.toLowerCase() === invitee.email.toLowerCase()
      );
      if (existing) {
        return existing;
      } else {
        return {
          emailAddress: {
            address: invitee.email,
            name: invitee.title || invitee.email,
          },
          type: "required",
        };
      }
    });
    const emails = invitees
      .map((u) => u.email)
      .filter((email): email is string => !!email);
    const event = {
      subject: "Weekly Meeting",
      start: {
        dateTime: new Date(startTime).toISOString(),
        timeZone: "UTC",
      },
      end: {
        dateTime: new Date(endTime).toISOString(),
        timeZone: "UTC",
      },
      attendees: updatedAttendees,
      isOnlineMeeting: true,
      onlineMeetingProvider: "teamsForBusiness",
    };

    console.log("Updating Event ID:", eventId);
    console.log("Attendees:", emails);

    if (eventId) {
      await client.api(`/me/events/${eventId}?sendUpdates=none`).patch(event);
    } else {
      console.log("Event id missing skip graph update!");
    }

    console.log("Graph meeting updated successfully!");

    const inviteeIds = invitees.map((u) => u?.id);

    await sp.web.lists
      .getByTitle(LIST_NAMES.ALL_MEETINGS)
      .items.getById(id)
      .update({
        WeekNo: weekNo.toString(),
        StartTime: startTime,
        EndTime: endTime,
        InviteesId: { results: inviteeIds },
      });
    console.log("Sharepoint updated successfully!");
  };

  const fetchAcceptedInvitees = async (
    context: any,
    eventId: string,
    authorEmail?: string
  ): Promise<string[]> => {
    if (!eventId) return [];

    try {
      const client: MSGraphClientV3 =
        await context.msGraphClientFactory.getClient("3");

      const endpoint = authorEmail
        ? `/users/${authorEmail}/events/${eventId}`
        : `/me/events/${eventId}`;

      const response = await client.api(endpoint).select("attendees").get();

      if (!response || !response.attendees) return [];

      return response.attendees
        .filter((a: any) => a.status.response === "accepted")
        .map((a: any) => a.emailAddress.name || a.emailAddress.address);
    } catch (error: any) {
      if (
        error.message?.indexOf("not found") !== -1 ||
        error.statusCode === 404
      ) {
        console.warn(
          `Meeting with EventId ${eventId} not found in current user's calendar.`
        );
      } else {
        console.error("Error fetching Graph attendees:", error);
      }
      return [];
    }
  };

  return {
    fetchLatestWeekMeetingToShowOnDashboard,
    fetchMeetingForWeekFilter,
    createMeeting,
    updateMeeting,
    handleCancleMeeting,
    fetchAcceptedInvitees,
  };
}
export default MeetingApi;
