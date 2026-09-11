import { triageRequest } from './maintenanceTriage.js';
import { lookupProsPlaybook } from './prosPlaybook.js';

const CLIENT_TOOLS = new Set(['triage_maintenance', 'lookup_pros_playbook']);

export function isClientVoiceTool(name) {
  return CLIENT_TOOLS.has(name);
}

export function executeVoiceTool(name, args = {}) {
  if (name === 'triage_maintenance') {
    const request = String(args.request || args.text || '').trim();
    if (!request) return { error: 'request is required' };
    return triageRequest(request);
  }
  if (name === 'lookup_pros_playbook') {
    return lookupProsPlaybook(args.trade, args.issue);
  }
  return { error: `Unknown tool: ${name}` };
}
