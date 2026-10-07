import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { DetailCard, InfoField, useAP } from './common';

const useStyles = makeStyles((theme) => ({
  subject: { fontWeight: 600, marginBottom: theme.spacing(1.5) },
  effect: { fontSize: 13, opacity: 0.8, marginTop: theme.spacing(2) },
}));

// What is being approved, from the request summary's `details` list ({label, value}).
export default function AboutCard({ summary }) {
  const classes = useStyles();
  const { formatMessage } = useAP();
  return (
    <DetailCard title={formatMessage('detail.about.title')}>
      {summary.title && <Typography className={classes.subject}>{summary.title}</Typography>}
      <Grid container spacing={2}>
        {(summary.details || []).map((d) => (
          <InfoField key={d.label} label={d.label} value={d.value} />
        ))}
      </Grid>
      {summary.effect && <Typography className={classes.effect}>{summary.effect}</Typography>}
    </DetailCard>
  );
}
