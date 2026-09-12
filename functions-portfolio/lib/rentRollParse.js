/**
 * Pure rent-roll / resident-roster parser — shared by the browser client and
 * Cloud Functions nightly sync. Accepts an array of row objects (from CSV or
 * Excel) and returns normalized units, properties, residents, and a summary.
 */

const ALIASES = {
  name: ['name', 'resident', 'tenant', 'full_name', 'first_name', 'occupant', 'lease_holder', 'primary_resident', 'resident_name'],
  unit: ['unit', 'unit_number', 'unit_no', 'apt', 'apartment', 'suite', 'space', 'unit_id'],
  property: ['property', 'property_name', 'building', 'community', 'site', 'property_code'],
  phone: ['phone', 'cell', 'mobile', 'telephone', 'phone_number', 'contact_phone'],
  email: ['email', 'email_address', 'e_mail', 'contact_email'],
  balance: ['balance', 'amount_due', 'past_due', 'current_balance', 'ar_balance', 'delinquent_balance'],
  leaseEnd: ['lease_end', 'lease_expiration', 'lease_end_date', 'move_out', 'expiration', 'lease_exp'],
  leaseStart: ['lease_start', 'lease_begin', 'move_in', 'move_in_date'],
  rent: ['rent', 'monthly_rent', 'market_rent', 'lease_rent', 'actual_rent', 'contract_rent'],
  status: ['status', 'unit_status', 'occupancy', 'occupied', 'lease_status', 'unit_occupancy', 'occupancy_status'],
  beds: ['beds', 'bedrooms', 'br', 'bed'],
  baths: ['baths', 'bathrooms', 'ba', 'bath'],
  sqft: ['sqft', 'sq_ft', 'square_feet', 'area'],
  unitType: ['unit_type', 'floorplan', 'plan', 'type'],
};

const VACANT_STATUSES = new Set(['vacant', 'empty', 'available', 'unrented', 'down', 'offline']);
const NOTICE_STATUSES = new Set(['notice', 'ntv', 'notice_to_vacate', 'on_notice', 'giving_notice', 'notice_given']);
const OCCUPIED_STATUSES = new Set(['occupied', 'current', 'leased', 'rented', 'active']);

export function normalizeHeader(s) {
  return String(s ?? '').toLowerCase().replace(/[\s\-_./$()+]+/g, '_').replace(/^_+|_+$/g, '');
}

export function mapHeaders(headers) {
  const map = {};
  for (const h of headers) {
    const n = normalizeHeader(h);
    if (!n) continue;
    for (const [canonical, aliases] of Object.entries(ALIASES)) {
      if (map[canonical]) continue;
      if (aliases.some((a) => normalizeHeader(a) === n || n.startsWith(normalizeHeader(a)))) {
        map[canonical] = h;
        break;
      }
    }
  }
  return map;
}

function getVal(row, map, canonical) {
  const header = map[canonical];
  const v = header ? row[header] : '';
  return v == null ? '' : String(v).trim();
}

function parseMoney(raw) {
  const s = String(raw ?? '').replace(/[$,]/g, '').trim();
  if (!s || s === '-' || s === '—') return 0;
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

function parseDate(raw) {
  const s = String(raw ?? '').trim();
  if (!s) return '';
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return s;
}

export function normalizeUnitStatus(raw, hasResident) {
  const s = normalizeHeader(raw);
  if (!s && hasResident) return 'occupied';
  if (!s) return 'vacant';
  if (VACANT_STATUSES.has(s) || s.includes('vacant') || s.includes('available')) return 'vacant';
  if (NOTICE_STATUSES.has(s) || s.includes('notice')) return 'notice';
  if (OCCUPIED_STATUSES.has(s) || s.includes('occupied') || s.includes('leased')) return 'occupied';
  if (s.includes('model') || s.includes('employee')) return 'model';
  return hasResident ? 'occupied' : 'vacant';
}

function slugify(s) {
  return normalizeHeader(s).replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'unknown';
}

function propertyIdForName(name, index) {
  const slug = slugify(name);
  return slug ? `p_${slug}` : `p_import_${index}`;
}

/**
 * @param {object[]} rows - spreadsheet rows with original column headers
 * @param {object} [opts]
 * @param {() => string} [opts.genId] - ID generator (prefix handled by caller)
 * @param {string} [opts.fileName]
 * @param {string} [opts.source]
 */
export function parseRentRollRows(rows, opts = {}) {
  const genId = opts.genId || (() => `id_${Date.now()}`);
  const filtered = rows.filter((r) => Object.values(r).some((v) => v !== '' && v != null));
  if (!filtered.length) {
    return {
      units: [],
      properties: [],
      residents: [],
      summary: { totalUnits: 0, occupied: 0, vacant: 0, notice: 0, delinquentCount: 0, delinquentTotal: 0, grossRent: 0 },
      category: 'Unknown',
    };
  }

  const headers = Object.keys(filtered[0]);
  const map = mapHeaders(headers);
  const propertyIndex = new Map();
  const units = [];
  const residents = [];
  let grossRent = 0;
  let delinquentCount = 0;
  let delinquentTotal = 0;

  for (const row of filtered) {
    const unitNum = getVal(row, map, 'unit');
    const propertyName = getVal(row, map, 'property') || 'Portfolio';
    const name = getVal(row, map, 'name');
    const hasResident = Boolean(name && name !== '(Unnamed)' && !VACANT_STATUSES.has(normalizeHeader(name)));
    const status = normalizeUnitStatus(getVal(row, map, 'status'), hasResident);
    const rent = parseMoney(getVal(row, map, 'rent'));
    const balance = parseMoney(getVal(row, map, 'balance'));
    const leaseEnd = parseDate(getVal(row, map, 'leaseEnd'));
    const leaseStart = parseDate(getVal(row, map, 'leaseStart'));

    if (!propertyIndex.has(propertyName)) {
      propertyIndex.set(propertyName, {
        id: propertyIdForName(propertyName, propertyIndex.size),
        name: propertyName,
        units: 0,
        occupied: 0,
        vacant: 0,
        notice: 0,
      });
    }
    const prop = propertyIndex.get(propertyName);
    prop.units += 1;
    if (status === 'vacant') prop.vacant += 1;
    else if (status === 'notice') prop.notice += 1;
    else prop.occupied += 1;

    if (status === 'occupied' || status === 'notice') grossRent += rent;
    if (balance > 0) {
      delinquentCount += 1;
      delinquentTotal += balance;
    }

    const unitId = genId('unit');
    units.push({
      id: unitId,
      unit: unitNum || `—`,
      propertyId: prop.id,
      propertyName,
      status,
      rent,
      residentName: hasResident ? name : '',
      balance,
      leaseEnd,
      leaseStart,
      beds: getVal(row, map, 'beds'),
      baths: getVal(row, map, 'baths'),
      sqft: getVal(row, map, 'sqft'),
      unitType: getVal(row, map, 'unitType'),
      daysVacant: status === 'vacant' ? estimateDaysVacant(leaseEnd, leaseStart) : 0,
    });

    if (hasResident && status !== 'vacant') {
      residents.push({
        id: genId('res'),
        name,
        unit: unitNum,
        property: propertyName,
        phone: getVal(row, map, 'phone'),
        email: getVal(row, map, 'email'),
        rent,
        balance,
        leaseEnd,
        _raw: row,
      });
    }
  }

  const properties = [...propertyIndex.values()];
  const occupied = units.filter((u) => u.status === 'occupied').length;
  const vacant = units.filter((u) => u.status === 'vacant').length;
  const notice = units.filter((u) => u.status === 'notice').length;

  const category = detectCategory(opts.fileName, map, units);

  return {
    units,
    properties,
    residents,
    category,
    summary: {
      totalUnits: units.length,
      occupied,
      vacant,
      notice,
      delinquentCount,
      delinquentTotal,
      grossRent,
    },
  };
}

function estimateDaysVacant(leaseEnd, leaseStart) {
  const ref = leaseEnd || leaseStart;
  if (!ref) return 14;
  const d = new Date(ref);
  if (Number.isNaN(d.getTime())) return 14;
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  return Math.max(1, Math.min(days, 365));
}

function detectCategory(fileName, map, units) {
  const fn = normalizeHeader(fileName || '');
  if (fn.includes('rent_roll') || fn.includes('rentroll')) return 'Rent Roll';
  if (fn.includes('ar_aging') || fn.includes('aging')) return 'A/R Aging';
  if (fn.includes('resident') || fn.includes('tenant')) return 'Residents';
  if (map.balance && !map.rent) return 'A/R Aging';
  if (units.length && units.some((u) => u.rent > 0)) return 'Rent Roll';
  return 'Residents';
}

export function buildImportSummary(parsed) {
  const { summary, properties, category } = parsed;
  const propPart = properties.length === 1
    ? properties[0].name
    : `${properties.length} properties`;
  return `${summary.totalUnits} units · ${summary.vacant} vacant · ${summary.notice} notice · ${propPart} · ${category}`;
}
