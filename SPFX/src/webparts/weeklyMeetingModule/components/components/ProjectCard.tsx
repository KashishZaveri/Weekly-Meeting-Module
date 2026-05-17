import * as React from "react";
import { useState, useEffect, FC } from "react";
import styles from "../styles/ProjectCard.module.scss";
import { IParticipants } from "../interfaces/IParticipants";
import {
  IProject,
  IProjectCardProps,
  IMeetingDiscussion,
} from "../interfaces/IDiscussion";
import { getSP } from "../api/PnpjsConfig";
import DiscussionApi from "../api/DiscussionApi";
const api = DiscussionApi();
import {
  Box,
  Typography,
  Button,
  Card,
  Chip,
  Stack,
  Grid,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import AddIcon from "@mui/icons-material/Add";
import HistoryIcon from "@mui/icons-material/History";
import CloseIcon from "@mui/icons-material/Close";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { buildPeoplePickerContext } from "../utils/PeoplePickerUtils";
import {
  PeoplePicker,
  PrincipalType,
  IPeoplePickerContext,
} from "@pnp/spfx-controls-react/lib/PeoplePicker";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar";

const StatusChip: FC<{
  status: string;
  variant: "active" | "archive";
}> = ({ status, variant }) => {
  if (variant === "archive") {
    return (
      <Chip label={status} color="primary" size="small" variant="outlined" />
    );
  }

  if (status === "InProgress") {
    return (
      <Chip
        label="In Progress"
        color="success"
        size="small"
        variant="outlined"
      />
    );
  }

  if (status === "Stop") {
    return (
      <Chip
        label="In Progress"
        color="warning"
        size="small"
        variant="outlined"
      />
    );
  }

  return (
    <Chip
      label={status}
      style={{ color: "orange", borderColor: "orange" }}
      size="small"
      variant="outlined"
    />
  );
};

const ProjectCard: FC<IProjectCardProps> = ({
  project,
  participants,
  discussions,
  showAddDiscussion = false,
  onOpenHistory,
  variant,
  onSuccess,
  context,
}) => {
  const sp = getSP(context);
  const emptyDiscussion: IMeetingDiscussion = {
    id: 0,
    discussion: "",
    decision: "",
    decidedTasks: "",
    targetDate: null,
    assignedTo: undefined,
    idOfProject: 0,
    created: new Date(),
  };
  const [openAddDiscussion, setOpenAddDiscussion] = useState(false);
  const [formData, setFormData] = useState<IMeetingDiscussion>(emptyDiscussion);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [error, setError] = useState({
    discussion: "",
    decision: "",
    decidedTasks: "",
    targetDate: "",
    assignedTo: "",
  });

  const [snack, setSnack] = useState<{
    open: boolean;
    vertical: "top" | "bottom";
    horizontal: "left" | "right" | "center";
    message: string;
  }>({
    open: false,
    vertical: "bottom",
    horizontal: "left",
    message: "",
  });

  const handleActionSuccess = (msg: string): void => {
    setSnack((prev) => ({ ...prev, open: true, message: msg }));
  };
  const handleCloseSnackbar = (
    event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ): void => {
    if (reason === "clickaway") return;
    setSnack((prev) => ({ ...prev, open: false }));
  };
  const peoplePickerContext: IPeoplePickerContext =
    buildPeoplePickerContext(context);

  const handleSave = async (): Promise<void> => {
    try {
      setIsSubmitted(true);

      if (!formData.discussion || !formData.decision) {
        return;
      }
      await api.createDiscussion(sp, formData, project.projectId);
      setOpenAddDiscussion(false);

      if (onSuccess) {
        onSuccess("Discussion added successfully!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card className={styles.projectCard} elevation={0}>
        <Box className={styles.cardHeader}>
          <Typography className={styles.title}>
            {project.projectName}&nbsp;
            <StatusChip status={project.projectStatus} variant={variant} />
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              className={styles.addBtn}
              startIcon={<HistoryIcon fontSize="small" />}
              onClick={() => onOpenHistory(project)}
            >
              Discussions
            </Button>

            {showAddDiscussion && (
              <Button
                className={styles.addBtn}
                startIcon={<AddIcon fontSize="small" />}
                onClick={() => setOpenAddDiscussion(true)}
              >
                Add Discussion
              </Button>
            )}

            {project.projectSiteURL && (
              <IconButton
                className={styles.siteIconBtn}
                onClick={() =>
                  window.open(project.projectSiteURL!.Url, "_blank")
                }
              >
                <OpenInNewIcon fontSize="small" />
                &nbsp;Site
              </IconButton>
            )}
          </Stack>
        </Box>

        <Box className={styles.modernDateTimeChip}>
          <AccessTimeIcon sx={{ fontSize: 16, mr: 0.75, color: "#1674ae" }} />
          <span className={styles.dateTimeText}>
            {dayjs(project.startDate).format("DD MMM YYYY")} —{" "}
            {dayjs(project.endDate).format("DD MMM YYYY")}
          </span>
        </Box>

        <Box className={styles.participantsSection}>
          <Typography className={styles.sectionLabel}>Project Team</Typography>
          <Box className={styles.participantsGrid}>
            {project?.projectManager && (
              <Box className={styles.participantCard}>
                <Typography className={styles.pName}>
                  {project.projectManager?.title}
                </Typography>
                <Typography className={styles.pRole}>
                  Project Manager
                </Typography>
              </Box>
            )}

            {participants
              .filter((item) => item.projectId?.projectId === project.projectId)
              .map((participant, idx) => (
                <Box key={idx} className={styles.participantCard}>
                  <Typography className={styles.pName}>
                    {participant.participant}
                  </Typography>
                  <Typography className={styles.pRole}>
                    {participant.role}
                  </Typography>
                </Box>
              ))}
          </Box>
        </Box>

        <Dialog
          open={openAddDiscussion}
          onClose={() => setOpenAddDiscussion(false)}
          fullWidth
          className={styles.dialog}
        >
          <Box className={styles.formContainer}>
            <DialogTitle sx={{ fontWeight: 700 }}>
              Add new discussion for {project.projectName}
              <IconButton
                onClick={() => {
                  setOpenAddDiscussion(false);
                }}
                sx={{ position: "absolute", right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Box className={styles.scrollableContent}>
                <Grid className={styles.inputSection}>
                  <TextField
                    label="Discussion"
                    multiline
                    required
                    rows={3}
                    fullWidth
                    onChange={(e) =>
                      setFormData({ ...formData, discussion: e.target.value })
                    }
                    helperText={
                      isSubmitted && !formData.discussion
                        ? "Discusison is required"
                        : ""
                    }
                    error={isSubmitted && !formData.discussion}
                  />
                </Grid>
                <Grid className={styles.inputSection}>
                  <TextField
                    label="Decision"
                    multiline
                    required
                    rows={2}
                    fullWidth
                    onChange={(e) =>
                      setFormData({ ...formData, decision: e.target.value })
                    }
                    helperText={
                      isSubmitted && !formData.decision
                        ? "Decision is required"
                        : ""
                    }
                    error={isSubmitted && !formData.decision}
                  />
                </Grid>
                <Grid className={styles.inputSection}>
                  <TextField
                    label="Decided Tasks"
                    multiline
                    rows={2}
                    fullWidth
                    onChange={(e) =>
                      setFormData({ ...formData, decidedTasks: e.target.value })
                    }
                  />
                </Grid>

                <Grid className={styles.inputSection}>
                  <DatePicker
                    label="Select Targert Date"
                    value={formData.targetDate}
                    minDate={dayjs()}
                    maxDate={dayjs().add(10, "year")}
                    format="YYYY-MM-DD"
                    onChange={(newValue) =>
                      setFormData({
                        ...formData,
                        targetDate: newValue,
                      })
                    }
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small",
                        readOnly: true,
                      },
                    }}
                    sx={{
                      borderRadius: error.targetDate ? "8px" : "8px",
                      border: error.targetDate ? "1px solid red" : "",
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Grid item xs={12} className={styles.peoplePickerWrapper}>
                    <Typography
                      variant="body2"
                      className={styles.scheduleLabel}
                    >
                      Assigned To
                    </Typography>
                    <Box
                      className={
                        error.assignedTo ? styles.errorPeoplePicker : ""
                      }
                    >
                      <PeoplePicker
                        context={peoplePickerContext}
                        personSelectionLimit={1}
                        principalTypes={[PrincipalType.User]}
                        onChange={async (items: any[]) => {
                          if (items.length > 0) {
                            const user = await sp.web.ensureUser(
                              items[0].loginName
                            );
                            setFormData({
                              ...formData,
                              assignedTo: {
                                id: user.data.Id,
                                title: user.data.Title,
                                email: user.data.Email,
                              },
                            });
                          } else {
                            setFormData({ ...formData, assignedTo: undefined });
                          }
                        }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Box>
              <Box className={styles.actionButtons}>
                <Button
                  className={styles.saveBtn}
                  variant="contained"
                  onClick={handleSave}
                >
                  Add Discussion
                </Button>
                <Button
                  className={styles.cancelBtn}
                  onClick={() => setOpenAddDiscussion(false)}
                >
                  Cancel
                </Button>
              </Box>
            </DialogContent>
          </Box>
        </Dialog>
      </Card>
      {/* <Snackbar
        anchorOrigin={{
          vertical: snack.vertical,
          horizontal: snack.horizontal,
        }}
        open={snack.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        message={snack.message}
        sx={{
          zIndex: 9999,
          backgroundColor: "#1f52e0",
          color: "white",
          fontSize: "1rem",
        }}
      /> */}
    </LocalizationProvider>
  );
};

export default ProjectCard;
