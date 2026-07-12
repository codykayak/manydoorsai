/**
 * Action receipts for maintenance dispatch and leasing stage changes.
 * Local receipts always attach so the demo shows an audit trail; optional
 * Cloud Function calls can upgrade them to live Twilio / PMS confirmations.
 */

import { genId, now } from '../data/store';

function stamp(extra = {}) {
  return {
    id: genId('rcpt'),
    at: now(),
    ...extra,
  };
}

/** Suggest a weekday tour slot ~2–4 business days out. */
export function suggestTourSlot(fromMs = now()) {
  const d = new Date(fromMs);
  let added = 0;
  while (added < 2) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) added += 1;
  }
  d.setHours(14, 0, 0, 0);
  return {
    at: d.getTime(),
    label: d.toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }),
    location: 'Leasing office / virtual tour link',
  };
}

/**
 * Build SMS + PMS write-back receipts when a work order is dispatched.
 */
export function buildDispatchReceipts(workOrder, { technicians = [], onCallTechId, companyPhone } = {}, integrations = {}) {
  const onCall = technicians.find((t) => t.id === onCallTechId) || technicians[0] || null;
  const toPhone = onCall?.phone || companyPhone || '+1 (541) 555-0199';
  const twilioConnected = integrations?.twilio?.status === 'connected';
  const yardiConnected = ['connected', 'pending'].includes(integrations?.yardi?.status);

  const smsBody = workOrder.priority === 'emergency'
    ? `EMERGENCY WO ${workOrder.unit || '?'}: ${String(workOrder.issue || '').slice(0, 120)}`
    : `Dispatch WO ${workOrder.unit || '?'}: ${String(workOrder.issue || '').slice(0, 120)}`;

  return [
    stamp({
      channel: 'sms',
      action: 'on_call_notify',
      status: twilioConnected ? 'queued' : 'simulated',
      provider: 'twilio',
      to: onCall?.name ? `${onCall.name} · ${toPhone}` : toPhone,
      detail: smsBody,
      externalId: twilioConnected ? null : `SM_sim_${genId('sms').slice(-8)}`,
    }),
    stamp({
      channel: 'pms',
      action: 'workorder_writeback',
      status: yardiConnected ? 'queued' : 'simulated',
      provider: integrations?.yardi ? 'yardi' : 'pms',
      detail: `Create/update work order · ${workOrder.category || 'General'} · ${workOrder.priority || 'normal'}`,
      externalId: yardiConnected ? null : `YR_sim_${genId('yr').slice(-8)}`,
    }),
  ];
}

/** Receipt when self-help is sent to a resident. */
export function buildSelfHelpReceipt(workOrder) {
  return stamp({
    channel: 'sms',
    action: 'self_help',
    status: 'simulated',
    provider: 'twilio',
    to: workOrder.resident || 'Resident',
    detail: String(workOrder.selfHelp || '').slice(0, 160),
    externalId: `SH_sim_${genId('sh').slice(-8)}`,
  });
}

/** Stage-change history entry for leasing. */
export function buildLeasingStageReceipt(fromStage, toStage, lead = {}) {
  const extras = {};
  if (toStage === 'tour') {
    extras.tourSlot = lead.tourSlot || suggestTourSlot();
  }
  if (toStage === 'prescreen' || fromStage === 'new') {
    extras.note = 'Auto pre-screen rules applied';
  }
  if (toStage === 'application') {
    extras.note = 'Application packet opened — fraud audit checklist ready';
  }
  return stamp({
    channel: 'leasing',
    action: 'stage_change',
    status: 'recorded',
    from: fromStage,
    to: toStage,
    ...extras,
  });
}

export function formatReceiptTime(at) {
  if (!at) return '';
  return new Date(at).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
