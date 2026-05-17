import * as React from "react";
import styles from "../styles/AllArchiveDiscussions.module.scss";
import { useState, FC, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getSP } from "../api/PnpjsConfig";
import ProjectApi from "../api/ProjectApi";
const projectApi = ProjectApi();
import { fetchAllArchiveDiscussions } from "../api/ArchiveDiscussionsApi";
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
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InboxIcon from "@mui/icons-material/Inbox";
import { Persona, PersonaSize } from "@fluentui/react/lib/Persona";
import { IAllArchiveDiscussions } from "../interfaces/IArchive";
import { IMeetingDiscussion, IProject } from "../interfaces/IDiscussion";
import { IParticipants } from "../interfaces/IParticipants";
import { getWeekStringFromDate } from "../utils/WeekUtils";
import dayjs from "dayjs";
import ProjectCard from "../components/ProjectCard";
import DiscussionDrawer from "../components/DiscussionDrawer";

const AllArchiveProjects: FC<IAllArchiveDiscussions> = ({ context }) => {
  const sp = getSP(context);
  const navigate = useNavigate();
  const [allProjects, setAllProjects] = useState<IProject[]>([]);
  const [allParticipantsOfProject, setAllParticipantsOfProject] = useState<
    IParticipants[]
  >([]);
  const [archiveDiscussions, setArchiveDiscussions] = useState<
    IMeetingDiscussion[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProjectForDrawer, setSelectedProjectForDrawer] =
    useState<IProject | null>(null);
  const [selectedProject, setSelectedProject] = useState<IProject | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const loadCompletedProjects = async (): Promise<void> => {
    setLoading(true);
    try {
      setAllProjects(await projectApi.fetchCompletedProjects(sp));
    } catch (e) {
      console.error("Error fetching projects:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadAllParticipants = async (): Promise<void> => {
    try {
      setAllParticipantsOfProject(await fetchAllProjectParticipants(sp));
    } catch (e) {
      console.error("Error fetching participants:", e);
    }
  };

  const loadArchiveDiscussions = async (): Promise<void> => {
    try {
      setArchiveDiscussions(await fetchAllArchiveDiscussions(sp));
    } catch (e) {
      console.error("Error fetching archive discussions:", e);
    }
  };

  useEffect(() => {
    void loadCompletedProjects();
    void loadAllParticipants();
    void loadArchiveDiscussions();
    setPage(1);
  }, [context]);

  const completedProjects = allProjects
    .filter((p) => p.projectStatus === "Completed")
    .filter((p) =>
      selectedProject ? p.projectId === selectedProject.projectId : true
    );

  const paginatedProjects = completedProjects.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const drawerDiscussions = useMemo(() => {
    if (!selectedProjectForDrawer) return [];

    return archiveDiscussions
      .filter((d) => d.idOfProject === selectedProjectForDrawer.projectId)
      .sort((a, b) => {
        const timeB = a.created ? new Date(a.created).getTime() : 0;
        const timeA = b.created ? new Date(b.created).getTime() : 0;
        return timeA - timeB;
      });
  }, [selectedProjectForDrawer, archiveDiscussions]);

  const handleOpenHistory = (project: IProject): void => {
    setSelectedProjectForDrawer(project);
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
            <Box className={styles.welcomeBanner}>Weekly Meeting Module</Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Button
                className={styles.headerBtn}
                onClick={() => navigate("/projects")}
              >
                <ArrowBackIcon />
              </Button>
              <Button
                className={styles.headerBtn}
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate("/")}
              >
                GO TO DASHBOARD
              </Button>
            </Box>
          </Box>
          <Box className={styles.controls}>
            <Autocomplete
              options={allProjects.filter(
                (p) => p.projectStatus === "Completed"
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
                      No completed projects found
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
                      discussions={archiveDiscussions.filter(
                        (d) => d.idOfProject === project.projectId
                      )}
                      variant="archive"
                      showAddDiscussion={false}
                      onOpenHistory={handleOpenHistory}
                    />
                  </Grid>
                ))
              )}
            </Grid>
          </Box>

          <Pagination
            count={Math.ceil(completedProjects.length / itemsPerPage)}
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
        showWeekFilter={false}
      />
    </Box>
  );
};

export default AllArchiveProjects;
