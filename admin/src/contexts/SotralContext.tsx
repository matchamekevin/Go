import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Types
export interface SotralLine {
  id: number;
  line_number: number;
  name: string;
  route_from: string;
  route_to: string;
  category_id: number;
  distance_km?: number;
  stops_count?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  category?: {
    id: number;
    name: string;
    description?: string;
  };
}

export interface SotralStats {
  total_lines: number;
  active_lines: number;
  total_stops: number;
  ticket_types: number;
}

export interface SotralStop {
  id: number;
  name: string;
  code: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  is_major_stop: boolean;
  is_active: boolean;
}

export interface ApiError {
  type: 'auth' | 'server' | 'network' | 'empty' | 'validation' | 'not_found';
  message: string;
  details?: string;
  suggestion?: string;
}

interface SotralState {
  lines: SotralLine[];
  stops: SotralStop[];
  stats: SotralStats | null;
  loading: {
    lines: boolean;
    stops: boolean;
    stats: boolean;
    linesAction: boolean;
  };
  error: {
    lines: ApiError | null;
    stops: ApiError | null;
    stats: ApiError | null;
    general: ApiError | null;
  };
  modals: {
    create: boolean;
    edit: boolean;
    delete: boolean;
    details: boolean;
  };
  selectedLine: SotralLine | null;
  formData: {
    line_number: string;
    name: string;
    route_from: string;
    route_to: string;
    category_id: string;
    distance_km: string;
    stops_count: string;
  };
  isUsingCache: boolean;
}

type SotralAction =
  // Loading actions
  | { type: 'SET_LOADING'; payload: { key: keyof SotralState['loading']; value: boolean } }
  | { type: 'SET_ERROR'; payload: { key: keyof SotralState['error']; error: ApiError | null } }

  // Data actions
  | { type: 'SET_LINES'; payload: SotralLine[] }
  | { type: 'SET_STOPS'; payload: SotralStop[] }
  | { type: 'SET_STATS'; payload: SotralStats | null }
  | { type: 'SET_USING_CACHE'; payload: boolean }

  // Modal actions
  | { type: 'OPEN_MODAL'; payload: keyof SotralState['modals'] }
  | { type: 'CLOSE_ALL_MODALS' }
  | { type: 'SET_SELECTED_LINE'; payload: SotralLine | null }

  // Form actions
  | { type: 'UPDATE_FORM_DATA'; payload: Partial<SotralState['formData']> }
  | { type: 'RESET_FORM_DATA' }

  // Line actions
  | { type: 'ADD_LINE'; payload: SotralLine }
  | { type: 'UPDATE_LINE'; payload: SotralLine }
  | { type: 'DELETE_LINE'; payload: number }
  | { type: 'TOGGLE_LINE_STATUS'; payload: { id: number; is_active: boolean } };

const initialState: SotralState = {
  lines: [],
  stops: [],
  stats: null,
  loading: {
    lines: true,
    stops: true,
    stats: true,
    linesAction: false,
  },
  error: {
    lines: null,
    stops: null,
    stats: null,
    general: null,
  },
  modals: {
    create: false,
    edit: false,
    delete: false,
    details: false,
  },
  selectedLine: null,
  formData: {
    line_number: '',
    name: '',
    route_from: '',
    route_to: '',
    category_id: '1',
    distance_km: '',
    stops_count: '',
  },
  isUsingCache: false,
};

function sotralReducer(state: SotralState, action: SotralAction): SotralState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: { ...state.loading, [action.payload.key]: action.payload.value },
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: { ...state.error, [action.payload.key]: action.payload.error },
      };

    case 'SET_LINES':
      return { ...state, lines: action.payload };

    case 'SET_STOPS':
      return { ...state, stops: action.payload };

    case 'SET_STATS':
      return { ...state, stats: action.payload };

    case 'SET_USING_CACHE':
      return { ...state, isUsingCache: action.payload };

    case 'OPEN_MODAL':
      return {
        ...state,
        modals: { ...state.modals, [action.payload]: true },
      };

    case 'CLOSE_ALL_MODALS':
      return {
        ...state,
        modals: {
          create: false,
          edit: false,
          delete: false,
          details: false,
        },
        selectedLine: null,
      };

    case 'SET_SELECTED_LINE':
      return { ...state, selectedLine: action.payload };

    case 'UPDATE_FORM_DATA':
      return {
        ...state,
        formData: { ...state.formData, ...action.payload },
      };

    case 'RESET_FORM_DATA':
      return {
        ...state,
        formData: {
          line_number: '',
          name: '',
          route_from: '',
          route_to: '',
          category_id: '1',
          distance_km: '',
          stops_count: '',
        },
      };

    case 'ADD_LINE':
      return {
        ...state,
        lines: [...state.lines, action.payload],
      };

    case 'UPDATE_LINE':
      return {
        ...state,
        lines: state.lines.map(line =>
          line.id === action.payload.id ? action.payload : line
        ),
      };

    case 'DELETE_LINE':
      return {
        ...state,
        lines: state.lines.filter(line => line.id !== action.payload),
      };

    case 'TOGGLE_LINE_STATUS':
      return {
        ...state,
        lines: state.lines.map(line =>
          line.id === action.payload.id
            ? { ...line, is_active: action.payload.is_active }
            : line
        ),
      };

    default:
      return state;
  }
}

interface SotralContextValue {
  state: SotralState;
  dispatch: React.Dispatch<SotralAction>;
}

const SotralContext = createContext<SotralContextValue | undefined>(undefined);

interface SotralProviderProps {
  children: ReactNode;
}

export const SotralProvider: React.FC<SotralProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(sotralReducer, initialState);

  return (
    <SotralContext.Provider value={{ state, dispatch }}>
      {children}
    </SotralContext.Provider>
  );
};

export const useSotral = () => {
  const context = useContext(SotralContext);
  if (context === undefined) {
    throw new Error('useSotral must be used within a SotralProvider');
  }
  return context;
};
