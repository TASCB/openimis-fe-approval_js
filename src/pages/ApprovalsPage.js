import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/styles';
import { Paper, Tabs, Tab } from '@material-ui/core';
import {
  Helmet, useTranslations, useModulesManager,
} from '@openimis/fe-core';
import { MODULE_NAME, RIGHT_REQUEST_SEARCH } from '../constants';
import ApprovalRequestSearcher from '../components/ApprovalRequestSearcher';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
  tabs: { marginBottom: theme.spacing(2) },
}));

function ApprovalsPage() {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);
  const rights = useSelector((s) => s.core.user.i_user.rights ?? []);
  const [tab, setTab] = useState(0);

  if (!rights.includes(RIGHT_REQUEST_SEARCH)) return null;

  return (
    <div className={classes.page}>
      <Helmet title={formatMessage('approvals.page.title')} />
      <Paper className={classes.tabs}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)} indicatorColor="primary" textColor="primary">
          <Tab label={formatMessage('approvals.tab.mine')} />
          <Tab label={formatMessage('approvals.tab.all')} />
        </Tabs>
      </Paper>
      {/* Only one Searcher is mounted at a time, so they share the `requests` store slice cleanly. */}
      {tab === 0 ? <ApprovalRequestSearcher mine /> : <ApprovalRequestSearcher />}
    </div>
  );
}

export default ApprovalsPage;
