'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useOnboardingWizard } from '@/lib/hooks/use-onboarding-wizard';
import { StepProgress } from '@/components/providers/onboarding/step-progress';
import { StepCreateUser } from '@/components/providers/onboarding/step-create-user';
import { StepCreateOrg } from '@/components/providers/onboarding/step-create-org';
import { StepSetLocation } from '@/components/providers/onboarding/step-set-location';
import { StepAddServices } from '@/components/providers/onboarding/step-add-services';
import { StepReview } from '@/components/providers/onboarding/step-review';
import { StepSendOffer } from '@/components/providers/onboarding/step-send-offer';

export default function OnboardPage() {
  const searchParams = useSearchParams();
  const serviceRequestId = searchParams.get('serviceRequestId');
  const { state, setStep, update, reset, totalSteps } = useOnboardingWizard(serviceRequestId);

  const goBack = () => {
    if (state.currentStep > 0) setStep(state.currentStep - 1);
  };

  const goNext = () => {
    if (state.currentStep < totalSteps - 1) setStep(state.currentStep + 1);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link href="/providers" className="text-sm font-medium hover:opacity-80" style={{ color: '#4B3F72' }}>
          ← Providers
        </Link>
        <button
          onClick={reset}
          className="text-xs font-medium text-gray-400 hover:text-gray-600"
        >
          Clear Draft
        </button>
      </div>

      <div className="mb-8">
        <StepProgress currentStep={state.currentStep} totalSteps={totalSteps} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {state.currentStep === 0 && (
          <StepCreateUser state={state} update={update} onNext={goNext} />
        )}
        {state.currentStep === 1 && (
          <StepCreateOrg state={state} update={update} onNext={goNext} />
        )}
        {state.currentStep === 2 && (
          <StepSetLocation state={state} update={update} onNext={goNext} />
        )}
        {state.currentStep === 3 && (
          <StepAddServices state={state} update={update} onNext={goNext} />
        )}
        {state.currentStep === 4 && (
          <StepReview state={state} update={update} onNext={state.serviceRequestId ? goNext : () => {
            reset();
            window.location.href = `/providers/${state.createdOrgId}`;
          }} />
        )}
        {state.currentStep === 5 && state.serviceRequestId && (
          <StepSendOffer state={state} reset={reset} />
        )}
      </div>

      {/* Back button */}
      {state.currentStep > 0 && state.currentStep < totalSteps && (
        <button
          onClick={goBack}
          className="mt-4 text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          ← Back to previous step
        </button>
      )}
    </div>
  );
}
