import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Collapse
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
    <Box sx={{ width: 240, borderRight: "1px solid #e5e7eb" }}>
      <List>

        <ListItemButton onClick={() => go("/dashboard")}>
          <ListItemText primary="Dashboard" />
        </ListItemButton>

        <ListItemButton onClick={() => setOpenTeams(!openTeams)}>
          <ListItemText primary="Teams" />
        </ListItemButton>

        <Collapse in={openTeams}>
          <List disablePadding>
            <ListItemButton onClick={() => go("/dashboard/teams/groups")} sx={{ pl: 5 }}>
              <ListItemText primary="Groups" />
            </ListItemButton>
            <ListItemButton onClick={() => go("/dashboard/teams/members")} sx={{ pl: 5 }}>
              <ListItemText primary="Members" />
            </ListItemButton>
            <ListItemButton onClick={() => go("/dashboard/teams/projects")} sx={{ pl: 5 }}>
              <ListItemText primary="Projects" />
            </ListItemButton>
            <ListItemButton onClick={() => go("/dashboard/teams/accounts")} sx={{ pl: 5 }}>
              <ListItemText primary="Accounts" />
            </ListItemButton>
            <ListItemButton onClick={() => go("/dashboard/teams/services")} sx={{ pl: 5 }}>
              <ListItemText primary="Services" />
            </ListItemButton>
            <ListItemButton onClick={() => go("/dashboard/teams/equipments")} sx={{ pl: 5 }}>
              <ListItemText primary="Equipments" />
            </ListItemButton>
          </List>
        </Collapse>

        <ListItemButton onClick={() => setOpenReports(!openReports)}>
          <ListItemText primary="Reports" />
        </ListItemButton>

        <Collapse in={openReports}>
          <List disablePadding>
            <ListItemButton onClick={() => go("/reports/plan")} sx={{ pl: 5 }}>
              <ListItemText primary="Plan" />
            </ListItemButton>
            <ListItemButton onClick={() => go("/reports/result")} sx={{ pl: 5 }}>
              <ListItemText primary="Result" />
            </ListItemButton>
            <ListItemButton onClick={() => go("/reports/progress")} sx={{ pl: 5 }}>
              <ListItemText primary="Progress" />
            </ListItemButton>
          </List>
        </Collapse>

        <ListItemButton onClick={() => go("/announcements")}>
          <ListItemText primary="Announcements" />
        </ListItemButton>

        <ListItemButton onClick={() => setOpenSettings(!openSettings)}>
          <ListItemText primary="Settings" />
        </ListItemButton>

        <Collapse in={openSettings}>
          <List disablePadding>
            <ListItemButton onClick={() => go("/settings/general")} sx={{ pl: 5 }}>
              <ListItemText primary="General" />
            </ListItemButton>
            <ListItemButton onClick={() => go("/settings/announcements")} sx={{ pl: 5 }}>
              <ListItemText primary="Announcements" />
            </ListItemButton>
            <ListItemButton onClick={() => go("/settings/notifications")} sx={{ pl: 5 }}>
              <ListItemText primary="Notifications" />
            </ListItemButton>
          </List>
        </Collapse>

      </List>
    </Box>
  );
};

export default Sidebar;
