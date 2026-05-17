**Part of**: Project Management System for Construction Company
**Built at**: In intership at EaseTeq Software Solutions, Vadodara
**Tech Stack**: SPFx · React · TypeScript · PnPjs v3 · Material UI · Power Automate · SharePoint Online · Microsoft Graph API

**Overview**
The Weekly Meetings Module is a custom SharePoint Framework (SPFx) web part developed as part of an enterprise-grade Project Management System for a construction company. It provides a structured, digital platform for scheduling recurring weekly project governance meetings, managing live discussion points, and archiving resolved decisions — replacing a completely manual, email-based meeting process that had no audit trail or traceability.

SharePoint Online provides a built-in calendar and Microsoft Teams has meeting functionality — so **why** build a custom web part?
The answer lies in the specific operational needs of a construction project environment:
SharePoint's native lists and calendar views do not support the concept of project-scoped weekly governance cycles with linked discussion boards and archival workflows. A custom web part was the only way to enforce this structure within the company's existing Microsoft 365 tenant — without additional licensing costs or third-party tools.

**Features & Functionality**

* Meeting Scheduling
- Create weekly meetings with title, date, start time, end time, and invitee list (via Azure AD PeoplePicker)
- Meetings are tagged with an ISO week number (e.g., 2026-W18) for structured weekly filtering
- Edit and update meeting details after creation
- Meeting status management: Upcoming → Completed
- Meetings are stored in the All Meetings SharePoint list

* Discussion Board
- Add discussion points for any project, including:
- Discussion topic (full text)
- Decision reached
- Action items decided
- Person assigned (AssignedTo — Azure AD user)
- Target completion date

* Discussion Archival
- Once a project is completed Archived discussions are viewable in a dedicated Archive tab, filterable by project and week.

*Role-Based Access Control (RBAC)
- Meeting creation and editing is restricted to HR SharePoint group members only
- Employees (Viewer role) can view meetings and discussions but cannot create or modify them
- The Create Meeting button is not rendered at all for non-authorized roles (not just disabled)

*Future Enhancements
- Microsoft Teams Integration — Embed the module as a Teams tab for field access
- Microsoft Copilot — Natural language query interface for meeting history ("What was decided about material X in Week 12?")
- Action Item Status Tracking (Post Target Date Follow-up)
Currently, discussion points track what was decided and who is responsible, but have no mechanism to verify whether the action was actually completed. This enhancement would add an ActionStatus field (Completed / Pending) to the All Discussions list. A scheduled Power Automate flow would run daily, automatically flagging items as Overdue when their TargetDate has passed without resolution. HR would then update the status after follow-up, closing the accountability loop. The system reminds the responsible person via email automatically when their task is overdue — so HR doesn't have to manually chase everyone, and no task gets forgotten.

This module was solely designed and developed by me(Kashish Zaveri) as part of the internship at EaseTeq Software Solutions (Jan–Apr 2026). The remaining three modules (Project Creation, Leave Management, Timesheet & Material Logging) were developed collaboratively by the team.
