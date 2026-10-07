import React from 'react';
import {
  Button, Grid, TextField, Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Check from '@material-ui/icons/Check';
import { DetailCard, useAP } from './common';

const useStyles = makeStyles((theme) => ({
  hint: { fontSize: 13, opacity: 0.8, marginBottom: theme.spacing(1.5) },
  blocked: { fontSize: 13, fontWeight: 600, alignSelf: 'center' },
  foot: {
    display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: theme.spacing(1), marginTop: theme.spacing(1),
  },
}));

export default function DecisionCard({
  comment, onComment, commentError,
  canDecide, canReturn, canCancel, onAction, submitting, approveBlocked = false,
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
            {approveBlocked ? (
              <Typography color="error" className={classes.blocked}>
                {formatMessage('detail.decision.ownRequest')}
              </Typography>
            ) : (
              <Button
                variant="contained"
                color="primary"
                startIcon={<Check />}
                disabled={submitting}
                onClick={() => onAction('approve')}
              >
                {formatMessage('action.approve')}
              </Button>
            )}
          </>
        )}
      </div>
    </DetailCard>
  );
}
