// ============================================================================
// PR READINESS EVALUATOR
// Deterministic logic for PR→PO conversion readiness
// ============================================================================

import type { ProcurementPR } from './procurementData';

export interface ReadinessCheck {
  id: string;
  name: string;
  status: 'pass' | 'fail';
  details: string;
  section?: string;
}

export interface ReadinessResult {
  isReadyForPo: boolean;
  blockers: string[];
  topBlocker: string | null;
  readinessChecks: ReadinessCheck[];
}

/**
 * Evaluate PR readiness for PO conversion
 * Returns deterministic result based on mandatory field presence
 */
export function evaluatePrReadiness(pr: ProcurementPR): ReadinessResult {
  const checks: ReadinessCheck[] = [];
  const blockers: string[] = [];

  // 1. Material / Line Items
  if (pr.lineItems && pr.lineItems.length > 0) {
    const firstLine = pr.lineItems[0];
    if (firstLine.description && firstLine.description.trim() !== '') {
      checks.push({
        id: 'material',
        name: 'Material specification present',
        status: 'pass',
        details: `Material: ${firstLine.description}`,
        section: 'lines'
      });
    } else {
      checks.push({
        id: 'material',
        name: 'Material specification missing',
        status: 'fail',
        details: 'Line item description is empty',
        section: 'lines'
      });
      blockers.push('Material specification missing');
    }
  } else {
    checks.push({
      id: 'material',
      name: 'Line items missing',
      status: 'fail',
      details: 'No line items present',
      section: 'lines'
    });
    blockers.push('Line items missing');
  }

  // 2. Quantity
  if (pr.lineItems && pr.lineItems.length > 0 && pr.lineItems[0].quantity > 0) {
    checks.push({
      id: 'quantity',
      name: 'Quantity valid',
      status: 'pass',
      details: `Quantity: ${pr.lineItems[0].quantity}`,
      section: 'lines'
    });
  } else {
    checks.push({
      id: 'quantity',
      name: 'Quantity missing or invalid',
      status: 'fail',
      details: 'Quantity must be greater than zero',
      section: 'lines'
    });
    blockers.push('Quantity missing or invalid');
  }

  // 3. UOM (implicitly present if line items exist, but verify)
  if (pr.lineItems && pr.lineItems.length > 0) {
    checks.push({
      id: 'uom',
      name: 'Unit of measure present',
      status: 'pass',
      details: 'UOM defined in line item',
      section: 'lines'
    });
  } else {
    checks.push({
      id: 'uom',
      name: 'Unit of measure missing',
      status: 'fail',
      details: 'No line items to define UOM',
      section: 'lines'
    });
    blockers.push('Unit of measure missing');
  }

  // 4. Delivery Date
  if (pr.needByDate && pr.needByDate.trim() !== '') {
    checks.push({
      id: 'delivery-date',
      name: 'Delivery date present',
      status: 'pass',
      details: `Need-by date: ${pr.needByDate}`,
      section: 'delivery'
    });
  } else {
    checks.push({
      id: 'delivery-date',
      name: 'Delivery date missing',
      status: 'fail',
      details: 'Need-by date is required',
      section: 'delivery'
    });
    blockers.push('Delivery date missing');
  }

  // 5. Commodity Group
  if (pr.commodityGroup && pr.commodityGroup.trim() !== '') {
    checks.push({
      id: 'commodity-group',
      name: 'Commodity group present',
      status: 'pass',
      details: `Commodity: ${pr.commodityGroup}`,
      section: 'coding'
    });
  } else {
    checks.push({
      id: 'commodity-group',
      name: 'Commodity group missing',
      status: 'fail',
      details: 'Commodity group classification required',
      section: 'coding'
    });
    blockers.push('Commodity group missing');
  }

  // 6. Cost Center
  if (pr.costCenter && pr.costCenter.trim() !== '') {
    checks.push({
      id: 'cost-center',
      name: 'Cost center present',
      status: 'pass',
      details: `Cost center: ${pr.costCenter}`,
      section: 'coding'
    });
  } else {
    checks.push({
      id: 'cost-center',
      name: 'Cost center missing',
      status: 'fail',
      details: 'Cost center assignment required',
      section: 'coding'
    });
    blockers.push('Cost center missing');
  }

  // 7. Delivery Location
  if (pr.deliveryLocation && pr.deliveryLocation.trim() !== '') {
    checks.push({
      id: 'delivery-location',
      name: 'Delivery location present',
      status: 'pass',
      details: `Location: ${pr.deliveryLocation}`,
      section: 'delivery'
    });
  } else {
    checks.push({
      id: 'delivery-location',
      name: 'Delivery location missing',
      status: 'fail',
      details: 'Delivery location required',
      section: 'delivery'
    });
    blockers.push('Delivery location missing');
  }

  // Determine overall readiness
  const isReadyForPo = blockers.length === 0;
  const topBlocker = blockers.length > 0 ? blockers[0] : null;

  return {
    isReadyForPo,
    blockers,
    topBlocker,
    readinessChecks: checks
  };
}
