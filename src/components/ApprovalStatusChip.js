import React from 'react';
import { Chip } from '@material-ui/core';
import { useModulesManager, useTranslations } from '@openimis/fe-core';
import { MODULE_NAME, STATUS_CHIP_COLOR } from '../constants';

export default function ApprovalStatusChip({ status }) {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);
  if (!status) return null;
  return (
    <Chip
      size="small"
      label={formatMessage(`status.${status}`)}
      style={{ backgroundColor: STATUS_CHIP_COLOR, color: '#fff' }}
    />
  );
}
