import React from 'react';
import {
  Divider, IconButton, Paper, Tab, Tooltip, Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ApprovalStatusChip from '../ApprovalStatusChip';
import { useAP } from './common';

const useStyles = makeStyles((theme) => ({
  paper: { ...theme.paper.paper, margin: 0, marginBottom: theme.spacing(2) },
  paperHeader: {
    ...theme.paper.header,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
  titleRow: {
    display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: theme.spacing(1),
  },
  tableTitle: theme.table.title,
  tabRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'nowrap', overflowX: 'auto',
  },
  tabs: { display: 'flex', alignItems: 'center' },
  selectedTab: { borderBottom: '4px solid white', minWidth: 'auto' },
  unselectedTab: { borderBottom: '4px solid transparent', minWidth: 'auto' },
  stepText: { fontSize: 12, whiteSpace: 'nowrap', paddingLeft: theme.spacing(2) },
}));

export const TABS = ['overview', 'history'];

export default function DetailHeader({
  request, step, stepTotal, tab, onTab, onBack,
}) {
  const classes = useStyles();
  const { formatMessage, formatMessageWithValues } = useAP();

  return (
    <Paper className={classes.paper}>
      <div className={classes.paperHeader}>
        <div className={classes.titleRow}>
          <Tooltip title={formatMessage('action.back')}>
            <IconButton onClick={onBack}><ChevronLeftIcon /></IconButton>
          </Tooltip>
          <Typography variant="h6">{request.flow?.name || request.flow?.code}</Typography>
          <ApprovalStatusChip status={request.status} />
        </div>
      </div>
      <Divider />
      <div className={`${classes.tableTitle} ${classes.tabRow}`}>
        <div className={classes.tabs}>
          {TABS.map((t) => (
            <Tab
              key={t}
              value={t}
              label={formatMessage(`detail.tab.${t}`)}
              selected={tab === t}
              className={tab === t ? classes.selectedTab : classes.unselectedTab}
              onChange={(e, v) => onTab(v)}
            />
          ))}
        </div>
        {!!step && (
          <span className={classes.stepText}>
            {formatMessageWithValues('detail.header.step', { n: step.order, total: stepTotal, label: step.label || step.code })}
          </span>
        )}
      </div>
    </Paper>
  );
}
