# openimis-fe-approval_js

openIMIS frontend module for the generic approval engine.

## Developer Guide

Package: `@openimis/fe-approval`.

Main entry point: `src/index.js`. It registers translations, the `approval`
reducer, approval routes, flow-admin routes, and menu entries consumed by the
configured openIMIS menu tree.

Routes:

- `/approval/requests` - approval inbox/search.
- `/approval/request/:approval_request_id?` - approval detail and actions.
- `/approval/flows` - flow configuration.

Important files:

- `src/actions.js` - approval request, decision and flow GraphQL operations.
- `src/constants.js` - rights, route refs, statuses and action constants.
- `src/pages/ApprovalsPage.js` - approval list/inbox.
- `src/pages/ApprovalDetailPage.js` - step decisions and request detail.
- `src/pages/FlowConfigPage.js` - admin flow editor.
- `src/translations/en.json` - module text.

Backend dependency: `openimis-be-approval_py`. Step authorization is based on the
domain right in the backend flow config, not on `24xxxx` approval-admin rights.

Development:

```bash
npm install
npm run build
```

Register the built package in the openIMIS frontend bundle the same way as other
`@openimis/fe-*` modules.
