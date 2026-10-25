import { createTicket, transitionTicket, TicketError } from './tickets.js';
try {
  const ticket = createTicket({ id: 'DEMO-1', title: 'Review generated code', priority: 'high' });
  console.log(transitionTicket(transitionTicket(ticket, 'in_progress'), 'resolved'));
} catch (error) {
  if (!(error instanceof TicketError)) throw error;
  console.error({ code: error.code, message: error.message });
}
