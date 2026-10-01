import {
  graphql, formatMutation, formatPageQueryWithCount, formatGQLString,
} from '@openimis/fe-core';
import { ACTION_TYPE } from './reducer';

const REQUEST_PROJECTION = () => [
  'id', 'uuid', 'status', 'currentStepOrder', 'requestedAt', 'completedAt', 'summary', 'entityModel',
  'objectId', 'flow { id code name domain }', 'requestedBy { id username otherNames lastName }',
];

const STEP_PROJECTION = 'steps { id uuid order code label status requiredRight taskId dateCreated '
  + 'decisions { id uuid decision comment signature decidedAt approver { id username otherNames lastName } } }';

const REQUEST_FULL_PROJECTION = () => [
  ...REQUEST_PROJECTION(),
  STEP_PROJECTION,
];

const FLOW_PROJECTION = () => ['id', 'uuid', 'code', 'name', 'domain', 'isActive', 'isUserManaged', 'config'];

// --- reads -----------------------------------------------------------------
export function fetchApprovalRequests(params) {
  const payload = formatPageQueryWithCount('approvalRequest', params, REQUEST_FULL_PROJECTION());
  return graphql(payload, ACTION_TYPE.SEARCH_REQUESTS);
}

export function fetchApprovalRequest(uuid) {
  const payload = formatPageQueryWithCount('approvalRequest', [`id: "${uuid}"`], REQUEST_FULL_PROJECTION());
  return graphql(payload, ACTION_TYPE.GET_REQUEST);
}

export function fetchMyPending() {
  const query = `query { approvalMyPending { ${REQUEST_FULL_PROJECTION().join(' ')} } }`;
  return graphql(query, ACTION_TYPE.MY_PENDING);
}

export function fetchApprovalFlows(params = ['first: 100']) {
  const payload = formatPageQueryWithCount('approvalFlow', params, FLOW_PROJECTION());
  return graphql(payload, ACTION_TYPE.SEARCH_FLOWS);
}

// --- actions (mutations) ---------------------------------------------------
const MUTATION_TYPES = ['APPROVAL_MUTATION_REQ', 'APPROVAL_MUTATION_RESP', 'APPROVAL_MUTATION_ERR'];

const MUTATION_LOG_QUERY = (clientMutationId) => `query { mutationLogs(clientMutationId: "${clientMutationId}") `
  + '{ edges { node { status error } } } }';
const MUTATION_RECEIVED = 0;
const MUTATION_POLL_ATTEMPTS = 40;

const sleep = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

async function waitForMutationLog(dispatch, clientMutationId) {
  for (let attempt = 0; attempt < MUTATION_POLL_ATTEMPTS; attempt += 1) {
    // eslint-disable-next-line no-await-in-loop
    const response = await dispatch(graphql(MUTATION_LOG_QUERY(clientMutationId), 'APPROVAL_MUTATION_LOG'));
    const log = response?.payload?.data?.mutationLogs?.edges?.[0]?.node;
    if (response?.error || (log && log.status !== MUTATION_RECEIVED)) return log || null;
    // eslint-disable-next-line no-await-in-loop
    await sleep(Math.min(250 * (attempt + 1), 2000));
  }
  return null;
}

function runMutation(name, inputStr, clientMutationLabel) {
  const mutation = formatMutation(name, inputStr, clientMutationLabel);
  const meta = { clientMutationId: mutation.clientMutationId, clientMutationLabel };
  return async (dispatch) => {
    dispatch({ type: MUTATION_TYPES[0], meta });
    const sent = await dispatch(graphql(mutation.payload, 'APPROVAL_MUTATION_SEND', meta));
    if (sent?.error) {
      dispatch({ type: MUTATION_TYPES[2], payload: sent.payload, meta });
      return;
    }
    const log = await waitForMutationLog(dispatch, meta.clientMutationId);
    dispatch({ type: MUTATION_TYPES[1], payload: log, meta });
  };
}

const step = (requestUuid, stepUuid, comment, signature) => `
    requestId: "${requestUuid}"
    stepId: "${stepUuid}"
    ${comment ? `comment: "${formatGQLString(comment)}"` : ''}
    ${signature ? `signature: "${formatGQLString(signature)}"` : ''}
`;

export const approveStep = (requestUuid, stepUuid, { comment, signature } = {}, label) => runMutation('approveApprovalStep', step(requestUuid, stepUuid, comment, signature), label);

export const rejectStep = (requestUuid, stepUuid, { comment } = {}, label) => runMutation('rejectApprovalStep', step(requestUuid, stepUuid, comment), label);

export const returnStep = (requestUuid, stepUuid, { comment } = {}, label) => runMutation('returnApprovalStep', `
    requestId: "${requestUuid}"
    stepId: "${stepUuid}"
    ${comment ? `comment: "${formatGQLString(comment)}"` : ''}
`, label);

export const cancelRequest = (requestUuid, { reason } = {}, label) => runMutation('cancelApprovalRequest', `
    requestId: "${requestUuid}"
    ${reason ? `reason: "${formatGQLString(reason)}"` : ''}
`, label);

export const updateApprovalFlow = (flowUuid, config, isActive, label) => runMutation('updateApprovalFlow', `
    id: "${flowUuid}"
    config: "${formatGQLString(JSON.stringify(config))}"
    ${typeof isActive === 'boolean' ? `isActive: ${isActive}` : ''}
`, label);
