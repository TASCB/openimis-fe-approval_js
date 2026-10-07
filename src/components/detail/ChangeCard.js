import React, { useState } from 'react';
import {
  Button, Table, TableBody, TableCell, TableHead, TableRow, Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { DetailCard, useAP } from './common';

const useStyles = makeStyles((theme) => ({
  subject: { fontWeight: 600, marginBottom: theme.spacing(1.5) },
  table: { tableLayout: 'fixed' },
  head: { fontWeight: 700, fontSize: 12 },
  changed: { backgroundColor: theme.palette.action.hover },
  after: { fontWeight: 600 },
  unchanged: { opacity: 0.6 },
  notSet: { fontStyle: 'italic', opacity: 0.7 },
  toggle: { textTransform: 'none', marginTop: theme.spacing(1) },
  label: {
    fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.7, marginTop: theme.spacing(2),
  },
  reason: { whiteSpace: 'pre-wrap', fontSize: 14 },
  effect: { fontSize: 13, opacity: 0.8, marginTop: theme.spacing(2) },
}));

// Before/after of a proposed change, from the request summary's `changes` list
// ({label, before, after, changed}), with the requester's reason.
export default function ChangeCard({ summary }) {
  const classes = useStyles();
  const { formatMessage, formatMessageWithValues } = useAP();
  const [showAll, setShowAll] = useState(false);
  const changes = summary.changes || [];
  const changed = changes.filter((c) => c.changed);
  const unchanged = changes.length - changed.length;
  const rows = showAll ? changes : changed;

  const value = (v) => (v === null || v === undefined || v === ''
    ? <span className={classes.notSet}>{formatMessage('detail.change.notSet')}</span> : v);

  return (
    <DetailCard title={formatMessage('detail.change.title')}>
      <Typography className={classes.subject}>{summary.title}</Typography>
      <Table size="small" className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell className={classes.head}>{formatMessage('detail.change.field')}</TableCell>
            <TableCell className={classes.head}>{formatMessage('detail.change.before')}</TableCell>
            <TableCell className={classes.head}>{formatMessage('detail.change.after')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((c) => (
            <TableRow key={c.label} className={c.changed ? classes.changed : classes.unchanged}>
              <TableCell>{c.label}</TableCell>
              <TableCell>{value(c.before)}</TableCell>
              <TableCell className={c.changed ? classes.after : ''}>{value(c.after)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {unchanged > 0 && (
        <Button size="small" color="primary" className={classes.toggle} onClick={() => setShowAll(!showAll)}>
          {formatMessageWithValues(showAll ? 'detail.change.hideUnchanged' : 'detail.change.showUnchanged', { count: unchanged })}
        </Button>
      )}
      <Typography className={classes.label}>{formatMessage('detail.change.reason')}</Typography>
      <Typography className={summary.reason ? classes.reason : classes.notSet}>
        {summary.reason || formatMessage('detail.change.noReason')}
      </Typography>
      {summary.effect && <Typography className={classes.effect}>{summary.effect}</Typography>}
    </DetailCard>
  );
}
