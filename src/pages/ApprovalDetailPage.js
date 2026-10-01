import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Button, Divider, Grid, Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import OpenInNew from '@material-ui/icons/OpenInNew';
import {
  Helmet, ProgressOrError, useHistory, journalize, decodeId,
} from '@openimis/fe-core';
import {
  REQUEST_STATUS, STEP_STATUS, RIGHT_OVERRIDE, RIGHT_CANCEL, APPROVAL_ROUTE_REQUESTS,
} from '../constants';
import {
  fetchApprovalRequest, approveStep, rejectStep, returnStep, cancelRequest,
} from '../actions';
import DetailHeader from '../components/detail/DetailHeader';
import ApprovalChainCard from '../components/detail/ApprovalChainCard';
import DecisionCard from '../components/detail/DecisionCard';
import HistoryCard from '../components/detail/HistoryCard';
import { RequesterCard, TechnicalCard } from '../components/detail/SideCards';
import {
  DetailCard, InfoField, humanise, personName, useAP,
} from '../components/detail/common';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
  section: {
    fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.7, margin: theme.spacing(0, 0, 1.5),
  },
  divider: { margin: theme.spacing(2, 0) },
  openRecord: { textTransform: 'none' },
}));

// Domains whose record has a detail page, so the reviewer can open what they are approving.
const RECORD_ROUTES = {
  'access_request.accessrequest': 'access_request.route.request',
};

// Node ids arrive relay-encoded; the logged-in user's id does not.
const plainId = (id) => {
  try { return decodeId(id); } catch (e) { return id; }
};

const summaryValue = (v) => {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'boolean') return v ? '✓' : '✗';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
};

export default function ApprovalDetailPage({ match }) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const { modulesManager, formatMessage, formatDateTimeFromISO } = useAP();
  const uuid = match?.params?.approval_request_id;

  const request = useSelector((s) => s.approval?.request);
  const fetching = useSelector((s) => s.approval?.fetchingRequest);
  const error = useSelector((s) => s.approval?.errorRequest);
  const mutation = useSelector((s) => s.approval?.mutation);
  const submitting = useSelector((s) => s.approval?.submittingMutation);
  const rights = useSelector((s) => s.core?.user?.i_user?.rights ?? []);
  const userId = useSelector((s) => s.core?.user?.id);

  const [tab, setTab] = useState('overview');
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState(null);
  const [signature, setSignature] = useState('');
  const prevSubmitting = useRef(false);

  useEffect(() => { if (uuid) dispatch(fetchApprovalRequest(uuid)); }, [uuid, dispatch]);
  useEffect(() => {
    if (prevSubmitting.current && !submitting) {
      dispatch(journalize(mutation));
      setComment('');
      setSignature('');
      if (uuid) dispatch(fetchApprovalRequest(uuid));
    }
    prevSubmitting.current = submitting;
  }, [submitting]);

  const back = () => history.push(`/${modulesManager.getRef(APPROVAL_ROUTE_REQUESTS)}`);

  if (!request || fetching) {
    return (
      <div className={classes.page}>
        <ProgressOrError progress={fetching} error={error} />
      </div>
    );
  }

  const steps = [...(request.steps || [])].sort((a, b) => a.order - b.order);
  const isPending = request.status === REQUEST_STATUS.PENDING;
  const currentStep = isPending
    ? steps.find((s) => s.order === request.currentStepOrder && s.status === STEP_STATUS.PENDING) : null;
  const canDecide = !!currentStep
    && (rights.includes(Number(currentStep.requiredRight)) || rights.includes(RIGHT_OVERRIDE));
  const canCancel = isPending
    && (rights.includes(RIGHT_CANCEL) || rights.includes(RIGHT_OVERRIDE) || (!!userId && !!request.requestedBy?.id && plainId(request.requestedBy.id) === String(userId)));

  const act = (action) => {
    const note = comment.trim();
    if (action !== 'approve' && !note) {
      setTab('overview');
      setCommentError(formatMessage(`detail.decision.required.${action}`));
      return;
    }
    const label = formatMessage(`mutation.${action}`);
    if (action === 'approve') dispatch(approveStep(request.uuid, currentStep.uuid, { comment: note, signature: signature.trim() }, label));
    else if (action === 'reject') dispatch(rejectStep(request.uuid, currentStep.uuid, { comment: note }, label));
    else if (action === 'return') dispatch(returnStep(request.uuid, currentStep.uuid, { comment: note }, label));
    else if (action === 'cancel') dispatch(cancelRequest(request.uuid, { reason: note }, label));
  };

  const recordRef = RECORD_ROUTES[request.entityModel];
  const openRecord = recordRef && request.objectId
    ? () => history.push(`/${modulesManager.getRef(recordRef)}/${request.objectId}`) : null;
  const summary = Object.entries(request.summary || {});

  return (
    <div className={classes.page}>
      <Helmet title={formatMessage('request.page.title')} />
      <DetailHeader
        request={request}
        step={currentStep}
        stepTotal={steps.length}
        tab={tab}
        onTab={setTab}
        onBack={back}
      />
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          {tab === 'overview' && (
            <>
              <DetailCard
                title={formatMessage('detail.details')}
                action={openRecord && (
                  <Button size="small" variant="outlined" color="primary" className={classes.openRecord} startIcon={<OpenInNew />} onClick={openRecord}>
                    {formatMessage('detail.openRecord')}
                  </Button>
                )}
              >
                <Typography className={classes.section}>{formatMessage('detail.section.request')}</Typography>
                <Grid container spacing={2}>
                  <InfoField label={formatMessage('field.flow')} value={request.flow?.name} />
                  <InfoField label={formatMessage('field.entity')} value={request.entityModel} mono />
                  <InfoField label={formatMessage('field.status')} value={formatMessage(`status.${request.status}`)} />
                  <InfoField label={formatMessage('field.requestedBy')} value={personName(request.requestedBy)} />
                  <InfoField label={formatMessage('field.requestedAt')} value={request.requestedAt && formatDateTimeFromISO(request.requestedAt)} />
                  <InfoField
                    label={formatMessage('field.step')}
                    value={currentStep ? `${currentStep.order} / ${steps.length} · ${currentStep.label || currentStep.code}` : null}
                    missing={formatMessage('detail.noCurrentStep')}
                  />
                </Grid>
                {summary.length > 0 && (
                  <>
                    <Divider className={classes.divider} />
                    <Typography className={classes.section}>{formatMessage('detail.section.summary')}</Typography>
                    <Grid container spacing={2}>
                      {summary.map(([k, v]) => (
                        <InfoField
                          key={k}
                          label={humanise(k)}
                          value={summaryValue(v)}
                          missing={formatMessage('detail.notProvided')}
                          mono={/(^|_)id$/.test(k)}
                        />
                      ))}
                    </Grid>
                  </>
                )}
              </DetailCard>
              <ApprovalChainCard request={request} />
              {(canDecide || canCancel) && (
                <DecisionCard
                  comment={comment}
                  onComment={(v) => { setComment(v); setCommentError(null); }}
                  commentError={commentError}
                  signature={signature}
                  onSignature={setSignature}
                  canDecide={canDecide}
                  canReturn
                  canCancel={canCancel}
                  onAction={act}
                  submitting={submitting}
                />
              )}
            </>
          )}
          {tab === 'history' && <HistoryCard request={request} />}
        </Grid>
        <Grid item xs={12} md={4}>
          <RequesterCard request={request} />
          <TechnicalCard request={request} />
        </Grid>
      </Grid>
    </div>
  );
}
