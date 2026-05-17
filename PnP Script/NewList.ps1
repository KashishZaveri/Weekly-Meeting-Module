# All Created Meeting list- when meeting will create all details will store here
New-PnPList -Title "All Meetings" -Url "Lists/AllMeetings" -Template GenericList 
  
#Project Master List- when new project will create all details will store here
New-PnPList -Title "Project Master" -Url "Lists/ProjectMaster" -Template GenericList

 # After meeting list- when meeting finish meeting details for spacific project will store here
New-PnPList -Title "All Discussions" -Url "Lists/AllDiscussions" -Template GenericList

# Archive list for all discussions
New-PnpList -Title "All Archive Project Discussions" -Url "Lists/AllArchiveProjectDiscussions" -Template GenericList

# All Project Members List
New-PnpList -Title "All Project Partcipants" -Url "Lists/AllProjectPartcipants" -Template GenericList

# All Project Members List
New-PnpList -Title "All Archive Project Partcipants" -Url "Lists/ArchiveAllProjectPartcipants" -Template GenericList


New-PnPGroup -Title "HR"
Set-PnPGroupPermissions -Identity "HR" -AddRole "Edit"

New-PnPGroup -Title "Members"
Set-PnPGroupPermissions -Identity "Members" -AddRole "Read"
