/* eslint-disable default-param-last */
import {
  dispatchMutationErr,
  dispatchMutationReq,
  formatGraphQLError,
  formatServerError,
  pageInfo,
  parseData,
} from '@openimis/fe-core';
import {
  CLEAR, ERROR, REQUEST, SUCCESS,
} from './utils/action-type';

const pj = (v) => {
  if (v == null || typeof v !== 'string') return v;
  try { return JSON.parse(v); } catch (e) { return v; }
};
const normRequest = (r) => (r ? { ...r, summary: pj(r.summary) } : r);
const normFlow = (f) => (f ? { ...f, config: pj(f.config) } : f);

export const ACTION_TYPE = {
  MUTATION: 'APPROVAL_MUTATION',
  SEARCH_REQUESTS: 'APPROVAL_REQUESTS',
  GET_REQUEST: 'APPROVAL_REQUEST',
  MY_PENDING: 'APPROVAL_MY_PENDING',
  SEARCH_FLOWS: 'APPROVAL_FLOWS',
};

const STORE_STATE = {
  submittingMutation: false,
  mutation: {},
  fetchingRequests: false,
  fetchedRequests: false,
  errorRequests: null,
  requests: [],
  requestsPageInfo: {},
  requestsTotalCount: 0,
  fetchingRequest: false,
  request: null,
  errorRequest: null,
  fetchingMyPending: false,
  myPending: [],
  fetchingFlows: false,
  flows: [],
  flowsPageInfo: {},
  flowsTotalCount: 0,
};

function reducer(state = STORE_STATE, action) {
  switch (action.type) {
    case REQUEST(ACTION_TYPE.SEARCH_REQUESTS):
      return {
        ...state, fetchingRequests: true, fetchedRequests: false, requests: [], errorRequests: null,
      };
    case SUCCESS(ACTION_TYPE.SEARCH_REQUESTS):
      return {
        ...state,
        fetchingRequests: false,
        fetchedRequests: true,
        requests: (parseData(action.payload.data.approvalRequest) || []).map(normRequest),
        requestsPageInfo: pageInfo(action.payload.data.approvalRequest),
        requestsTotalCount: action.payload.data.approvalRequest?.totalCount ?? 0,
        errorRequests: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.SEARCH_REQUESTS):
      return { ...state, fetchingRequests: false, errorRequests: formatServerError(action.payload) };

    case REQUEST(ACTION_TYPE.GET_REQUEST):
      return {
        ...state, fetchingRequest: true, request: null, errorRequest: null,
      };
    case SUCCESS(ACTION_TYPE.GET_REQUEST):
      return {
        ...state,
        fetchingRequest: false,
        request: normRequest(parseData(action.payload.data.approvalRequest)?.[0] ?? null),
        errorRequest: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.GET_REQUEST):
      return { ...state, fetchingRequest: false, errorRequest: formatServerError(action.payload) };

    case REQUEST(ACTION_TYPE.MY_PENDING):
      return { ...state, fetchingMyPending: true, myPending: [] };
    case SUCCESS(ACTION_TYPE.MY_PENDING):
      return {
        ...state,
        fetchingMyPending: false,
        myPending: (action.payload.data.approvalMyPending ?? []).map(normRequest),
      };
    case ERROR(ACTION_TYPE.MY_PENDING):
      return { ...state, fetchingMyPending: false };

    case REQUEST(ACTION_TYPE.SEARCH_FLOWS):
      return { ...state, fetchingFlows: true, flows: [] };
    case SUCCESS(ACTION_TYPE.SEARCH_FLOWS):
      return {
        ...state,
        fetchingFlows: false,
        flows: (parseData(action.payload.data.approvalFlow) || []).map(normFlow),
        flowsPageInfo: pageInfo(action.payload.data.approvalFlow),
        flowsTotalCount: action.payload.data.approvalFlow?.totalCount ?? 0,
      };
    case ERROR(ACTION_TYPE.SEARCH_FLOWS):
      return { ...state, fetchingFlows: false };

    case REQUEST(ACTION_TYPE.MUTATION):
      return dispatchMutationReq(state, action);
    case ERROR(ACTION_TYPE.MUTATION):
      return dispatchMutationErr(state, action);
    case SUCCESS(ACTION_TYPE.MUTATION):
      return {
        ...state,
        submittingMutation: false,
        mutation: { ...state.mutation, status: action.payload?.status, error: action.payload?.error },
      };
    case CLEAR(ACTION_TYPE.MUTATION):
      return { ...state, mutation: {} };
    default:
      return state;
  }
}

export default reducer;
