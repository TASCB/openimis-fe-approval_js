export const MODULE_NAME = 'approval';

export const RIGHT_FLOW_SEARCH = 240101;
export const RIGHT_FLOW_MANAGE = 240102;
export const RIGHT_FLOW_UPDATE = 240103;
export const RIGHT_REQUEST_SEARCH = 240201;
export const RIGHT_CANCEL = 240301;
export const RIGHT_RETURN = 240302;
export const RIGHT_OVERRIDE = 240303;

export const APPROVAL_ROUTE_REQUESTS = 'approval.route.requests';
export const APPROVAL_ROUTE_REQUEST = 'approval.route.request';
export const APPROVAL_ROUTE_FLOWS = 'approval.route.flows';

export const REQUEST_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  RETURNED: 'RETURNED',
};

export const STEP_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SKIPPED: 'SKIPPED',
  RETURNED: 'RETURNED',
};

// Status badge follows the openIMIS convention: one neutral grey, not a per-status colour.
// The per-status map below is retained for places where colour carries information a
// label does not (calendars, progress trails).
export const STATUS_CHIP_COLOR = '#9e9e9e';

export const STATUS_COLOR = {
  PENDING: '#1976d2',
  APPROVED: '#2e7d32',
  REJECTED: '#c62828',
  CANCELLED: '#616161',
  RETURNED: '#e65100',
  SKIPPED: '#9e9e9e',
};

export const REQUEST_STATUS_LIST = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'RETURNED'];

export const DEFAULT_DEBOUNCE_TIME = 500;
export const DEFAULT_PAGE_SIZE = 10;
export const ROWS_PER_PAGE_OPTIONS = [10, 20, 50, 100];
export const CONTAINS_LOOKUP = 'Icontains';
export const EMPTY_STRING = '';
