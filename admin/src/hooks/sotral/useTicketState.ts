import { useReducer, useCallback } from 'react';
import { SotralTicketWithDetails, TicketFilters } from '../../types/sotral';

// Types pour les actions du reducer
type TicketAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TICKETS'; payload: SotralTicketWithDetails[] }
  | { type: 'SET_PAGINATION'; payload: { page: number; limit: number; total: number; pages: number } }
  | { type: 'SET_FILTERS'; payload: TicketFilters }
  | { type: 'UPDATE_TICKET'; payload: SotralTicketWithDetails }
  | { type: 'ADD_TICKETS'; payload: SotralTicketWithDetails[] }
  | { type: 'REMOVE_TICKET'; payload: number }
  | { type: 'RESET_STATE' };

// État initial
interface TicketState {
  tickets: SotralTicketWithDetails[];
  loading: boolean;
  error: string | null;
  filters: TicketFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  selectedTickets: number[];
}

const initialState: TicketState = {
  tickets: [],
  loading: false,
  error: null,
  filters: {
    page: 1,
    limit: 10
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  },
  selectedTickets: []
};

// Reducer
function ticketReducer(state: TicketState, action: TicketAction): TicketState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
        error: action.payload ? null : state.error
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    case 'SET_TICKETS':
      return {
        ...state,
        tickets: action.payload,
        loading: false,
        error: null
      };

    case 'SET_PAGINATION':
      return {
        ...state,
        pagination: action.payload
      };

    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };

    case 'UPDATE_TICKET':
      return {
        ...state,
        tickets: state.tickets.map(ticket =>
          ticket.id === action.payload.id ? action.payload : ticket
        )
      };

    case 'ADD_TICKETS':
      return {
        ...state,
        tickets: [...state.tickets, ...action.payload]
      };

    case 'REMOVE_TICKET':
      return {
        ...state,
        tickets: state.tickets.filter(ticket => ticket.id !== action.payload),
        selectedTickets: state.selectedTickets.filter(id => id !== action.payload)
      };

    case 'RESET_STATE':
      return initialState;

    default:
      return state;
  }
}

// Hook personnalisé utilisant le reducer
export const useTicketState = () => {
  const [state, dispatch] = useReducer(ticketReducer, initialState);

  // Actions memoizées
  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const setTickets = useCallback((tickets: SotralTicketWithDetails[]) => {
    dispatch({ type: 'SET_TICKETS', payload: tickets });
  }, []);

  const setPagination = useCallback((pagination: { page: number; limit: number; total: number; pages: number }) => {
    dispatch({ type: 'SET_PAGINATION', payload: pagination });
  }, []);

  const setFilters = useCallback((filters: TicketFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const updateTicket = useCallback((ticket: SotralTicketWithDetails) => {
    dispatch({ type: 'UPDATE_TICKET', payload: ticket });
  }, []);

  const addTickets = useCallback((tickets: SotralTicketWithDetails[]) => {
    dispatch({ type: 'ADD_TICKETS', payload: tickets });
  }, []);

  const removeTicket = useCallback((ticketId: number) => {
    dispatch({ type: 'REMOVE_TICKET', payload: ticketId });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  return {
    ...state,
    actions: {
      setLoading,
      setError,
      setTickets,
      setPagination,
      setFilters,
      updateTicket,
      addTickets,
      removeTicket,
      resetState
    }
  };
};