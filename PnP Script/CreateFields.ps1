# Created Meeting List

Add-PnPField -List "All Meetings" -DisplayName "Start Time" `
    -InternalName "StartTime" -Type DateTime -AddToDefaultView -Required

Add-PnPField -List "All Meetings" -DisplayName "End Time" `
    -InternalName "EndTime" -Type DateTime -AddToDefaultView -Required

Add-PnPField  -List "All Meetings" -DisplayName "Week No" `
    -InternalName "WeekNo" -Type Text -AddToDefaultView -Required

Add-PnPField -List "All Meetings" -DisplayName "Invitees" `
    -InternalName "Invitees" -Type User -AddToDefaultView -Required

Add-PnPField -List "All Meetings" -DisplayName "Invite Accepted By" `
    -InternalName "InviteAcceptedBy" -Type User -AddToDefaultView  

Add-PnPField -List "All Meetings" -DisplayName "Event Id" `
    -InternalName "EventId" -Type Text -AddToDefaultView -Required

Add-PnPField -List "All Meetings" -DisplayName "Meeting Status" `
    -InternalName "MeetingStatus" -Type Choice `
    -Choices "Active", "Cancelled" -AddToDefaultView

Add-PnPField -List "All Meetings" -DisplayName "Soft Delete" `
    -InternalName "SoftDelete" -Type Boolean -AddToDefaultView 

#Project Master list
Add-PnPField -List "Project Master" -DisplayName "Project Id" `
    -InternalName "ProjectId" -Type Number -Required

Add-PnPField -List "Project Master" -DisplayName "Project Participant Id" `
    -InternalName "ProjectParticipantId" -Type Number -Required

Add-PnPField -List "Project Master" -DisplayName "Project Name" `
    -InternalName "ProjectName" -Type Text -Required

Add-PnPField -List "Project Master" -DisplayName "Project Description" `
    -InternalName "ProjectDescription" -Type Note -Required
 
Add-PnPField -List "Project Master" -DisplayName "Start Date" `
    -InternalName "StartDate" -Type DateTime -Required
 
Add-PnPField -List "Project Master" -DisplayName "End Date" `
    -InternalName "EndDate" -Type DateTime
 
Add-PnPField -List "Project Master" -DisplayName "Project Status" `
    -InternalName "ProjectStatus" -Type Choice `
    -Choices "InProgress", "Completed", "Stop" -Required


    Add-PnPField -List "Project Master" -DisplayName "Project Manager" `
    -InternalName "ProjectManager" -Type User -AddToDefaultView -Required 

Add-PnPField -List "Project Master" -DisplayName "Project Site URL" `
    -InternalName "ProjectSiteURL" -Type URL
    
Add-PnPField -List "Project Master" -DisplayName "Soft Delete" `
    -InternalName "SoftDelete" -Type Boolean -AddToDefaultView 
 
# All Dicussions list

Add-PnPField  -List "All Discussions" -DisplayName "Discussion" -InternalName "Discussion" -Type Note -AddToDefaultView

Add-PnPField  -List "All Discussions" -DisplayName "Decision" -InternalName "Decision" -Type Note -AddToDefaultView

Add-PnPField  -List "All Discussions" -DisplayName "Decided Tasks" -InternalName "DecidedTasks" -Type Note -AddToDefaultView

Add-PnPField -List "All Discussions" -DisplayName "Assigned To" -InternalName "AssignedTo" -Type User -AddToDefaultView 

Add-PnPField -List "All Discussions" -DisplayName "Target Date" -InternalName "TargetDate" -Type Text -AddToDefaultView 

Add-PnPField -List "All Discussions" -DisplayName "Id of Project" -InternalName "IdOfProject" -Type Number -AddToDefaultView 

Add-PnPField -List "All Discussions" -DisplayName "Soft Delete" -InternalName "SoftDelete" -Type Boolean -AddToDefaultView 

# Prject Member list
Add-PnPField -List "All Project Partcipants" -DisplayName "Project Id" `
    -InternalName "ProjectId" -Type Lookup -Required -AddToDefaultView

Add-PnPField -List "All Project Partcipants" -DisplayName "Role" `
    -InternalName "Role" -Type Text -Required -AddToDefaultView

Add-PnPField -List "All Project Partcipants" -DisplayName "Participant" `
    -InternalName "Participant" -Type Text -Required -AddToDefaultView

Add-PnPField -List "All Project Partcipants" -DisplayName "Project Participant Id" `
    -InternalName "ProjectParticipantId" -Type Number -Required -AddToDefaultView

# Archive Project participant List fields
Add-PnPField -List "All Archive Project Partcipants" -DisplayName "Project Id" `
    -InternalName "ProjectId" -Type Lookup -Required -AddToDefaultView

Add-PnPField -List "All Archive Project Partcipants" -DisplayName "Role" `
    -InternalName "Role" -Type Text -Required -AddToDefaultView

Add-PnPField -List "All Archive Project Partcipants" -DisplayName "Participant" `
    -InternalName "Participant" -Type Text -Required -AddToDefaultView

# All Archive Project Discussions
Add-PnPField  -List "All Archive Project Discussions" -DisplayName "Discussion" -InternalName "Discussion" -Type Note -AddToDefaultView

Add-PnPField  -List "All Archive Project Discussions" -DisplayName "Decision" -InternalName "Decision" -Type Note -AddToDefaultView

Add-PnPField  -List "All Archive Project Discussions" -DisplayName "Decided Tasks" -InternalName "DecidedTasks" -Type Note -AddToDefaultView

Add-PnPField -List "All Archive Project Discussions" -DisplayName "Assigned To" -InternalName "AssignedTo" -Type User -AddToDefaultView 

Add-PnPField -List "All Archive Project Discussions" -DisplayName "Target Date" -InternalName "TargetDate" -Type Text -AddToDefaultView 

Add-PnPField -List "All Archive Project Discussions" -DisplayName "Id of Project" -InternalName "IdOfProject" -Type Number -AddToDefaultView 