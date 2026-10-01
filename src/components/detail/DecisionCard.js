import React from 'react';
import {
  Button, Grid, TextField, Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Check from '@material-ui/icons/Check';
import { DetailCard, useAP } from './common';

const useStyles = makeStyles((theme) => ({
  hint: { fontSize: 13, opacity: 0.8, marginBottom: theme.spacing(1.5) },
  foot: {
    display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: theme.spacing(1), marginTop: theme.spacing(1),
  },
}));

// The signature is recorded only with an approval.
export default function DecisionCard({
  comment, onComment, commentError, signature, onSignature,
  canDecide, canReturn, canCancel, onAction, submitting,
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
      <div className={classes.foot}>
        {canCancel && (
          <Button color="primary" disabled={submitting} onClick={() => onAction('cancel')}>
            {formatMessage('action.cancel')}
          </Button>
        )}
        {canDecide && canReturn && (
          <Button color="primary" disabled={submitting} onClick={() => onAction('return')}>
            {formatMessage('action.return')}
          </Button>
        )}
        {canDecide && (
          <>
            <Button color="primary" disabled={submitting} onClick={() => onAction('reject')}>
              {formatMessage('action.reject')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Check />}
              disabled={submitting}
              onClick={() => onAction('approve')}
            >
              {formatMessage('action.approve')}
            </Button>
          </>
        )}
      </div>
    </DetailCard>
  );
}
