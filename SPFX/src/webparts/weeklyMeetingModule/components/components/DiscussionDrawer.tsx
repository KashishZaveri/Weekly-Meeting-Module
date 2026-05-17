import * as React from "react";
import styles from "../styles/DiscussionDrawer.module.scss";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Divider,
  Autocomplete,
  TextField,
  IconButton,
  Drawer,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import InboxIcon from "@mui/icons-material/Inbox";
import { CalendarDayRegular } from "@fluentui/react-icons";
import { IProject } from "../interfaces/IDiscussion";
import {
  IMeetingDiscussion,
  IDiscussionDrawerProps,
} from "../interfaces/IDiscussion";
import { generateWeekOptions } from "../constants/Weeks";
import dayjs from "dayjs";

const DiscussionDrawer: React.FC<IDiscussionDrawerProps> = ({
  open,
  onClose,
  project,
  discussions,
  showWeekFilter = false,
  weekFilterValue = "",
  onWeekFilterChange,
}) => {
  const reversedWeeks = generateWeekOptions();

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      disableScrollLock={false}
      sx={{ zIndex: 20000 }}
      PaperProps={{
        className: styles.discussionDrawer,
        sx: {
          width: "50vw !important",
          height: "100vh !important",
          maxWidth: "100%",
          position: "fixed !important",
          right: 0,
          top: 0,
          margin: 0,
          overscrollBehavior: "contain !important",
          pointerEvents: "auto",
        },
      }}
      ModalProps={{
        disableEnforceFocus: true,
        disableRestoreFocus: true,
      }}
    >
      <Box className={styles.drawerHeader}>
        <Box>
          <Typography className={styles.drawerTitle}>
            {project?.projectName}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.78rem" }}
          >
            Discussion History
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "#fff" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {showWeekFilter && (
        <Box className={styles.drawerFilterSection}>
          <Autocomplete
            options={reversedWeeks || []}
            inputValue={weekFilterValue}
            disableClearable={false}
            onInputChange={(_, val) => onWeekFilterChange?.(val)}
            ListboxProps={{
              sx: {
                "&::-webkit-scrollbar": { display: "none", zIndex: 21000 },
              },
            }}
            slotProps={{
              popper: { sx: { zIndex: 21000 } },
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Filter by Week"
                size="small"
                fullWidth
                helperText="Discussions will come till selected week in filter!"
                FormHelperTextProps={{
                  sx: {
                    fontSize: "0.75rem",
                    color: "#9ca3af !important",
                    marginTop: "4px",
                  },
                }}
              />
            )}
            fullWidth
          />
        </Box>
      )}

      <Divider />

      <Box className={styles.drawerContent}>
        {discussions.length > 0 ? (
          discussions.map((item) => (
            <Card key={item.id} elevation={0} className={styles.drawerCard}>
              <CardContent
                sx={{
                  p: "1rem !important",
                  "&:last-child": { pb: "1rem !important" },
                }}
              >
                <Box className={styles.historyDateTag}>
                  <CalendarDayRegular style={{ fontSize: "13px" }} />
                  {item.created
                    ? dayjs(item.created).format("YYYY - ww")
                    : "N/A"}
                </Box>

                <Box sx={{ mb: 1.25 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      mb: 0.4,
                    }}
                  >
                    <ForumOutlinedIcon
                      sx={{ fontSize: 13, color: "#6b7280" }}
                    />
                    <span className={styles.historyLabel}>Discussion</span>
                  </Box>
                  <Typography
                    className={styles.historyValue}
                    sx={{ pl: 1.5, borderLeft: "3px solid #3b82f6" }}
                  >
                    {item.discussion}
                  </Typography>
                </Box>

                <Box sx={{ mb: 1.25 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      mb: 0.4,
                    }}
                  >
                    <CheckCircleOutlineIcon
                      sx={{ fontSize: 13, color: "#6b7280" }}
                    />
                    <span className={styles.historyLabel}>Decision</span>
                  </Box>
                  <Typography
                    className={styles.historyValue}
                    sx={{ pl: 1.5, borderLeft: "3px solid #10b981" }}
                  >
                    {item.decision ? item.decision : "------N/A-----"}
                  </Typography>
                </Box>

                <Box sx={{ mb: 1.25 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      mb: 0.4,
                    }}
                  >
                    <AssignmentOutlinedIcon
                      sx={{ fontSize: 13, color: "#6b7280" }}
                    />
                    <span className={styles.historyLabel}>Tasks</span>
                  </Box>
                  <Typography
                    className={styles.historyValue}
                    sx={{ pl: 1.5, borderLeft: "3px solid #f59e0b" }}
                  >
                    {item.decidedTasks
                      ? item.decidedTasks
                      : "--------------N/A-------------"}
                  </Typography>
                </Box>

                <Box className={styles.historyFooter}>
                  <Box>
                    <Typography
                      className={styles.drawerFooterTitle}
                      style={{ textAlign: "left" }}
                      ml="2px"
                    >
                      Assigned To
                    </Typography>
                    <Chip
                      icon={<PersonOutlineIcon className={styles.icon} />}
                      label={
                        item.assignedTo?.title ? item.assignedTo.title : "N/A"
                      }
                      size="medium"
                      className={styles.assignChip}
                    />
                  </Box>

                  <Box>
                    <Typography
                      className={styles.drawerFooterTitle}
                      style={{ textAlign: "right" }}
                      mr="3px"
                    >
                      Targeted Date
                    </Typography>
                    <Chip
                      icon={
                        <CalendarTodayOutlinedIcon className={styles.icon} />
                      }
                      label={
                        item.targetDate
                          ? dayjs(item.targetDate).format("DD MMM YYYY")
                          : "N/A"
                      }
                      size="medium"
                      className={styles.assignChip}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))
        ) : (
          <Box className={styles.emptyState}>
            <InboxIcon sx={{ fontSize: 48, color: "#d1d5db", mb: 1 }} />
            <Typography variant="body2" sx={{ color: "#9ca3af" }}>
              {showWeekFilter && weekFilterValue ? (
                <>
                  No discussions found for <b>{project?.projectName}</b>
                  <br /> in <b>{weekFilterValue}</b>.
                </>
              ) : (
                <>
                  No discussion history available for
                  <br /> <b>{project?.projectName}</b> yet.
                </>
              )}
            </Typography>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default DiscussionDrawer;
