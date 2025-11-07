import { atom, useSetAtom } from "jotai";
import {
  createOnboardingAtom,
  onboardingStageGetter,
  onboardingStageSetter
} from "./onboardingStages";
import {
  basicOnboardingSetter,
  onboardingStepGetter,
  onboardingStepSetter,
} from "./onboardingSteps";

export const createOnboardingAtoms = <T extends string>(storageKey: string, keys: Record<string, T>) => { 

  type Values = typeof keys[keyof typeof keys];

  const initialValue = Object.fromEntries(Object.values(keys).map((value) => [value, false])) as Record<string, boolean>;
  
  const foundationalAtom = createOnboardingAtom(storageKey, initialValue);

  // External ref store (not in atom)
  const refStore = Object.values(keys).reduce((acc, key) => {
    acc[key] = null;
    return acc;
  }, {} as Record<Values, HTMLElement | null>);

  // Trigger atom to force rerenders when refs change
  const refTriggerAtom = atom(0);

  const stepAtom = atom(
    onboardingStepGetter(foundationalAtom, refStore, refTriggerAtom),
    onboardingStepSetter(foundationalAtom)
  );


  const stageAtom = atom(
    onboardingStageGetter(foundationalAtom),
    onboardingStageSetter(foundationalAtom)
  );

  const basicAtom = atom(
    null,
    basicOnboardingSetter(foundationalAtom)
  );

  const useStepSetter = (key: Values) => {
    //Don't subscribe to values here, it'll cause rerender loops
    const setOnboardingStep = useSetAtom(basicAtom);
    const setRefTrigger = useSetAtom(refTriggerAtom);
    const setStepComplete = () => setOnboardingStep(key);
    const setStepRef = (el: HTMLElement | null) => {    
      refStore[key] = el;
      setRefTrigger(prev => prev + 1); // Trigger rerender
    };
    return { setStepComplete, setStepRef };
  }


  return {
    foundationalAtom,
    stepAtom,
    stageAtom,
    basicAtom,
    useStepSetter,
  };
}