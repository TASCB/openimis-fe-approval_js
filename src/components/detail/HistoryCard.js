import React from 'react';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { DetailCard, personName, useAP } from './common';

const useStyles = makeStyles((theme) => ({
  row: {
    display: 'grid',
    gridTemplateColumns: '170px 1fr',
    gap: theme.spacing(2),
    padding: theme.spacing(1.25, 0),
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:last-child': { borderBottom: 0 },
  },
  when: { fontSize: 13, opacity: 0.8 },
  what: { fontWeight: 600, fontSize: 14 },
  comment: { fontSize: 13, whiteSpace: 'pre-wrap', marginTop: 2 },
}));

// Only what the engine records: the request, every decision and the completion, oldest first.
export default function HistoryCard({ request }) {
  const classes = useStyles();
  const { formatMessage, formatMessageWithValues, formatDateTimeFromISO } = useAP();

  const events = [{ at: request.requestedAt, what: formatMessage('detail.history.requested'), who: personName(request.requestedBy) }];
  (request.steps || []).forEach((s) => (s.decisions || []).forEach((d) => events.push({
    at: d.decidedAt,
    what: formatMessageWithValues('detail.history.decision', {
      decision: formatMessage(`decision.${d.decision}`), step: s.label || s.code,
    }),
    who: personName(d.approver),
    comment: d.comment,
  })));
  if (request.completedAt) {
    events.push({ at: request.completedAt, what: formatMessageWithValues('detail.history.completed', { status: formatMessage(`status.${request.status}`) }) });
  }
  events.sort((a, b) => String(a.at || '').localeCompare(String(b.at || '')));

  return (
    <DetailCard title={formatMessage('detail.tab.history')}>
      {events.map((e) => (
        <div key={`${e.at}-${e.what}`} className={classes.row}>
          <span className={classes.when}>{e.at ? formatDateTimeFromISO(e.at) : '—'}</span>
          <div>
            <div className={classes.what}>{e.what}</div>
            {!!e.who && <Typography variant="body2">{e.who}</Typography>}
            {!!e.comment && <div className={classes.comment}>{e.comment}</div>}
          </div>
        </div>
      ))}
    </DetailCard>
  );
}
