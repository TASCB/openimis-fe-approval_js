import React from 'react';
import { injectIntl } from 'react-intl';
import { Grid } from '@material-ui/core';
import { withTheme, withStyles } from '@material-ui/core/styles';
import { defaultFilterStyles } from '../utils/styles';
import { ApprovalStatusPicker } from '../pickers/ConstantPickers';

function ApprovalRequestFilter({ classes, filters, onChangeFilters }) {
  const filterValue = (k) => filters?.[k]?.value;
  return (
    <Grid container className={classes.form}>
      <Grid item xs={3} className={classes.item}>
        <ApprovalStatusPicker
          withNull
          label="field.status"
          value={filterValue('status')}
          onChange={(value) => onChangeFilters([{
            id: 'status', value, filter: value ? `status: ${value}` : '',
          }])}
        />
      </Grid>
    </Grid>
  );
}

export default injectIntl(withTheme(withStyles(defaultFilterStyles)(ApprovalRequestFilter)));
