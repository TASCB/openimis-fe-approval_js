import React from 'react';
import { Chip, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Check from '@material-ui/icons/Check';
import Close from '@material-ui/icons/Close';
import Undo from '@material-ui/icons/Undo';
import { DetailCard, personName, useAP } from './common';

const useStyles = makeStyles((theme) => ({
  step: {
    display: 'flex', gap: theme.spacing(1.5), position: 'relative', paddingBottom: theme.spacing(2.5),
    '&:last-child': { paddingBottom: 0 },
    '&:last-child $rail': { display: 'none' },
  },
  rail: {
    position: 'absolute', left: 15, top: 34, bottom: 2, width: 2, background: theme.palette.divider,
  },
  dot: {
    width: 32,
    height: 32,
    flex: '0 0 32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 14,
    border: `2px solid ${theme.palette.divider}`,
    background: theme.palette.background.paper,
    color: theme.palette.text.primary,
  },
  dotActive: { background: theme.palette.primary.main, borderColor: theme.palette.primary.main, color: theme.palette.primary.contrastText },
  dotDone: { background: theme.palette.success.main, borderColor: theme.palette.success.main, color: '#fff' },
  dotFailed: { background: theme.palette.error.main, borderColor: theme.palette.error.main, color: '#fff' },
  dotReturned: { background: theme.palette.warning.main, borderColor: theme.palette.warning.main, color: '#fff' },
  head: {
    display: 'flex', alignItems: 'center', gap: theme.spacing(1), flexWrap: 'wrap', minHeight: 32,
  },
  label: { fontWeight: 600 },
  muted: { fontSize: 13, opacity: 0.8 },
  chip: { height: 22, fontSize: 12 },
  chipActive: { borderColor: theme.palette.warning.main, color: theme.palette.warning.main },
  decision: {
    marginTop: theme.spacing(1),
    padding: theme.spacing(1, 1.5),
    borderLeft: `3px solid ${theme.palette.divider}`,
    fontSize: 13,
  },
  comment: { whiteSpace: 'pre-wrap', marginTop: 2 },
  hint: { fontSize: 12, opacity: 0.8 },
}));

export default function ApprovalChainCard({ request }) {
  const classes = useStyles();
  const { formatMessage, formatMessageWithValues, formatDateTimeFromISO } = useAP();
  const steps = [...(request.steps || [])].sort((a, b) => a.order - b.order);
  const pending = request.status === 'PENDING';

  const stateOf = (s) => {
    if (s.status === 'APPROVED') return 'done';
    if (s.status === 'REJECTED') return 'failed';
    if (s.status === 'RETURNED') return 'returned';
    if (pending && s.order === request.currentStepOrder) return 'active';
    return 'waiting';
  };
  const dotClass = {
    active: classes.dotActive, done: classes.dotDone, failed: classes.dotFailed, returned: classes.dotReturned, waiting: '',
  };
  const dotIcon = {
    done: <Check fontSize="small" />, failed: <Close fontSize="small" />, returned: <Undo fontSize="small" />,
  };

  return (
    <DetailCard
      title={formatMessage('detail.steps')}
      action={<span className={classes.hint}>{formatMessage('detail.chain.sequential')}</span>}
    >
      {!steps.length && <Typography className={classes.muted}>{formatMessage('detail.chain.none')}</Typography>}
      {steps.map((s) => {
        const state = stateOf(s);
        let line = null;
        if (state === 'active') {
          line = formatMessageWithValues('detail.chain.openedAwaiting', {
            opened: s.dateCreated ? formatDateTimeFromISO(s.dateCreated) : '—',
          });
        } else if (state === 'waiting') {
          line = formatMessage(pending ? 'detail.chain.unlocksAfter' : 'detail.chain.notReached');
        }
        return (
          <div key={s.uuid || s.id} className={classes.step}>
            <span className={classes.rail} />
            <span className={`${classes.dot} ${dotClass[state]}`}>{dotIcon[state] || s.order}</span>
            <div>
              <div className={classes.head}>
                <span className={classes.label}>{s.label || s.code}</span>
                <Chip
                  size="small"
                  variant="outlined"
                  className={`${classes.chip} ${state === 'active' ? classes.chipActive : ''}`}
                  label={formatMessage(state === 'active' ? 'detail.chain.awaiting' : `stepStatus.${s.status}`)}
                />
              </div>
              {!!line && <div className={classes.muted}>{line}</div>}
              {(s.decisions || []).map((d) => (
                <div key={d.uuid || d.id} className={classes.decision}>
                  <b>{formatMessage(`decision.${d.decision}`)}</b>
                  {' · '}
                  {personName(d.approver) || '?'}
                  {d.decidedAt ? ` · ${formatDateTimeFromISO(d.decidedAt)}` : ''}
                  {!!d.comment && <div className={classes.comment}>{d.comment}</div>}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </DetailCard>
  );
}
