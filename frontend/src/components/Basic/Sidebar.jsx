import React, { useState } from "react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";
import FolderIcon from "@mui/icons-material/Folder";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import BuildIcon from "@mui/icons-material/Build";
import DevicesIcon from "@mui/icons-material/Devices";
import EngineeringIcon from "@mui/icons-material/Engineering";
import BarChartIcon from "@mui/icons-material/BarChart";
import EventNoteIcon from "@mui/icons-material/EventNote";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import AnalyticsIcon from '@mui/icons-material/Analytics';
import CampaignIcon from "@mui/icons-material/Campaign";
import SettingsIcon from "@mui/icons-material/Settings";
import TuneIcon from "@mui/icons-material/Tune";
import AnnouncementIcon from '@mui/icons-material/Announcement';
import NotificationsIcon from "@mui/icons-material/Notifications";

import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  ListItemIcon
} from "@mui/material";

// icons omitted for brevity (keep your previous imports)

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [openTeams, setOpenTeams] = useState(
    location.pathname.startsWith("/teams")
  );
  const [openReports, setOpenReports] = useState(
    location.pathname.startsWith("/reports")
  );
  const [openSettings, setOpenSettings] = useState(
    location.pathname.startsWith("/settings")
  );

  const go = (path) => navigate(path);

  return (
    <Box sx={{ width: 240, borderRight: "1px solid #e5e7eb", mx: 2 }}>
      <List>
        <ListItemButton onClick={() => go("/dashboard")}>
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>

        <ListItemButton onClick={() => setOpenTeams(!openTeams)}>
          <ListItemIcon>
            <GroupWorkIcon />
          </ListItemIcon>
          <ListItemText primary="Teams" />
        </ListItemButton>

        <Collapse in={openTeams}>
          <List disablePadding>
            <ListItemButton sx={{ pl: 5 }} onClick={() => go("/dashboard/teams/groups")}>
              <ListItemIcon>
                <GroupsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Groups" />
            </ListItemButton>

            <ListItemButton sx={{ pl: 5 }} onClick={() => go("/dashboard/teams/members")}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Members" />
            </ListItemButton>

            <ListItemButton sx={{ pl: 5 }} onClick={() => go("/dashboard/teams/projects")}>
              <ListItemIcon>
                <FolderIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Projects" />
            </ListItemButton>

            <ListItemButton sx={{ pl: 5 }} onClick={() => go("/dashboard/teams/accounts")}>
              <ListItemIcon>
                <AccountCircleIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Accounts" />
            </ListItemButton>

            <ListItemButton sx={{ pl: 5 }} onClick={() => go("/dashboard/teams/services")}>
              <ListItemIcon>
                <BuildIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Services" />
            </ListItemButton>

            <ListItemButton sx={{ pl: 5 }} onClick={() => go("/dashboard/teams/equipments")}>
              <ListItemIcon>
                <DevicesIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Equipments" />
            </ListItemButton>

            <ListItemButton sx={{ pl: 5 }} onClick={() => go("/dashboard/teams/realguys")}>
              <ListItemIcon>
                <EngineeringIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Realguys" />
            </ListItemButton>
          </List>
        </Collapse>

        <ListItemButton onClick={() => setOpenReports(!openReports)}>
          <ListItemIcon>
            <BarChartIcon />
          </ListItemIcon>
          <ListItemText primary="Report" />
        </ListItemButton>

        <Collapse in={openReports}>
          <List disablePadding>
            <ListItemButton sx={{ pl: 5 }} onClick={() => go("/dashboard/report/plan")}>
              <ListItemIcon>
                <EventNoteIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Plan" />
            </ListItemButton>

            <ListItemButton sx={{ pl: 5 }} onClick={() => go("/dashboard/report/result")}>
              <ListItemIcon>
                <AssignmentTurnedInIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Result" />
            </ListItemButton>

            <ListItemButton sx={{ pl: 5 }} onClick={() => go("/dashboard/report/progress")}>
              <ListItemIcon>
                  <AnalyticsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Analytics" />
            </ListItemButton>
          </List>
        </Collapse>

        <ListItemButton onClick={() => go("dashboard/announcements")}>
          <ListItemIcon>
            <AnnouncementIcon />
          </ListItemIcon>
          <ListItemText primary="Announcements" />
        </ListItemButton>

        <ListItemButton onClick={() => setOpenSettings(!openSettings)}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItemButton>

        <Collapse in={openSettings}>
          <List disablePadding>
            <ListItemButton sx={{ pl: 5 }} onClick={() => go("/settings/general")}>
              <ListItemIcon>
                <TuneIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="General" />
            </ListItemButton>

            <ListItemButton sx={{ pl: 5 }} onClick={() => go("/settings/announcements")}>
              <ListItemIcon>
                <CampaignIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Announcements" />
            </ListItemButton>

            <ListItemButton sx={{ pl: 5 }} onClick={() => go("/settings/notifications")}>
              <ListItemIcon>
                <NotificationsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Notifications" />
            </ListItemButton>
          </List>
        </Collapse>

      </List>
    </Box>
  );
};

export default Sidebar;
