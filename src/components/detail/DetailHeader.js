import React from 'react';
import {
  Button, Divider, IconButton, Paper, Tab, Tooltip, Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import Check from '@material-ui/icons/Check';
import ApprovalStatusChip from '../ApprovalStatusChip';
import { useAP } from './common';

// Same building blocks as fe-core's <Form> header (paper / paper.header / paper.action),
// plus the request's chips, decision actions and the tab row.
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
  paperHeaderAction: theme.paper.action,
  actions: {
    display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end', marginLeft: 'auto',
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
  request, step, stepTotal, tab, onTab, onBack, canDecide, canReturn, canCancel, onAction, submitting,
}) {
  const classes = useStyles();
  const { formatMessage, formatMessageWithValues } = useAP();

  const actions = [];
  if (canCancel) {
    actions.push(
      <Button color="primary" disabled={submitting} onClick={() => onAction('cancel')}>
        {formatMessage('action.cancel')}
      </Button>,
    );
  }
  if (canDecide && canReturn) {
    actions.push(
      <Button color="primary" disabled={submitting} onClick={() => onAction('return')}>
        {formatMessage('action.return')}
      </Button>,
    );
  }
  if (canDecide) {
    actions.push(
      <Button color="primary" disabled={submitting} onClick={() => onAction('reject')}>
        {formatMessage('action.reject')}
      </Button>,
      <Button variant="contained" color="primary" startIcon={<Check />} disabled={submitting} onClick={() => onAction('approve')}>
        {formatMessage('action.approve')}
      </Button>,
    );
  }

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
        <div className={classes.actions}>
          {actions.map((a, idx) => (
            // eslint-disable-next-line react/no-array-index-key
            <span key={`approval-action-${idx}`} className={classes.paperHeaderAction}>{a}</span>
          ))}
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
