import React, { useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Paper, Grid, Tab } from '@material-ui/core';
import {
  Helmet, useTranslations, useModulesManager,
} from '@openimis/fe-core';
import { MODULE_NAME } from '../constants';
import ApprovalRequestSearcher from '../components/ApprovalRequestSearcher';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
  paper: { ...theme.paper.paper, margin: 0, marginBottom: theme.spacing(2) },
  tableTitle: theme.table.title,
  tabs: { display: 'flex', alignItems: 'center', flexWrap: 'nowrap', overflowX: 'auto' },
  selectedTab: { borderBottom: '4px solid white', minWidth: 'auto' },
  unselectedTab: { borderBottom: '4px solid transparent', minWidth: 'auto' },
}));

const TABS = [['mine', 'approvals.tab.mine'], ['all', 'approvals.tab.all']];

function ApprovalsPage() {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);
  const [tab, setTab] = useState('mine');

  return (
    <div className={classes.page}>
      <Helmet title={formatMessage('approvals.page.title')} />
      <Paper className={classes.paper}>
        <Grid container className={`${classes.tableTitle} ${classes.tabs}`}>
          {TABS.map(([value, label]) => (
            <Tab
              key={value}
              value={value}
              label={formatMessage(label)}
              selected={tab === value}
              className={tab === value ? classes.selectedTab : classes.unselectedTab}
              onChange={(e, v) => setTab(v)}
            />
          ))}
        </Grid>
      </Paper>
      {/* Only one Searcher is mounted at a time, so they share the `requests` store slice cleanly. */}
      {tab === 'mine' ? <ApprovalRequestSearcher mine /> : <ApprovalRequestSearcher />}
    </div>
  );
}

export default ApprovalsPage;
