import { useReducer, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'swoopt-onboard-draft';

export interface OnboardingState {
  currentStep: number;
  serviceRequestId: string | null;
  // Step 1
  userFirstName: string;
  userLastName: string;
  userEmail: string;
  userPhone: string;
  temporaryPassword: string;
  forceVerifyEmail: boolean;
  createdUserId: string | null;
  // Step 2
  orgName: string;
  orgDescription: string;
  orgPhone: string;
  orgIndustryId: string;
  createdOrgId: string | null;
  // Step 3
  addressLine1: string;
  addressCity: string;
  addressState: string;
  addressZip: string;
  lat: number | null;
  lng: number | null;
  locationSaved: boolean;
  // Step 4
  serviceMode: 'scan' | 'manual';
  scanUrl: string;
  scanJobId: string | null;
  servicesAdded: boolean;
  // Step 5
  isAvailable: boolean;
  forcePasswordReset: boolean;
  welcomeCreditsCents: number;
  activated: boolean;
  // Step 6
  offerSent: boolean;
}

const initialState: OnboardingState = {
  currentStep: 0,
  serviceRequestId: null,
  userFirstName: '',
  userLastName: '',
  userEmail: '',
  userPhone: '',
  temporaryPassword: '',
  forceVerifyEmail: true,
  createdUserId: null,
  orgName: '',
  orgDescription: '',
  orgPhone: '',
  orgIndustryId: '',
  createdOrgId: null,
  addressLine1: '',
  addressCity: '',
  addressState: '',
  addressZip: '',
  lat: null,
  lng: null,
  locationSaved: false,
  serviceMode: 'scan',
  scanUrl: '',
  scanJobId: null,
  servicesAdded: false,
  isAvailable: true,
  forcePasswordReset: true,
  welcomeCreditsCents: 0,
  activated: false,
  offerSent: false,
};

type Action =
  | { type: 'SET_STEP'; step: number }
  | { type: 'UPDATE'; payload: Partial<OnboardingState> }
  | { type: 'RESET' }
  | { type: 'HYDRATE'; state: OnboardingState };

function reducer(state: OnboardingState, action: Action): OnboardingState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.step };
    case 'UPDATE':
      return { ...state, ...action.payload };
    case 'RESET':
      return { ...initialState };
    case 'HYDRATE':
      return action.state;
    default:
      return state;
  }
}

export function useOnboardingWizard(serviceRequestId?: string | null) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as OnboardingState;
        // If serviceRequestId changed, update it but keep the draft
        if (serviceRequestId) {
          parsed.serviceRequestId = serviceRequestId;
        }
        dispatch({ type: 'HYDRATE', state: parsed });
      } else if (serviceRequestId) {
        dispatch({ type: 'UPDATE', payload: { serviceRequestId } });
      }
    } catch {
      // Invalid stored state, ignore
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage full or unavailable
    }
  }, [state]);

  const setStep = useCallback((step: number) => {
    dispatch({ type: 'SET_STEP', step });
  }, []);

  const update = useCallback((payload: Partial<OnboardingState>) => {
    dispatch({ type: 'UPDATE', payload });
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    dispatch({ type: 'RESET' });
  }, []);

  const totalSteps = state.serviceRequestId ? 6 : 5;

  return { state, setStep, update, reset, totalSteps };
}
