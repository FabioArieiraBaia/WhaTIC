const fs = require('fs');

const path = 'c:/xampp/htdocs/boot2/frontend/src/layout/MainListItems.js';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  'import EventIcon from "@material-ui/icons/Event";',
  'import EventIcon from "@material-ui/icons/Event";\nimport HeadsetMicIcon from "@material-ui/icons/HeadsetMic";\nimport SupervisorAccountIcon from "@material-ui/icons/SupervisorAccount";\nimport BusinessCenterIcon from "@material-ui/icons/BusinessCenter";'
);

content = content.replace(
  'const [openCampaignSubmenu, setOpenCampaignSubmenu] = useState(false);',
  'const [openCampaignSubmenu, setOpenCampaignSubmenu] = useState(false);\n  const [openAtendimento, setOpenAtendimento] = useState(true);\n  const [openGestao, setOpenGestao] = useState(false);\n  const [openAdmin, setOpenAdmin] = useState(false);'
);

const newReturnBlock = `  return (
    <div onClick={drawerClose}>
      <ListItemLink
        small
        to="/"
        primary="Dashboard"
        icon={<DashboardOutlinedIcon />}
      />

      <Can
        role={user.profile}
        perform={"drawer-service-items:view"}
        no={()=>(
        <>
          <ListItem
            button
            onClick={() => setOpenAtendimento((prev) => !prev)}
          >
            <ListItemIcon>
              <HeadsetMicIcon />
            </ListItemIcon>
            <ListItemText primary={i18n.t("Atendimento")} />
            {openAtendimento ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </ListItem>
          <Collapse in={openAtendimento} timeout="auto" unmountOnExit>
            <List component="div" disablePadding style={{ paddingLeft: 15 }}>
              <ListItemLink
                to="/tickets"
                primary={i18n.t("mainDrawer.listItems.tickets")}
                icon={<WhatsAppIcon />}
              />
              <ListItemLink
                to="/chats"
                primary={i18n.t("mainDrawer.listItems.chats")}
                icon={
                  <Badge color="secondary" variant="dot" invisible={invisible}>
                    <ForumIcon />
                  </Badge>
                }
              />
              <ListItemLink
                to="/todolist"
                primary={i18n.t("mainDrawer.listItems.tasks")}
                icon={<BorderColorIcon />}
              />
              <ListItemLink
                to="/quick-messages"
                primary={i18n.t("mainDrawer.listItems.quickMessages")}
                icon={<FlashOnIcon />}
              />
              <ListItemLink
                to="/schedules"
                primary={i18n.t("mainDrawer.listItems.schedules")}
                icon={<EventIcon />}
              />
            </List>
          </Collapse>

          <ListItem
            button
            onClick={() => setOpenGestao((prev) => !prev)}
          >
            <ListItemIcon>
              <BusinessCenterIcon />
            </ListItemIcon>
            <ListItemText primary={i18n.t("Gestão")} />
            {openGestao ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </ListItem>
          <Collapse in={openGestao} timeout="auto" unmountOnExit>
            <List component="div" disablePadding style={{ paddingLeft: 15 }}>
              <ListItemLink
                to="/contacts"
                primary={i18n.t("mainDrawer.listItems.contacts")}
                icon={<ContactPhoneOutlinedIcon />}
              />
              <ListItemLink
                to="/tags"
                primary={i18n.t("mainDrawer.listItems.tags")}
                icon={<LocalOfferIcon />}
              />
              <ListItemLink
                to="/helps"
                primary={i18n.t("mainDrawer.listItems.helps")}
                icon={<HelpOutlineIcon />}
              />
              <ListItemLink
                to="/products"
                primary={i18n.t("Produtos")}
                icon={<ShoppingCartIcon />}
              />
            </List>
          </Collapse>
        </>
        )}
      />

      <Can
        role={user.profile}
        perform="drawer-admin-items:view"
        yes={() => (
          <>
            <Divider />
            <ListItem
              button
              onClick={() => setOpenAdmin((prev) => !prev)}
            >
              <ListItemIcon>
                <SupervisorAccountIcon />
              </ListItemIcon>
              <ListItemText primary={i18n.t("Administração")} />
              {openAdmin ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItem>
            <Collapse in={openAdmin} timeout="auto" unmountOnExit>
              <List component="div" disablePadding style={{ paddingLeft: 15 }}>
                {showCampaigns && (
                  <>
                    <ListItem
                      button
                      onClick={() => setOpenCampaignSubmenu((prev) => !prev)}
                    >
                      <ListItemIcon>
                        <EventAvailableIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={i18n.t("mainDrawer.listItems.campaigns")}
                      />
                      {openCampaignSubmenu ? (
                        <ExpandLessIcon />
                      ) : (
                        <ExpandMoreIcon />
                      )}
                    </ListItem>
                    <Collapse
                      style={{ paddingLeft: 15 }}
                      in={openCampaignSubmenu}
                      timeout="auto"
                      unmountOnExit
                    >
                      <List component="div" disablePadding>
                        <ListItem onClick={() => history.push("/campaigns")} button>
                          <ListItemIcon>
                            <ListIcon />
                          </ListItemIcon>
                          <ListItemText primary="Listagem" />
                        </ListItem>
                        <ListItem
                          onClick={() => history.push("/contact-lists")}
                          button
                        >
                          <ListItemIcon>
                            <PeopleIcon />
                          </ListItemIcon>
                          <ListItemText primary="Listas de Contatos" />
                        </ListItem>
                        <ListItem
                          onClick={() => history.push("/campaigns-config")}
                          button
                        >
                          <ListItemIcon>
                            <SettingsOutlinedIcon />
                          </ListItemIcon>
                          <ListItemText primary="Configurações" />
                        </ListItem>
                      </List>
                    </Collapse>
                  </>
                )}
                {user.super && (
                  <ListItemLink
                    to="/announcements"
                    primary={i18n.t("mainDrawer.listItems.annoucements")}
                    icon={<AnnouncementIcon />}
                  />
                )}
                <ListItemLink
                  to="/connections"
                  primary={i18n.t("mainDrawer.listItems.connections")}
                  icon={
                    <Badge badgeContent={connectionWarning ? "!" : 0} color="error">
                      <SyncAltIcon />
                    </Badge>
                  }
                />
                <ListItemLink
                  to="/queues"
                  primary={i18n.t("mainDrawer.listItems.queues")}
                  icon={<AccountTreeOutlinedIcon />}
                />
                <ListItemLink
                  to="/users"
                  primary={i18n.t("mainDrawer.listItems.users")}
                  icon={<PeopleAltOutlinedIcon />}
                />
                <ListItemLink
                  to="/messages-api"
                  primary={i18n.t("mainDrawer.listItems.messagesAPI")}
                  icon={<CodeRoundedIcon />}
                />
                <ListItemLink
                  to="/financeiro"
                  primary={i18n.t("mainDrawer.listItems.financeiro")}
                  icon={<LocalAtmIcon />}
                />
                <ListItemLink
                  to="/settings"
                  primary={i18n.t("mainDrawer.listItems.settings")}
                  icon={<SettingsOutlinedIcon />}
                />
              </List>
            </Collapse>
            
            <Divider />
            <Typography style={{ fontSize: "12px", padding: "10px", textAlign: "right", fontWeight: "bold" }}>
              {\`\${gitinfo.tagName || gitinfo.branchName + " " + gitinfo.commitHash }\`} 
              &nbsp;/&nbsp;
              {\`\${gitinfo.buildTimestamp }\`}
            </Typography>
          </>
        )}
      />
      <Divider />
    </div>
  );
};

export default MainListItems;`;

const returnIndex = content.indexOf('  return (');
if (returnIndex !== -1) {
  content = content.substring(0, returnIndex) + newReturnBlock;
  fs.writeFileSync(path, content, 'utf8');
} else {
  console.log("Could not find 'return ('");
}
