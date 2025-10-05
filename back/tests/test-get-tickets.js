(async()=>{
  try{
    const { TicketRepository } = require('../src/features/tickets/Ticket.repository');
    const res = await TicketRepository.getAllTicketsWithFilters(1,50,{});
    console.log('got', Object.keys(res));
    console.log('total', res.total);
    console.log('first', res.tickets && res.tickets[0]);
  }catch(e){
    console.error('repo error', e.stack || e);
  }
})();