import * as React from "react";
import styles from "../styles/Dashboard.module.scss";
import { useEffect, useState, FC } from "react";
import { useNavigate } from "react-router-dom";
import { getSP } from "../api/PnpjsConfig";
import { checkUserAccess } from "../api/Permission";
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
import MeetingApi from "../api/MeetingApi";
const api = MeetingApi();
const DayjsDatePicker = generatePicker<Dayjs>(dayjsGenerateConfig);
const { RangePicker } = DayjsDatePicker;

type DialogMode = "create" | "edit" | null;

interface ICreateEditMeetingFormDialogProps {
  open: boolean;
  mode: DialogMode;
  context: any;
  sp: any;
  meetingToEdit?: IMeeting | null;
  latestWeekStr: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

const emptyMeeting: IMeeting = {
  id: 0,
  startTime: "",
  endTime: "",
  weekNo: "",
  invitees: [],
  eventId: "",
  meetingStatus: "",
};

const CreateEditMeetingForm: FC<ICreateEditMeetingFormDialogProps> = ({
  open,
  mode,
  context,
  sp,
  meetingToEdit,
  latestWeekStr,
  onClose,
  onSuccess,
}) => {
  const isEditDialogMode = mode === "edit";
  const [formData, setFormData] = useState<IMeeting>(emptyMeeting);
  const [meetingRange, setMeetingRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [calendarDates, setCalendarDates] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({
    weekNo: "",
    meetingRange: "",
    invitees: "",
  });

  const weekOptions = generateWeekOptions();
  const peoplePickerContext: IPeoplePickerContext =
    buildPeoplePickerContext(context);
  const currentUserEmail = context.pageContext.user.email?.toLowerCase();

  useEffect(() => {
    if (!open) return;

    if (isEditDialogMode && meetingToEdit) {
      setFormData(meetingToEdit);
      if (meetingToEdit.startTime && meetingToEdit.endTime) {
        setMeetingRange([
          dayjs(meetingToEdit.startTime),
          dayjs(meetingToEdit.endTime),
        ]);
      }
    } else {
      setFormData(emptyMeeting);
      setMeetingRange(null);
    }
    setCalendarDates(null);
    setError({ weekNo: "", meetingRange: "", invitees: "" });
  }, [open, mode, meetingToEdit]);

  const validate = (): boolean => {
    const newErrors = { weekNo: "", meetingRange: "", invitees: "" };
    let valid = true;

    if (!isEditDialogMode && !formData.weekNo) {
      newErrors.weekNo = "Week selection is required to create a meeting!";
      valid = false;
    }
    if (!meetingRange?.[0] || !meetingRange?.[1]) {
      newErrors.meetingRange = "Meeting time is required!";
      valid = false;
    }
    if (!formData.invitees?.length) {
      newErrors.invitees = "At least one invitee is required.";
      valid = false;
    }
    if (
      formData.invitees?.some(
        (inv) => inv.email?.toLowerCase() === currentUserEmail
      )
    ) {
      newErrors.invitees = "You can't add yourself as an invitee.";
      valid = false;
    }

    setError(newErrors);
    return valid;
  };

  const validateTime = (start: Dayjs | null, end: Dayjs | null): string => {
    if (!start || !end) return "Start & End required";
    if (!start.isSame(end, "day")) return "Meeting must be on the same day";
    const diff = end.diff(start, "minute");
    if (diff <= 0) return "End time must be after start time";
    if (diff < 30) return "Minimum 30 minutes required";
    if (diff > 360) return "Maximum 6 hours allowed";
    return "";
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validate() || !meetingRange) return;
    const [start, end] = meetingRange;

    try {
      setLoading(true);

      if (isEditDialogMode && meetingToEdit) {
        await api.updateMeeting(
          context,
          sp,
          meetingToEdit.id,
          formData.weekNo,
          start.toISOString(),
          end.toISOString(),
          meetingToEdit.eventId,
          formData.invitees
        );
        onSuccess("Meeting updated successfully!");
      } else {
        await api.createMeeting(
          context,
          sp,
          formData.weekNo,
          start.toISOString(),
          end.toISOString(),
          formData.invitees
        );
        onSuccess("Meeting created successfully!");
      }

      onClose();
    } catch (e) {
      console.error("MeetingFormDialog submit error:", e);
    } finally {
      setLoading(false);
    }
  };

  const renderWeekOptions = () => {
    const latestIndex = weekOptions.findIndex((w) => w === latestWeekStr);
    const endLimit = latestIndex === -1 ? 3 : latestIndex + 4;
    return weekOptions.slice(0, endLimit).map((week) => {
      const currentVal = parseWeekNoFromString(week) ?? 0;
      const latestVal = parseWeekNoFromString(latestWeekStr) ?? 0;
      const isDisabled = latestWeekStr ? currentVal <= latestVal : false;
      return (
        <MenuItem
          key={week}
          value={week}
          disabled={isDisabled}
          sx={{ "&.Mui-disabled": { backgroundColor: "#f5f5f5" } }}
        >
          {week}
        </MenuItem>
      );
    });
  };

  return (
    <Dialog fullScreen open={open} onClose={onClose} className={styles.dialog}>
      <Box p={3} className={styles.createMeetingContainer}>
        <IconButton
          aria-label="close"
          onClick={onClose}
          className={styles.closeButton}
        >
          <CloseIcon />
        </IconButton>

        <Typography variant="h5" className={styles.title} gutterBottom>
          <b>
            {isEditDialogMode ? "Edit Meeting Details" : "Create New Meeting"}
          </b>
        </Typography>

        <Grid item xs={12} md={6} className={styles.formFieldWrapper}>
          <Typography variant="body2" className={styles.scheduleLabel}>
            Select Week Number
          </Typography>

          {isEditDialogMode ? (
            <FormControl fullWidth disabled size="small">
              <Select
                value={formData.weekNo || ""}
                sx={{
                  height: 40,
                  backgroundColor: "#f5f5f5",
                  "& .MuiSelect-select": {
                    padding: "8px 14px",
                    cursor: "not-allowed",
                  },
                }}
                renderValue={(v) => v || <em>Choose a week...</em>}
              >
                <MenuItem value={formData.weekNo}>{formData.weekNo}</MenuItem>
              </Select>
            </FormControl>
          ) : (
            <FormControl fullWidth error={Boolean(error.weekNo)} size="small">
              <Select
                value={formData.weekNo}
                displayEmpty
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    weekNo: e.target.value as string,
                  });
                  setMeetingRange(null);
                  setCalendarDates(null);
                }}
                sx={{ height: 40, backgroundColor: "white" }}
                renderValue={(v) =>
                  v ? (
                    v
                  ) : (
                    <span style={{ color: "#666" }}>Choose a week...</span>
                  )
                }
                MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
              >
                {renderWeekOptions()}
              </Select>
              {error.weekNo && (
                <Typography color="error" variant="caption" sx={{ mt: 0.5 }}>
                  {error.weekNo}
                </Typography>
              )}
            </FormControl>
          )}
        </Grid>

        {/* ── Date/time range picker ── */}
        <Grid item xs={12} md={6} className={styles.formFieldWrapper}>
          <ConfigProvider>
            <Grid item xs={12} sx={{ mb: 3 }}>
              <Typography variant="body2" className={styles.scheduleLabel}>
                {isEditDialogMode
                  ? "Edit Meeting Schedule"
                  : "Meeting Schedule (Start & End)"}
              </Typography>
              <Box className={styles.rangePickerWrapper}>
                <RangePicker
                  value={meetingRange}
                  open={pickerOpen}
                  onOpenChange={setPickerOpen}
                  defaultPickerValue={
                    formData.weekNo
                      ? [
                          dayjs(getWeekRange(formData.weekNo).start),
                          dayjs(getWeekRange(formData.weekNo).start).add(
                            1,
                            "month"
                          ),
                        ]
                      : undefined
                  }
                  activePickerIndex={calendarDates?.[0] ? 1 : 0}
                  placeholder={["Start Date", "End Date"]}
                  disabled={!formData.weekNo}
                  showTime={{ format: "HH:mm" }}
                  format="YYYY-MM-DD HH:mm"
                  inputReadOnly
                  className={error.meetingRange ? "error-range-picker" : ""}
                  style={{ width: "100%", height: 40, borderRadius: 6 }}
                  onCalendarChange={(val) =>
                    setCalendarDates(val as [Dayjs | null, Dayjs | null])
                  }
                  onChange={(values) => {
                    if (!values?.[0] || !values?.[1]) {
                      setMeetingRange(null);
                      setCalendarDates(null);
                      return;
                    }
                    const timeError = validateTime(values[0], values[1]);
                    if (timeError) {
                      setMeetingRange(null);
                      setCalendarDates(null);
                      setError((prev) => ({
                        ...prev,
                        meetingRange: timeError,
                      }));
                      setPickerOpen(false);
                    } else {
                      setMeetingRange(values as [Dayjs, Dayjs]);
                      setError((prev) => ({ ...prev, meetingRange: "" }));
                    }
                  }}
                  disabledDate={(current) => {
                    if (!formData.weekNo) return true;
                    const { start, end } = getWeekRange(formData.weekNo);
                    const outside =
                      current < dayjs(start).startOf("day") ||
                      current > dayjs(end).endOf("day");
                    if (calendarDates?.[0]) {
                      return (
                        outside || !current.isSame(calendarDates[0], "day")
                      );
                    }
                    return outside;
                  }}
                  disabledTime={(_, type) => {
                    if (type === "end" && calendarDates?.[0]) {
                      const h = calendarDates[0].hour();
                      const m = calendarDates[0].minute();
                      return {
                        disabledHours: () =>
                          Array.from({ length: h }, (_, i) => i),
                        disabledMinutes: (sel) =>
                          sel === h
                            ? Array.from({ length: m + 1 }, (_, i) => i)
                            : [],
                      };
                    }
                    return {};
                  }}
                />
              </Box>
              <Typography
                color="primary"
                variant="caption"
                sx={{ mt: 0.5, display: "block" }}
              >
                Meeting duration must be at least 30 minutes.
              </Typography>
              {error.meetingRange && (
                <Typography
                  color="error"
                  variant="caption"
                  sx={{ mt: 0.5, display: "block" }}
                >
                  {error.meetingRange}
                </Typography>
              )}
            </Grid>
          </ConfigProvider>
        </Grid>

        {/* ── Invitees ── */}
        <Grid item xs={12} md={6}>
          <Grid item xs={12} className={styles.peoplePickerWrapper}>
            <Typography variant="body2" className={styles.scheduleLabel}>
              Select Invitees
            </Typography>
            <Box className={error.invitees ? styles.errorPeoplePicker : ""}>
              <PeoplePicker
                context={peoplePickerContext}
                personSelectionLimit={10}
                groupName=""
                showtooltip
                searchTextLimit={1}
                resolveDelay={0}
                ensureUser
                principalTypes={[PrincipalType.User]}
                defaultSelectedUsers={
                  formData.invitees?.map((u) =>
                    isEditDialogMode ? u.title || "" : u.email || ""
                  ) || []
                }
                onChange={async (items: any[]) => {
                  const users: IInvitees[] = [];
                  for (const item of items) {
                    const ensured = await sp.web.ensureUser(
                      item.loginName || item.secondaryText
                    );
                    users.push({
                      id: ensured.data.Id,
                      title: item.text,
                      email: item.secondaryText || item.loginName,
                    });
                  }
                  setFormData({ ...formData, invitees: users });
                  const hasSelf = items.some(
                    (item) =>
                      (item.secondaryText || item.loginName)?.toLowerCase() ===
                      currentUserEmail
                  );
                  setError((prev) => ({
                    ...prev,
                    invitees: hasSelf
                      ? "You can't add yourself as an invitee."
                      : "",
                  }));
                }}
              />
            </Box>
            {error.invitees && (
              <Typography
                color="error"
                variant="caption"
                sx={{ mt: 0.5, display: "block" }}
              >
                {error.invitees}
              </Typography>
            )}
          </Grid>
        </Grid>

        <Box className={styles.buttonContainer}>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className={`${styles.button} ${styles.primary}`}
          >
            {loading
              ? isEditDialogMode
                ? "Updating..."
                : "Creating..."
              : isEditDialogMode
              ? "Update Meeting"
              : "Create Meeting"}
          </Button>
          <Button
            onClick={onClose}
            className={`${styles.button} ${styles.secondary}`}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default CreateEditMeetingForm;
