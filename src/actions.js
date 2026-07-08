import {
  graphql, formatMutation, formatPageQueryWithCount, formatGQLString,
} from '@openimis/fe-core';
import { ACTION_TYPE } from './reducer';

const REQUEST_PROJECTION = () => [
  'id', 'uuid', 'status', 'currentStepOrder', 'requestedAt', 'completedAt', 'summary', 'entityModel',
  'objectId', 'flow { id code name domain }', 'requestedBy { id username }',
];

const STEP_PROJECTION = 'steps { id uuid order code label status requiredRight taskId '
  + 'decisions { id uuid decision comment signature decidedAt approver { id username } } }';

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

function runMutation(name, inputStr, clientMutationLabel) {
  const mutation = formatMutation(name, inputStr, clientMutationLabel);
  return graphql(mutation.payload, MUTATION_TYPES,
    { clientMutationId: mutation.clientMutationId, clientMutationLabel });
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

// Admin: edit an existing flow's steps/config (update-only; code/domain are read-only server-side).
export const updateApprovalFlow = (flowUuid, config, isActive, label) => runMutation('updateApprovalFlow', `
    id: "${flowUuid}"
    config: "${formatGQLString(JSON.stringify(config))}"
    ${typeof isActive === 'boolean' ? `isActive: ${isActive}` : ''}
`, label);
