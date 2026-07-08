import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/styles';
import { useIntl } from 'react-intl';
import {
  Paper, Grid, Typography, Button, IconButton, Tooltip, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from '@material-ui/core';
import ArrowBack from '@material-ui/icons/ArrowBack';
import {
  Helmet, ProgressOrError, useTranslations, useModulesManager, useHistory, journalize,
  formatDateTimeFromISO,
} from '@openimis/fe-core';
import {
  MODULE_NAME, STATUS_COLOR, REQUEST_STATUS, STEP_STATUS, RIGHT_OVERRIDE, RIGHT_CANCEL,
} from '../constants';
import {
  fetchApprovalRequest, approveStep, rejectStep, returnStep, cancelRequest,
} from '../actions';
import ApprovalStatusChip from '../components/ApprovalStatusChip';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
  paper: theme.paper.paper,
  tableTitle: theme.table.title,
  item: theme.paper.item,
  label: { color: theme.palette.text.secondary, fontSize: 12, fontWeight: 700 },
  value: { fontSize: 15 },
  band: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' },
  actions: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  step: {
    display: 'flex', gap: 12, padding: theme.spacing(1.5),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  stepCurrent: { background: 'rgba(25,118,210,.06)' },
  dot: {
    width: 28, height: 28, borderRadius: 14, color: '#fff', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13,
  },
  decision: { fontSize: 13, color: theme.palette.text.secondary, marginTop: 4 },
}));

function Field({ label, value, classes }) {
  return (
    <Grid item xs={12} sm={6} md={4} className={classes.item}>
      <div className={classes.label}>{label}</div>
      <div className={classes.value}>{value || '—'}</div>
    </Grid>
  );
}

const ACTION_LABELS = {
  approve: 'action.approve', reject: 'action.reject', return: 'action.return', cancel: 'action.cancel',
};

export default function ApprovalDetailPage({ match }) {
  const classes = useStyles();
  const intl = useIntl();
  const dispatch = useDispatch();
  const history = useHistory();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);
  const fm = (id) => formatMessage(id);
  const uuid = match?.params?.approval_request_id;

  const request = useSelector((s) => s.approval?.request);
  const fetching = useSelector((s) => s.approval?.fetchingRequest);
  const error = useSelector((s) => s.approval?.errorRequest);
  const mutation = useSelector((s) => s.approval?.mutation);
  const submitting = useSelector((s) => s.approval?.submittingMutation);
  const rights = useSelector((s) => s.core?.user?.i_user?.rights ?? []);
  const userId = useSelector((s) => s.core?.user?.i_user?.id ?? s.core?.user?.id);

  const [dialog, setDialog] = useState(null); // { action, step }
  const [comment, setComment] = useState('');
  const [signature, setSignature] = useState('');
  const [prev, setPrev] = useState(false);

  useEffect(() => { if (uuid) dispatch(fetchApprovalRequest(uuid)); }, [uuid, dispatch]);
  useEffect(() => {
    if (prev && !submitting) {
      dispatch(journalize(mutation));
      if (uuid) dispatch(fetchApprovalRequest(uuid));
    }
    setPrev(submitting);
  }, [submitting]); // eslint-disable-line react-hooks/exhaustive-deps

  const steps = [...(request?.steps || [])].sort((a, b) => a.order - b.order);
  const isPending = request?.status === REQUEST_STATUS.PENDING;
  const currentStep = steps.find((s) => s.order === request?.currentStepOrder && isPending);

  const canActOnStep = (s) => isPending && s && s.status === STEP_STATUS.PENDING
    && (rights.includes(Number(s.requiredRight)) || rights.includes(RIGHT_OVERRIDE));
  const canCancel = isPending
    && (rights.includes(RIGHT_CANCEL) || rights.includes(RIGHT_OVERRIDE) || request?.requestedBy?.id === userId);

  const openDialog = (action) => { setComment(''); setSignature(''); setDialog({ action, step: currentStep }); };
  const confirm = () => {
    const r = request; const s = dialog.step;
    const label = fm(`mutation.${dialog.action}`);
    if (dialog.action === 'approve') dispatch(approveStep(r.uuid, s.uuid, { comment, signature }, label));
    else if (dialog.action === 'reject') dispatch(rejectStep(r.uuid, s.uuid, { comment }, label));
    else if (dialog.action === 'return') dispatch(returnStep(r.uuid, s.uuid, { comment }, label));
    else if (dialog.action === 'cancel') dispatch(cancelRequest(r.uuid, { reason: comment }, label));
    setDialog(null);
  };

  return (
    <div className={classes.page}>
      <Helmet title={fm('request.page.title')} />
      <ProgressOrError progress={fetching} error={error} />
      {!fetching && request && (
        <>
          <Paper className={classes.paper}>
            <Grid container className={`${classes.tableTitle} ${classes.band}`}>
              <div className={classes.actions}>
                <Tooltip title={fm('action.back')}>
                  <IconButton size="small" onClick={() => history.push(`/${modulesManager.getRef('approval.route.requests')}`)}><ArrowBack /></IconButton>
                </Tooltip>
                <Typography variant="h6">{request.flow?.name || request.flow?.code}</Typography>
                <ApprovalStatusChip status={request.status} />
              </div>
              <div className={classes.actions}>
                {canActOnStep(currentStep) && (
                  <>
                    <Button variant="contained" color="primary" disabled={submitting} onClick={() => openDialog('approve')}>{fm('action.approve')}</Button>
                    <Button variant="outlined" disabled={submitting} onClick={() => openDialog('reject')}>{fm('action.reject')}</Button>
                    <Button variant="outlined" disabled={submitting} onClick={() => openDialog('return')}>{fm('action.return')}</Button>
                  </>
                )}
                {canCancel && (
                  <Button variant="text" color="secondary" disabled={submitting} onClick={() => openDialog('cancel')}>{fm('action.cancel')}</Button>
                )}
              </div>
            </Grid>
            <Grid container>
              <Field classes={classes} label={fm('field.flow')} value={request.flow?.code} />
              <Field classes={classes} label={fm('field.entity')} value={`${request.entityModel || ''} ${(request.objectId || '').slice(0, 8)}`} />
              <Field classes={classes} label={fm('field.requestedBy')} value={request.requestedBy?.username} />
              <Field classes={classes} label={fm('field.requestedAt')} value={request.requestedAt ? formatDateTimeFromISO(modulesManager, intl, request.requestedAt) : ''} />
              {Object.entries(request.summary || {}).map(([k, v]) => (
                <Field key={k} classes={classes} label={k} value={typeof v === 'object' ? JSON.stringify(v) : String(v ?? '')} />
              ))}
            </Grid>
          </Paper>

          <Paper className={classes.paper} style={{ marginTop: 16 }}>
            <Grid container className={classes.tableTitle}>
              <Typography variant="subtitle1">{fm('detail.steps')}</Typography>
            </Grid>
            {steps.map((s) => {
              const cur = s.order === request.currentStepOrder && isPending;
              return (
                <div key={s.uuid || s.id} className={`${classes.step} ${cur ? classes.stepCurrent : ''}`}>
                  <span className={classes.dot} style={{ background: STATUS_COLOR[s.status] || '#9e9e9e' }}>{s.order}</span>
                  <div style={{ flex: 1 }}>
                    <div>
                      <b>{s.label || s.code}</b>
                      {'  '}
                      <Chip size="small" variant="outlined" label={fm(`stepStatus.${s.status}`)} />
                    </div>
                    {(s.decisions || []).map((d) => (
                      <div key={d.uuid || d.id} className={classes.decision}>
                        {fm(`decision.${d.decision}`)}
                        {' — '}
                        {d.approver?.username || '?'}
                        {d.comment ? ` · ${d.comment}` : ''}
                        {d.decidedAt ? ` · ${formatDateTimeFromISO(modulesManager, intl, d.decidedAt)}` : ''}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </Paper>
        </>
      )}

      <Dialog open={!!dialog} onClose={() => setDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{dialog && fm(ACTION_LABELS[dialog.action])}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            label={fm('field.comment')}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          {dialog?.action === 'approve' && (
            <TextField
              fullWidth
              label={fm('field.signature')}
              helperText={fm('field.signature.help')}
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              style={{ marginTop: 12 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(null)}>{fm('action.cancelEdit')}</Button>
          <Button color="primary" variant="contained" onClick={confirm}>{dialog && fm(ACTION_LABELS[dialog.action])}</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
