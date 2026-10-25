import { describe, expect, it } from 'vitest';
import { createTicket, transitionTicket, TicketError, type Status } from '../src/tickets.js';
const fresh = () => createTicket({ id: 'T-1', title: '  Fix webhook  ' });
describe('ticket input boundary', () => {
  it('normalizes title and defaults priority', () => {
    expect(fresh()).toEqual({ id: 'T-1', title: 'Fix webhook', priority: 'normal', status: 'open' });
  });
  it.each([null, [], 3, 'ticket', {}, { id: 'a'.repeat(65), title: 'x' }, { id: 'x', title: 'x', priority: null }, { id: '../etc', title: 'x' }, { id: 'x', title: ' ' }, { id: 'x', title: 'a'.repeat(121) }, { id: 'x', title: 'x', priority: 'urgent' }])('rejects invalid input %#', input => {
    expect(() => createTicket(input)).toThrow(TicketError);
  });
  it.each(['low', 'normal', 'high'])('accepts priority %s', priority => {
    expect(createTicket({ id: 'x', title: 'x', priority }).priority).toBe(priority);
  });
  it('accepts maximum field lengths', () => {
    expect(createTicket({ id: 'a'.repeat(64), title: 'a'.repeat(120) }).title).toHaveLength(120);
  });
  it('ignores injected status and unknown fields', () => {
    expect(createTicket({ id: 'x', title: 'x', status: 'resolved', secret: 'fixture' })).toEqual({ id: 'x', title: 'x', priority: 'normal', status: 'open' });
  });
});
describe('workflow', () => {
  const statuses: Status[] = ['open', 'in_progress', 'resolved'];
  for (const source of statuses) for (const target of statuses) {
    it(`${source} -> ${target}`, () => {
      const ticket = { ...fresh(), status: source };
      const allowed = (source === 'open' && target === 'in_progress') || (source === 'in_progress' && (target === 'open' || target === 'resolved')) || (source === 'resolved' && target === 'open');
      if (allowed) expect(transitionTicket(ticket, target).status).toBe(target);
      else expect(() => transitionTicket(ticket, target)).toThrow(TicketError);
      expect(ticket.status).toBe(source);
    });
  }
  it.each(['__proto__', 'toString', null, {}, 'closed'])('rejects unknown target %#', target => {
    expect(() => transitionTicket(fresh(), target)).toThrow(TicketError);
  });
  it('returns a frozen copy', () => {
    const ticket = fresh();
    const updated = transitionTicket(ticket, 'in_progress');
    expect(updated).not.toBe(ticket);
    expect(Object.isFrozen(updated)).toBe(true);
    expect(ticket.status).toBe('open');
  });
  it('reopens a resolved ticket as a new immutable ticket', () => {
    const ticket = createTicket({ id: 'REOPEN-1', title: 'Recheck webhook', priority: 'high' });
    const resolved = transitionTicket(transitionTicket(ticket, 'in_progress'), 'resolved');
    const original = { ...resolved };

    const reopened = transitionTicket(resolved, 'open');

    expect(reopened).toEqual({ ...original, status: 'open' });
    expect(reopened).not.toBe(resolved);
    expect(Object.isFrozen(reopened)).toBe(true);
    expect(resolved).toEqual(original);
  });
});
