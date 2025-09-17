import { TicketRepository } from '../src/features/tickets/Ticket.repository';

(async () => {
  try {
    const res = await TicketRepository.getAllTicketsWithFilters(1, 50, {});
    console.log('got', Object.keys(res));
    console.log('total', res.total);
    console.log('first', res.tickets && res.tickets[0]);
  } catch (e) {
    console.error('repo error', e);
  }
})();