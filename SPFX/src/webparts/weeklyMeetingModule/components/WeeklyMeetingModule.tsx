import * as React from "react";
import { useState, useEffect, FC } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import styles from "./styles/WeeklyMeetingModule.module.scss";
import { getSP } from "./api/PnpjsConfig";
import Dashboard from "./pages/Dashboard";
import { checkUserAccess } from "./api/Permission";
import AllDiscussions from "./pages/AllDiscussions";
import AllArchiveDiscussions from "./pages/AllArchiveDiscussions";
import { IWeeklyMeetingModuleProps } from "./interfaces/IWeeklyMeetingModuleProps";
import { IMeeting } from "./interfaces/IDashboard";
import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar";

const WeeklyMeetingModule: FC<IWeeklyMeetingModuleProps> = (props) => {
  const sp = getSP(props.context);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [hasAccess, setHasAccess] = useState(false);

  const loadAccess = async (): Promise<void> => {
    const access = await checkUserAccess(sp);
    setHasAccess(access);
  };
  useEffect(() => {
    void loadAccess();
  }, []);

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

  const handleCloseSnackbar = (
    event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ): void => {
    if (reason === "clickaway") return;
    setSnack((prev) => ({ ...prev, open: false }));
  };

  const handleActionSuccess = (msg: string): void => {
    setRefreshTrigger((prev) => prev + 1);
    setSnack((prev) => ({ ...prev, open: true, message: msg }));
  };

  return (
    <HashRouter>
      <div className={styles.container}>
        <div>
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  access={hasAccess}
                  context={props.context}
                  refreshTrigger={refreshTrigger}
                  onActionSuccess={handleActionSuccess}
                />
              }
            />
            <Route
              path="/projects"
              element={
                <AllDiscussions
                  access={hasAccess}
                  context={props.context}
                  refreshTrigger={refreshTrigger}
                  onSuccess={handleActionSuccess}
                />
              }
            />
            <Route
              path="/archiveProjects"
              element={<AllArchiveDiscussions context={props.context} />}
            />
          </Routes>
        </div>

        <Snackbar
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
        />
      </div>
    </HashRouter>
  );
};

export default WeeklyMeetingModule;
