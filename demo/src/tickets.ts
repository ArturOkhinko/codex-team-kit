export type Status = 'open' | 'in_progress' | 'resolved';
export type Priority = 'low' | 'normal' | 'high';
export interface Ticket {
  readonly id: string;
  readonly title: string;
  readonly priority: Priority;
  readonly status: Status;
}
export class TicketError extends Error {
  constructor(public readonly code: 'INVALID_INPUT' | 'INVALID_TRANSITION', message: string) {
    super(message);
    this.name = 'TicketError';
  }
}
const transitions: Record<Status, readonly Status[]> = {
  open: ['in_progress'], in_progress: ['open', 'resolved'], resolved: ['open'],
};
function isStatus(value: unknown): value is Status {
  return value === 'open' || value === 'in_progress' || value === 'resolved';
}
/** Parse an untrusted JSON object. Only explicitly supported fields are copied. */
export function createTicket(input: unknown): Ticket {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new TicketError('INVALID_INPUT', 'Expected a ticket object');
  }
  const data = input as Record<string, unknown>;
  if (typeof data.id !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(data.id)) {
    throw new TicketError('INVALID_INPUT', 'ID must contain 1–64 letters, digits, underscores or hyphens');
  }
  if (typeof data.title !== 'string' || data.title.trim().length < 1 || data.title.trim().length > 120) {
    throw new TicketError('INVALID_INPUT', 'Title must contain 1–120 characters');
  }
  const priority = data.priority === undefined ? 'normal' : data.priority;
  if (priority !== 'low' && priority !== 'normal' && priority !== 'high') {
    throw new TicketError('INVALID_INPUT', 'Unknown priority');
  }
  return Object.freeze({ id: data.id, title: data.title.trim(), priority, status: 'open' });
}
/** Return a new ticket; failed transitions never change the original. */
export function transitionTicket(ticket: Ticket, target: unknown): Ticket {
  if (!isStatus(target) || !isStatus(ticket.status) || !transitions[ticket.status].includes(target)) {
    throw new TicketError('INVALID_TRANSITION', 'Transition is not allowed');
  }
  return Object.freeze({ ...ticket, status: target });
}
