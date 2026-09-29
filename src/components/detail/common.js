import React from 'react';
import {
  Divider, Grid, Paper, Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useModulesManager, useTranslations } from '@openimis/fe-core';
import { MODULE_NAME } from '../../constants';

export function useAP() {
  const modulesManager = useModulesManager();
  return { modulesManager, ...useTranslations(MODULE_NAME, modulesManager) };
}

export const personName = (user) => {
  if (!user) return '';
  const full = [user.otherNames, user.lastName].filter(Boolean).join(' ').trim();
  return full || user.username || '';
};

export const initials = (name) => (name || '?').split(/\s+/).filter(Boolean).slice(0, 2)
  .map((w) => w[0].toUpperCase())
  .join('');

// Summary keys come from each domain as snake_case ("batch_type") — show them as words.
export const humanise = (key) => {
  const words = String(key).replace(/[_-]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

const useCardStyles = makeStyles((theme) => ({
  paper: { ...theme.paper.paper, margin: 0, marginBottom: theme.spacing(2) },
  title: {
    ...theme.paper.title,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
    padding: theme.spacing(1.25, 2),
  },
  body: { padding: theme.spacing(2) },
}));

export function DetailCard({ title, action = null, children }) {
  const classes = useCardStyles();
  return (
    <Paper className={classes.paper}>
      <div className={classes.title}>
        <Typography variant="subtitle1">{title}</Typography>
        {action}
      </div>
      <Divider />
      <div className={classes.body}>{children}</div>
    </Paper>
  );
}

const useFieldStyles = makeStyles(() => ({
  label: { fontSize: 12, opacity: 0.75, marginBottom: 2 },
  value: { fontSize: 14, fontWeight: 500, wordBreak: 'break-word' },
  missing: { fontSize: 14, opacity: 0.7 },
  mono: { fontFamily: 'monospace', fontSize: 13 },
}));

export function InfoField({
  label, value, missing = '—', mono = false, sm = 4,
}) {
  const classes = useFieldStyles();
  const has = value !== null && value !== undefined && value !== '';
  return (
    <Grid item xs={12} sm={sm}>
      <div className={classes.label}>{label}</div>
      {has
        ? <div className={`${classes.value} ${mono ? classes.mono : ''}`}>{value}</div>
        : <div className={classes.missing}>{missing}</div>}
    </Grid>
  );
}
