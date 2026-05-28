import { formatCurrency } from "@/lib/formatters";
import { monetaryGoalTypes } from "@/lib/goals/labels";
import type { GoalType } from "@/lib/types/goals";

export function formatGoalValue(type: GoalType, value: number | string | null | undefined) {
  return monetaryGoalTypes.has(type) ? formatCurrency(value) : String(Number(value ?? 0));
}
