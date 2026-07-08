import React, { useRef, useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { IconButton, Tooltip } from '@material-ui/core';
import VisibilityIcon from '@material-ui/icons/Visibility';
import { useIntl } from 'react-intl';
import {
  Searcher, useHistory, useModulesManager, useTranslations, journalize, formatDateTimeFromISO,
} from '@openimis/fe-core';
import { fetchApprovalRequests } from '../actions';
import {
  DEFAULT_PAGE_SIZE, ROWS_PER_PAGE_OPTIONS, APPROVAL_ROUTE_REQUEST,
} from '../constants';
import ApprovalRequestFilter from './ApprovalRequestFilter';
import ApprovalStatusChip from './ApprovalStatusChip';

function ApprovalRequestSearcher({
  mine, fetchApprovalRequests, journalize,
  fetchingRequests, fetchedRequests, errorRequests, requests,
  requestsPageInfo, requestsTotalCount, submittingMutation, mutation,
}) {
  const history = useHistory();
  const intl = useIntl();
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations('approval', modulesManager);
  const queryParams = useRef([]);
  const prev = useRef();

  const open = (r) => history.push(`/${modulesManager.getRef(APPROVAL_ROUTE_REQUEST)}/${r.uuid}`);

  useEffect(() => {
    if (prev.current && !submittingMutation) {
      journalize(mutation);
      fetchApprovalRequests(mineParams(queryParams.current));
    }
  }, [submittingMutation]);
  useEffect(() => { prev.current = submittingMutation; });

  const mineParams = (params) => (mine ? [...params, 'actionableByMe: true'] : params);
  const fetch = (params) => { queryParams.current = params; return fetchApprovalRequests(mineParams(params)); };

  const headers = () => [
    'field.flow', 'field.entity', 'field.step', 'field.status', 'field.requestedBy', 'field.requestedAt', 'emptyLabel',
  ];
  const sorts = () => [null, null, null, ['status', true], null, ['dateCreated', true], null];

  const currentStep = (r) => {
    const total = (r.steps || []).length;
    const cur = (r.steps || []).find((s) => s.order === r.currentStepOrder);
    return cur ? `${cur.label || cur.code} (${r.currentStepOrder}/${total})` : `—/${total}`;
  };
  const entityLabel = (r) => r.summary?.reference_code || r.summary?.title
    || `${r.entityModel || ''} ${(r.objectId || '').slice(0, 8)}`;

  const itemFormatters = () => [
    (r) => r.flow?.name || r.flow?.code,
    (r) => entityLabel(r),
    (r) => currentStep(r),
    (r) => <ApprovalStatusChip status={r.status} />,
    (r) => r.requestedBy?.username ?? '',
    (r) => (r.requestedAt ? formatDateTimeFromISO(modulesManager, intl, r.requestedAt) : ''),
    (r) => (
      <Tooltip title={formatMessage('viewDetailsButton.tooltip')}>
        <IconButton onClick={() => open(r)}><VisibilityIcon /></IconButton>
      </Tooltip>
    ),
  ];

  const filterPane = ({ filters, onChangeFilters }) => (
    <ApprovalRequestFilter filters={filters} onChangeFilters={onChangeFilters} />
  );

  return (
    <Searcher
      module="approval"
      FilterPane={filterPane}
      fetch={fetch}
      items={requests}
      itemsPageInfo={requestsPageInfo}
      fetchedItems={fetchedRequests}
      fetchingItems={fetchingRequests}
      errorItems={errorRequests}
      tableTitle={formatMessageWithValues('approvals.searcherResultsTitle', { count: requestsTotalCount })}
      headers={headers}
      itemFormatters={itemFormatters}
      sorts={sorts}
      rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
      defaultPageSize={DEFAULT_PAGE_SIZE}
      rowIdentifier={(r) => r.uuid || r.id}
      onDoubleClick={open}
    />
  );
}

const mapStateToProps = (state) => ({
  fetchingRequests: state.approval.fetchingRequests,
  fetchedRequests: state.approval.fetchedRequests,
  errorRequests: state.approval.errorRequests,
  requests: state.approval.requests,
  requestsPageInfo: state.approval.requestsPageInfo,
  requestsTotalCount: state.approval.requestsTotalCount,
  submittingMutation: state.approval.submittingMutation,
  mutation: state.approval.mutation,
});
const mapDispatchToProps = (dispatch) => bindActionCreators({ fetchApprovalRequests, journalize }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ApprovalRequestSearcher);
