"use client";

import { useCallback, useMemo, useState } from "react";
import {
  formatByMask,
  initialDisplayValue,
  initialSubmitValue,
  type MaskType,
  validateMaskedValue
} from "@/lib/forms/masks";

type UseMaskOptions = {
  type: MaskType;
  defaultValue?: string | number | null;
  required?: boolean;
};

export function useMask({ type, defaultValue, required }: UseMaskOptions) {
  const initial = useMemo(() => ({
    displayValue: initialDisplayValue(type, defaultValue),
    submitValue: initialSubmitValue(type, defaultValue)
  }), [defaultValue, type]);
  const [displayValue, setDisplayValue] = useState(initial.displayValue);
  const [submitValue, setSubmitValue] = useState(initial.submitValue);
  const [touched, setTouched] = useState(false);
  const error = touched ? validateMaskedValue(type, submitValue || displayValue, required) : "";

  const setRawValue = useCallback((rawValue: string) => {
    const next = formatByMask(type, rawValue);
    setDisplayValue(next.displayValue);
    setSubmitValue(next.submitValue);
  }, [type]);

  return {
    displayValue,
    submitValue,
    error,
    setRawValue,
    setTouched
  };
}
