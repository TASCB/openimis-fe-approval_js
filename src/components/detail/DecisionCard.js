import React from 'react';
import { Grid, TextField, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { DetailCard, useAP } from './common';

const useStyles = makeStyles((theme) => ({
  hint: { fontSize: 13, opacity: 0.8, marginBottom: theme.spacing(1.5) },
}));

// The comment goes with whichever action the reviewer picks in the header; the signature
// is recorded only with an approval.
export default function DecisionCard({
  comment, onComment, commentError, signature, onSignature,
}) {
  const classes = useStyles();
  const { formatMessage } = useAP();
  return (
    <DetailCard title={formatMessage('detail.decision')}>
      <Typography className={classes.hint}>{formatMessage('detail.decision.hint')}</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            multiline
            rows={3}
            fullWidth
            variant="outlined"
            label={formatMessage('field.comment')}
            placeholder={formatMessage('detail.decision.placeholder')}
            value={comment}
            onChange={(e) => onComment(e.target.value)}
            error={!!commentError}
            helperText={commentError || ' '}
            inputProps={{ maxLength: 2000 }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={formatMessage('field.signature')}
            helperText={formatMessage('field.signature.help')}
            value={signature}
            onChange={(e) => onSignature(e.target.value)}
            inputProps={{ maxLength: 255 }}
          />
        </Grid>
      </Grid>
    </DetailCard>
  );
}
