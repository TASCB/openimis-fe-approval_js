import React from 'react';
import { Avatar, Button, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {
  DetailCard, initials, personName, useAP,
} from './common';

const useStyles = makeStyles((theme) => ({
  person: { display: 'flex', alignItems: 'center', gap: theme.spacing(1.5) },
  avatar: { background: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontSize: 14 },
  name: { fontWeight: 600, fontSize: 14 },
  muted: { fontSize: 13, opacity: 0.8 },
  tech: {
    display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: theme.spacing(2), rowGap: theme.spacing(1), fontSize: 12,
  },
  techLabel: { opacity: 0.75, fontSize: 12 },
  mono: { fontFamily: 'monospace', wordBreak: 'break-all' },
}));

export function RequesterCard({ request }) {
  const classes = useStyles();
  const { formatMessage, formatDateTimeFromISO } = useAP();
  const name = personName(request.requestedBy);
  if (!name) return null;
  return (
    <DetailCard title={formatMessage('field.requestedBy')}>
      <div className={classes.person}>
        <Avatar className={classes.avatar}>{initials(name)}</Avatar>
        <div>
          <div className={classes.name}>{name}</div>
          {request.requestedBy?.username && name !== request.requestedBy.username && (
            <div className={classes.muted}>{request.requestedBy.username}</div>
          )}
          {!!request.requestedAt && <div className={classes.muted}>{formatDateTimeFromISO(request.requestedAt)}</div>}
        </div>
      </div>
    </DetailCard>
  );
}

// Support detail; collapsed so it does not compete with what the approver needs.
export function TechnicalCard({ request }) {
  const classes = useStyles();
  const { formatMessage, formatDateTimeFromISO } = useAP();
  const [open, setOpen] = React.useState(false);
  const rows = [
    ['detail.tech.flow', request.flow?.code],
    ['detail.tech.domain', request.flow?.domain],
    ['detail.tech.model', request.entityModel],
    ['detail.tech.entityId', request.objectId],
    ['detail.tech.approvalId', request.uuid],
    ['detail.tech.created', request.requestedAt && formatDateTimeFromISO(request.requestedAt)],
    ['detail.tech.completed', request.completedAt && formatDateTimeFromISO(request.completedAt)],
  ].filter(([, v]) => !!v);
  return (
    <DetailCard
      title={formatMessage('detail.tech.title')}
      action={(
        <Button size="small" color="primary" onClick={() => setOpen(!open)}>
          {formatMessage(open ? 'detail.tech.hide' : 'detail.tech.show')}
        </Button>
      )}
    >
      {open && (
        <div className={classes.tech}>
          {rows.map(([k, v]) => (
            <React.Fragment key={k}>
              <Typography component="span" className={classes.techLabel}>{formatMessage(k)}</Typography>
              <span className={classes.mono}>{v}</span>
            </React.Fragment>
          ))}
        </div>
      )}
    </DetailCard>
  );
}
