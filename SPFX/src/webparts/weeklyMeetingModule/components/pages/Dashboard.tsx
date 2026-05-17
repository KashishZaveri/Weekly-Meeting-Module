import * as React from "react";
import styles from "../styles/Dashboard.module.scss";
import { useEffect, useState, FC, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getSP } from "../api/PnpjsConfig";
import MeetingApi from "../api/MeetingApi";
const meetingApi = MeetingApi();
import { IDashboardProps, IMeeting } from "../interfaces/IDashboard";
import { IInvitees } from "../interfaces/ICommon";
import { parseWeekNoFromString, getWeekRange } from "../utils/WeekUtils";
import { buildPeoplePickerContext } from "../utils/PeoplePickerUtils";
import { generateWeekOptions } from "../constants/Weeks";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Skeleton,
  Autocomplete,
  TextField,
  Grid,
  Button,
  Dialog,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { Persona, PersonaSize } from "@fluentui/react/lib/Persona";
import {
  PeoplePicker,
  PrincipalType,
  IPeoplePickerContext,
} from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { ConfigProvider } from "antd";
import "antd/dist/antd.min.css";
import generatePicker from "antd/es/date-picker/generatePicker";
import dayjsGenerateConfig from "rc-picker/lib/generate/dayjs";
import dayjs, { Dayjs } from "dayjs";
import CreateEditMeetingForm from "../components/CreateEditMeetingForm";

const DayjsDatePicker = generatePicker<Dayjs>(dayjsGenerateConfig);
const { RangePicker } = DayjsDatePicker;

type DialogMode = "create" | "edit" | null;

const Dashboard: FC<IDashboardProps> = ({
  context,
  refreshTrigger,
  onActionSuccess,
  access,
}) => {
  const sp = getSP(context);
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [meetingToEdit, setMeetingToEdit] = useState<IMeeting | null>(null);
  const [latestWeekValue, setLatestWeekValue] = useState<string>("");
  const [displayedMeetingsOnDashboard, setDisplayedMeetingsOnDashboard] =
    useState<IMeeting[]>([]);
  const fetchedIds = useRef(new Set<string>());
  const [liveAccepted, setLiveAccepted] = React.useState<{
    [id: string]: string[];
  }>({});

  const loadLatestWeekMeeting = async () => {
    setLoading(true);
    try {
      const latest = await meetingApi.fetchLatestWeekMeetingToShowOnDashboard();
      if (latest) {
        setDisplayedMeetingsOnDashboard([latest]);
        setLatestWeekValue(latest.weekNo);

        if (latest.eventId) {
          const acceptedNames = await meetingApi.fetchAcceptedInvitees(
            context,
            latest.eventId,
            latest.author.email
          );
          setLiveAccepted((prev) => ({
            ...prev,
            [latest.eventId]: acceptedNames,
          }));
        }
      }
    } catch (error) {
      console.error("Failed to load latest meeting:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadLiveStatuses = async (meetings: IMeeting[]) => {
    const newStatuses: { [eventId: string]: string[] } = {};
    let hasNewData = false;

    for (const m of meetings) {
      if (m.eventId && !fetchedIds.current.has(m.eventId)) {
        fetchedIds.current.add(m.eventId); // Mark as attempted

        const names = await meetingApi.fetchAcceptedInvitees(
          context,
          m.eventId,
          m.author?.email
        );

        newStatuses[m.eventId] = names;
        hasNewData = true;
      }
    }

    if (hasNewData) {
      setLiveAccepted((prev) => ({ ...prev, ...newStatuses }));
    }
  };

  useEffect(() => {
    if (displayedMeetingsOnDashboard.length > 0) {
      void loadLiveStatuses(displayedMeetingsOnDashboard);
    }
  }, [displayedMeetingsOnDashboard]);

  useEffect(() => {
    void loadLatestWeekMeeting();
  }, [refreshTrigger]);

  const handleCancel = async (id: number, eventId: string): Promise<void> => {
    if (
      !window.confirm(
        "Cancelling this meeting will remove it from the schedule. Are you sure?"
      )
    )
      return;
    try {
      await meetingApi.handleCancleMeeting(context, sp, id, eventId);
    } catch (e) {
      console.error("Cancel failed:", e);
    }
  };

  const onWeekFilterChange = async (weekValue: string | null) => {
    setSelectedWeek(weekValue);
    if (!weekValue) {
      return;
    }
    const results = await meetingApi.fetchMeetingForWeekFilter(weekValue);
    fetchedIds.current.clear();

    setDisplayedMeetingsOnDashboard(results);
    setLoading(true);
    try {
      const results = await meetingApi.fetchMeetingForWeekFilter(weekValue);
      setDisplayedMeetingsOnDashboard(results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reversedWeeks = generateWeekOptions();
  const currentUserId = context.pageContext.legacyPageContext.userId;

  return (
    <Box className={styles.contentArea}>
      <Box className={styles.pageHeader}>
        {loading ? (
          <Skeleton
            variant="rectangular"
            width="100%"
            height={60}
            sx={{ borderRadius: 2 }}
          />
        ) : (
          <>
            <Box className={styles.welcomeBanner}>Weekly Meeting Module</Box>
            <Button
              className={styles.headerBtn}
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate("/projects")}
            >
              GO TO PROJECTS
            </Button>
          </>
        )}
      </Box>

      <Box className={styles.headingWithCreateBtn}>
        <Box className={styles.weekHeading}>
          {loading ? (
            <Skeleton variant="text" width={280} height={40} animation="wave" />
          ) : (
            "MEETING OF THE LATEST WEEK"
          )}
        </Box>
        <Box className={styles.filterCreateBtns}>
          {loading ? (
            <Skeleton
              variant="rounded"
              width={200}
              height={36}
              animation="wave"
            />
          ) : (
            <Autocomplete
              options={reversedWeeks || []}
              value={selectedWeek}
              disableClearable={false}
              onChange={(_, newValue) => onWeekFilterChange(newValue)}
              sx={{
                width: 200,
                backgroundColor: "#fff",
                borderRadius: "8px",
                "& .MuiOutlinedInput-root": { padding: "2px 8px" },
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Filter by Week"
                  size="small"
                  variant="outlined"
                />
              )}
              ListboxProps={{
                sx: { "&::-webkit-scrollbar": { display: "none" } },
              }}
            />
          )}
          {access && (
            <Button
              className={styles.editBox}
              endIcon={<AddIcon />}
              onClick={() => {
                setMeetingToEdit(null);
                setDialogMode("create");
              }}
            >
              CREATE MEETING
            </Button>
          )}
        </Box>
      </Box>

      <Box className={styles.cardsArea}>
        {loading ? (
          <Grid container spacing={2}>
            {[1].map((item) => (
              <Grid item xs={12} key={item}>
                <Card className={styles.meetingCard}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" mb={2}>
                      <Box display="flex" gap={1}>
                        <Skeleton variant="rounded" width={80} height={32} />
                        <Skeleton variant="rounded" width={100} height={32} />
                      </Box>
                      <Skeleton variant="rounded" width={200} height={40} />
                    </Box>
                    <Skeleton variant="text" width="15%" />
                    <Box display="flex" gap={1} mt={1}>
                      <Skeleton variant="circular" width={32} height={32} />
                      <Skeleton variant="circular" width={32} height={32} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : !displayedMeetingsOnDashboard[0] ? (
          <Box className={styles.noMeeting}>
            <Typography color="textSecondary">
              No meeting scheduled for this week.
            </Typography>
          </Box>
        ) : (
          <Grid
            container
            spacing={2}
            sx={{
              "& > .MuiGrid-item": {
                paddingLeft: "13px",
                paddingTop: "8px",
                backgroundColor: "#f5f5f5",
              },
            }}
          >
            {displayedMeetingsOnDashboard.map((meeting) => (
              <Grid item xs={12} key={meeting.id}>
                <Card className={styles.meetingCard}>
                  <CardContent>
                    <Box className={styles.cardFirstPart}>
                      <Box className={styles.cardFirstPartHeader}>
                        <Box className={styles.weekAndStatus}>
                          <Chip
                            label={`Week: ${meeting.weekNo}`}
                            size="medium"
                            className={styles.weekChip}
                          />
                          <Chip
                            label={
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <FiberManualRecordIcon
                                  style={{ fontSize: "10px" }}
                                />
                                {meeting.meetingStatus === "Cancelled"
                                  ? "Cancelled"
                                  : "Scheduled"}
                              </Box>
                            }
                            size="medium"
                            style={{
                              color:
                                meeting.meetingStatus === "Cancelled"
                                  ? "red"
                                  : "green",
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                        {meeting?.author?.id === currentUserId &&
                          dayjs(meeting.startTime).isAfter(dayjs()) &&
                          access && (
                            <Box className={styles.editCancelMeetingBtns}>
                              <Button
                                className={styles.editBox}
                                disabled={meeting.meetingStatus === "Cancelled"}
                                onClick={() => {
                                  setMeetingToEdit(meeting);
                                  setDialogMode("edit");
                                }}
                              >
                                EDIT <ModeEditIcon fontSize="small" />
                              </Button>
                              {meeting.meetingStatus !== "Cancelled" && (
                                <Button
                                  className={styles.editBox}
                                  onClick={() =>
                                    handleCancel(meeting.id, meeting.eventId)
                                  }
                                >
                                  CANCEL <DeleteIcon fontSize="small" />
                                </Button>
                              )}
                            </Box>
                          )}
                      </Box>

                      <Box className={styles.modernDateTimeChip}>
                        <AccessTimeIcon
                          sx={{ fontSize: 18, mr: 1, color: "#0078d4" }}
                        />
                        <span className={styles.dateTimeText}>
                          {new Date(meeting.startTime)
                            .toLocaleString("en-GB", {
                              weekday: "short",
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                            .replace(",", "")}
                          &nbsp;
                          {new Date(meeting.startTime).toLocaleString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                          &nbsp;-&nbsp;
                          {new Date(meeting.endTime).toLocaleString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </span>
                      </Box>
                    </Box>

                    <Box className={styles.inviteesAttendeesContainer}>
                      <Box className={styles.inviteesContainer}>
                        <span className={styles.sectionLabel}>Invitees</span>
                        <Box className={styles.chipContainer}>
                          {meeting.invitees?.map((user) => (
                            <Chip
                              key={user.id}
                              label={user.title}
                              size="medium"
                              variant="outlined"
                              className={styles.attendeeChip}
                            />
                          ))}
                        </Box>
                      </Box>
                      {liveAccepted[meeting.eventId]?.length > 0 && (
                        <Box className={styles.attendeesContainer}>
                          <span className={styles.sectionLabel}>
                            Accepted By
                          </span>
                          <Box className={styles.chipContainer}>
                            {liveAccepted[meeting.eventId].map(
                              (name, index) => (
                                <Chip
                                  key={index}
                                  label={name}
                                  size="medium"
                                  variant="outlined"
                                  className={styles.inviteeChip}
                                />
                              )
                            )}
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <CreateEditMeetingForm
        open={dialogMode !== null}
        mode={dialogMode}
        context={context}
        sp={sp}
        meetingToEdit={meetingToEdit}
        latestWeekStr={latestWeekValue}
        onClose={() => setDialogMode(null)}
        onSuccess={(msg) => {
          setDialogMode(null);
          // void loadMeetings();
          onActionSuccess(msg);
        }}
      />
    </Box>
  );
};

export default Dashboard;
