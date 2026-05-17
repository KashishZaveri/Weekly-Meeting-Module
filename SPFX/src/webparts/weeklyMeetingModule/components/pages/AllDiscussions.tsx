import * as React from "react";
import styles from "../styles/AllProjects.module.scss";
import { useState, FC, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getSP } from "../api/PnpjsConfig";
import ProjectApi from "../api/ProjectApi";
const projectApi = ProjectApi();
import DiscussionApi from "../api/DiscussionApi";
const discussionApi = DiscussionApi();
import { fetchAllProjectParticipants } from "../api/ProjectParticipantsApi";
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Autocomplete,
  CircularProgress,
  Pagination,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InboxIcon from "@mui/icons-material/Inbox";
import { Persona, PersonaSize } from "@fluentui/react/lib/Persona";
import {
  IMeetingDiscussion,
  IAllProjectsProps,
  IProject,
} from "../interfaces/IDiscussion";
import { IParticipants } from "../interfaces/IParticipants";
import { getWeekStringFromDate } from "../utils/WeekUtils";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
dayjs.extend(weekOfYear);
import isoWeek from "dayjs/plugin/isoWeek";
dayjs.extend(isoWeek);
import ProjectCard from "../components/ProjectCard";
import DiscussionDrawer from "../components/DiscussionDrawer";

const AllDiscussions: FC<IAllProjectsProps> = ({
  access,
  context,
  refreshTrigger,
  onSuccess,
}) => {
  const sp = getSP(context);
  const navigate = useNavigate();
  const [allInProgressStopProjects, setAllInProgressStopProjects] = useState<
    IProject[]
  >([]);
  const [allParticipantsOfProject, setAllParticipantsOfProject] = useState<
    IParticipants[]
  >([]);
  const [discussions, setDiscussions] = useState<IMeetingDiscussion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProjectForDrawer, setSelectedProjectForDrawer] =
    useState<IProject | null>(null);
  const [drawerWeekFilter, setDrawerWeekFilter] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<IProject | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const statusOptions = ["In Progress", "Stop"];
  const itemsPerPage = 5;

  const loadInProgressStopProjectsProjects = async (): Promise<void> => {
    setLoading(true);
    try {
      setAllInProgressStopProjects(
        await projectApi.fetchInProgressStopProjects(sp)
      );
    } catch (e) {
      console.error("Error fetching projects:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadAllParticipants = async (): Promise<void> => {
    try {
      setAllParticipantsOfProject(
        await fetchAllProjectParticipants(sp)
      );
    } catch (e) {
      console.error("Error fetching participants:", e);
    }
  };

  const loadDiscussions = async (): Promise<void> => {
    try {
      setDiscussions(await discussionApi.fetchAllDiscussions(sp));
    } catch (e) {
      console.error("Error fetching discussions:", e);
    }
  };

  useEffect(() => {
    void loadInProgressStopProjectsProjects();
    void loadAllParticipants();
    void loadDiscussions();
    setPage(1);
  }, [refreshTrigger]);

  const filteredProjects = allInProgressStopProjects.filter((project) => {
    if (
      statusFilter &&
      project.projectStatus !== statusFilter.replace(" ", "")
    ) {
      return false;
    }

    if (selectedProject && project.projectId !== selectedProject.projectId) {
      return false;
    }

    return true;
  });

  const paginatedProjects = filteredProjects.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const drawerDiscussions = useMemo(() => {
    if (!selectedProjectForDrawer) return [];

    return discussions
      .filter((d) => {
        const matchesProject =
          d.idOfProject === selectedProjectForDrawer.projectId;

        const itemWeek = d.created ? dayjs(d.created).format("YYYY - WW") : "";
        const matchesWeek = !drawerWeekFilter || itemWeek <= drawerWeekFilter;

        return matchesProject && matchesWeek;
      })
      .sort((a, b) => {
        const timeB = a.created ? new Date(a.created).getTime() : 0;
        const timeA = b.created ? new Date(b.created).getTime() : 0;
        return timeA - timeB;
      });
  }, [selectedProjectForDrawer, drawerWeekFilter, discussions]);

  const handleOpenHistory = (project: IProject): void => {
    setSelectedProjectForDrawer(project);
    setDrawerWeekFilter("");
    setDrawerOpen(true);
  };

  return (
    <Box className={styles.contentArea}>
      {loading ? (
        <Box className={styles.loaderContainer}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box className={styles.pageHeader}>
            <Box className={styles.welcomeBanner}> Weekly Meeting Module</Box>
            <Button
              className={styles.headerBtn}
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/")}
            >
              GO TO DASHBOARD
            </Button>
          </Box>

          <Box className={styles.controls}>
            <Autocomplete
              options={allInProgressStopProjects.filter(
                (p) =>
                  p.projectStatus === "InProgress" || p.projectStatus === "Stop"
              )}
              getOptionLabel={(o) => o.projectName}
              disableClearable={false}
              value={selectedProject}
              onChange={(_, val) => {
                setSelectedProject(val);
                setPage(1);
              }}
              ListboxProps={{
                sx: { "&::-webkit-scrollbar": { display: "none" } },
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Project"
                  variant="outlined"
                  size="small"
                />
              )}
              className={styles.dropdown}
              sx={{ borderRadius: 2, width: "200px" }}
            />

            <Autocomplete
              options={statusOptions}
              disableClearable={false}
              value={statusFilter}
              onChange={(_, val) => {
                setStatusFilter(val);
                setPage(1);
              }}
              ListboxProps={{
                sx: { "&::-webkit-scrollbar": { display: "none" } },
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Status"
                  variant="outlined"
                  size="small"
                />
              )}
              className={styles.dropdown}
              sx={{ borderRadius: 2, width: "140px" }}
            />

            <Button
              className={styles.archiveBtn}
              onClick={() => navigate("/archiveProjects")}
            >
              Go to Archive
            </Button>
          </Box>

          <Box className={styles.paginationWrapper}>
            <Grid container spacing={2}>
              {paginatedProjects.length === 0 ? (
                <Grid item xs={12}>
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    sx={{ py: 8, opacity: 0.6 }}
                  >
                    <InboxIcon sx={{ fontSize: 60, mb: 2, color: "#d1d5db" }} />
                    <Typography variant="h6" color="textSecondary">
                      No projects found matching your criteria
                    </Typography>
                  </Box>
                </Grid>
              ) : (
                paginatedProjects.map((project) => (
                  <Grid item xs={12} key={project.id}>
                    <ProjectCard
                      context={context}
                      project={project}
                      participants={allParticipantsOfProject.filter(
                        (p) => p.projectId?.projectId === project.projectId
                      )}
                      discussions={discussions.filter(
                        (d) => d.idOfProject === project.projectId
                      )}
                      variant="active"
                      showAddDiscussion={access}
                      onOpenHistory={handleOpenHistory}
                      onSuccess={onSuccess}
                    />
                  </Grid>
                ))
              )}
            </Grid>
          </Box>

          <Pagination
            count={Math.ceil(filteredProjects.length / itemsPerPage)}
            page={page}
            onChange={(_, value) => setPage(value)}
            size="small"
            color="primary"
            style={{ display: "flex", justifyContent: "center" }}
          />
        </>
      )}

      <DiscussionDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        project={selectedProjectForDrawer}
        discussions={drawerDiscussions}
        showWeekFilter={true}
        weekFilterValue={drawerWeekFilter}
        onWeekFilterChange={setDrawerWeekFilter}
      />
    </Box>
  );
};

export default AllDiscussions;
