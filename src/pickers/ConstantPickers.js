import React from 'react';
import { ConstantBasedPicker } from '@openimis/fe-core';
import { REQUEST_STATUS_LIST } from '../constants';

export function ApprovalStatusPicker({
  required, withNull, readOnly, onChange, value, nullLabel, withLabel, label,
}) {
  return (
    <ConstantBasedPicker
      module="approval"
      label={label || 'field.status'}
      constants={REQUEST_STATUS_LIST}
      required={required}
      withNull={withNull}
      readOnly={readOnly}
      onChange={onChange}
      value={value}
      nullLabel={nullLabel}
      withLabel={withLabel}
    />
  );
}

export default ApprovalStatusPicker;
