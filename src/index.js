/* eslint-disable import/prefer-default-export */
import React from 'react';
import { AssignmentTurnedIn, Settings } from '@material-ui/icons';
import { FormattedMessage } from '@openimis/fe-core';

import messages_en from './translations/en.json';
import reducer from './reducer';
import {
  RIGHT_REQUEST_SEARCH, RIGHT_FLOW_SEARCH,
  APPROVAL_ROUTE_REQUESTS, APPROVAL_ROUTE_REQUEST, APPROVAL_ROUTE_FLOWS,
} from './constants';

import ApprovalsPage from './pages/ApprovalsPage';
import ApprovalDetailPage from './pages/ApprovalDetailPage';
import FlowConfigPage from './pages/FlowConfigPage';

const ROUTE_REQUESTS = 'approval/requests';
const ROUTE_REQUEST = 'approval/request';
const ROUTE_FLOWS = 'approval/flows';

const DEFAULT_CONFIG = {
  translations: [{ key: 'en', messages: messages_en }],
  reducers: [{ key: 'approval', reducer }],
  refs: [
    { key: APPROVAL_ROUTE_REQUESTS, ref: ROUTE_REQUESTS },
    { key: APPROVAL_ROUTE_REQUEST, ref: ROUTE_REQUEST },
    { key: APPROVAL_ROUTE_FLOWS, ref: ROUTE_FLOWS },
  ],
  'core.Router': [
    { path: ROUTE_REQUESTS, component: ApprovalsPage },
    { path: `${ROUTE_REQUEST}/:approval_request_id?`, component: ApprovalDetailPage },
    { path: ROUTE_FLOWS, component: FlowConfigPage },
  ],
  // Menu ENTRIES are registered under the module's own `<module>.MainMenu` key; the top-level
  // "Approvals" menu + which of these appear (and their order) is driven by the DB `fe-core`
  // ModuleConfiguration `menus` list (submenus reference these ids). Same pattern as communications.
  'approval.MainMenu': [
    {
      text: <FormattedMessage module="approval" id="menu.approvals" />,
      icon: <AssignmentTurnedIn />,
      route: `/${ROUTE_REQUESTS}`,
      filter: (rights) => rights.includes(RIGHT_REQUEST_SEARCH),
      id: 'approval.approvals',
    },
    {
      text: <FormattedMessage module="approval" id="menu.flows" />,
      icon: <Settings />,
      route: `/${ROUTE_FLOWS}`,
      filter: (rights) => rights.includes(RIGHT_FLOW_SEARCH),
      id: 'approval.flows',
    },
  ],
};

export const ApprovalModule = (cfg) => ({ ...DEFAULT_CONFIG, ...cfg });
