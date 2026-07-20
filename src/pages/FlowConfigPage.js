import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/styles';
import {
  Paper, Grid, Table, TableHead, TableRow, TableCell, TableBody, Chip, Typography, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Checkbox, FormControlLabel,
} from '@material-ui/core';
import {
  Edit, Add, Delete, ArrowUpward, ArrowDownward,
} from '@material-ui/icons';
import {
  Helmet, useModulesManager, useTranslations, journalize,
} from '@openimis/fe-core';
import { MODULE_NAME, RIGHT_FLOW_UPDATE } from '../constants';
import { fetchApprovalFlows, updateApprovalFlow } from '../actions';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
  paper: theme.paper.paper,
  tableTitle: theme.table.title,
  stepRow: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 },
  ro: { color: theme.palette.text.secondary, fontSize: 13, marginBottom: theme.spacing(1) },
  hint: { color: theme.palette.text.secondary, fontSize: 12, marginTop: 4 },
}));

function EditFlowDialog({ flow, onClose, onSave, fm }) {
  const classes = useStyles();
  const [steps, setSteps] = useState(() => ((flow.config?.steps || []).map((s) => ({ ...s }))));
  const [distinct, setDistinct] = useState(!!flow.config?.enforce_distinct_approvers);
  const [isActive, setIsActive] = useState(flow.isActive !== false);

  const setStep = (i, k, v) => setSteps((ss) => ss.map((s, idx) => (idx === i ? { ...s, [k]: v } : s)));
  const addStep = () => setSteps((ss) => [...ss, { code: '', label: '', required_right: '' }]);
  const removeStep = (i) => setSteps((ss) => ss.filter((_, idx) => idx !== i));
  const move = (i, d) => setSteps((ss) => {
    const j = i + d;
    if (j < 0 || j >= ss.length) return ss;
    const copy = [...ss];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    return copy;
  });

  const save = () => {
    const config = {
      steps: steps.map((s) => ({
        code: (s.code || '').trim(),
        label: (s.label || '').trim(),
        required_right: (String(s.required_right || '')).trim() || null,
      })),
      enforce_distinct_approvers: distinct,
    };
    onSave(config, isActive);
  };

  const valid = steps.length > 0 && steps.every((s) => (s.code || '').trim());

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{fm('flows.editTitle')}: {flow.name}</DialogTitle>
      <DialogContent>
        <div className={classes.ro}>{fm('field.code')}: <b>{flow.code}</b>{'  ·  '}{fm('field.domain')}: <b>{flow.domain}</b></div>
        <Typography variant="subtitle2" gutterBottom>{fm('field.steps')}</Typography>
        {steps.map((s, i) => (
          <div className={classes.stepRow} key={i}>
            <span style={{ width: 20 }}>{i + 1}.</span>
            <TextField label={fm('field.stepCode')} value={s.code || ''} onChange={(e) => setStep(i, 'code', e.target.value)} style={{ width: 140 }} />
            <TextField label={fm('field.stepLabel')} value={s.label || ''} onChange={(e) => setStep(i, 'label', e.target.value)} style={{ flex: 1 }} />
            <TextField
              label={fm('field.requiredRight')}
              value={s.required_right || ''}
              onChange={(e) => setStep(i, 'required_right', e.target.value)}
              style={{ width: 130 }}
            />
            <Tooltip title={fm('action.moveUp')}><span><IconButton size="small" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUpward fontSize="small" /></IconButton></span></Tooltip>
            <Tooltip title={fm('action.moveDown')}><span><IconButton size="small" disabled={i === steps.length - 1} onClick={() => move(i, 1)}><ArrowDownward fontSize="small" /></IconButton></span></Tooltip>
            <Tooltip title={fm('action.removeStep')}><IconButton size="small" onClick={() => removeStep(i)}><Delete fontSize="small" /></IconButton></Tooltip>
          </div>
        ))}
        <Button startIcon={<Add />} onClick={addStep} size="small">{fm('action.addStep')}</Button>
        <div className={classes.hint}>{fm('field.requiredRight.help')}</div>
        <div style={{ marginTop: 12 }}>
          <FormControlLabel
            control={<Checkbox checked={distinct} onChange={(e) => setDistinct(e.target.checked)} />}
            label={fm('field.distinctApprovers')}
          />
          <FormControlLabel
            control={<Checkbox checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />}
            label={fm('field.active')}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{fm('action.cancelEdit')}</Button>
        <Button color="primary" variant="contained" disabled={!valid} onClick={save}>{fm('action.save')}</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function FlowConfigPage() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);
  const fm = (id) => formatMessage(id);

  const flows = useSelector((s) => s.approval?.flows || []);
  const mutation = useSelector((s) => s.approval?.mutation);
  const submitting = useSelector((s) => s.approval?.submittingMutation);
  const rights = useSelector((s) => s.core?.user?.i_user?.rights ?? []);
  const canEdit = rights.includes(RIGHT_FLOW_UPDATE);

  const [editing, setEditing] = useState(null);
  const [prev, setPrev] = useState(false);

  const refresh = () => dispatch(fetchApprovalFlows());
  useEffect(() => { refresh(); }, []);
  useEffect(() => {
    if (prev && !submitting) { dispatch(journalize(mutation)); refresh(); }
    setPrev(submitting);
  }, [submitting]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSave = (config, isActive) => {
    dispatch(updateApprovalFlow(editing.uuid, config, isActive, fm('mutation.updateFlow')));
    setEditing(null);
  };

  return (
    <div className={classes.page}>
      <Helmet title={fm('flows.title')} />
      <Paper className={classes.paper}>
        <Grid container className={classes.tableTitle}>
          <Typography variant="subtitle1">{fm('flows.title')}</Typography>
        </Grid>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{fm('field.code')}</TableCell>
              <TableCell>{fm('field.flowName')}</TableCell>
              <TableCell>{fm('field.domain')}</TableCell>
              <TableCell>{fm('field.steps')}</TableCell>
              <TableCell>{fm('field.active')}</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {flows.map((f) => {
              const cfg = f.config || {};
              const steps = (cfg.steps || []).map((s) => s.label || s.code).join(' → ');
              return (
                <TableRow key={f.uuid || f.id}>
                  <TableCell>{f.code}{f.isUserManaged ? ` · ${fm('flows.userManaged')}` : ''}</TableCell>
                  <TableCell>{f.name}</TableCell>
                  <TableCell>{f.domain}</TableCell>
                  <TableCell>{steps}{cfg.enforce_distinct_approvers ? ` · ${fm('field.distinctApprovers')}` : ''}</TableCell>
                  <TableCell>
                    <Chip size="small" label={f.isActive ? fm('yes') : fm('no')} color={f.isActive ? 'primary' : 'default'} />
                  </TableCell>
                  <TableCell align="right">
                    {canEdit && (
                      <Tooltip title={fm('flows.edit')}>
                        <IconButton size="small" onClick={() => setEditing(f)}><Edit fontSize="small" /></IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
      {editing && <EditFlowDialog flow={editing} fm={fm} onClose={() => setEditing(null)} onSave={onSave} />}
    </div>
  );
}
