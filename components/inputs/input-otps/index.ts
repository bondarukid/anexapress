export { BehaviorOtp } from "@/components/inputs/input-otps/behavior-otp";
export { StandardOtp } from "@/components/inputs/input-otps/standard-otp";
export { StatesOtp } from "@/components/inputs/input-otps/states-otp";
export { UseCasesOtp } from "@/components/inputs/input-otps/use-cases-otp";
export { VariantsOtp } from "@/components/inputs/input-otps/variants-otp";

export {
  behaviorPresets,
  standardPresets,
  statesPresets,
  useCasesPresets,
  variantsPresets,
} from "@/components/inputs/input-otps/presets";

export type {
  BaseOtpProps,
  BehaviorOtpProps,
  BehaviorOtpVariant,
  OtpInputPrimitiveProps,
  OtpValue,
  StandardOtpProps,
  StandardOtpVariant,
  StatesOtpProps,
  StatesOtpVariant,
  UseCasesOtpProps,
  UseCasesOtpVariant,
  VariantsOtpProps,
  VariantsOtpVariant,
} from "@/components/inputs/input-otps/types";

export { DEFAULT_OTP_LENGTH } from "@/components/inputs/input-otps/types";

export {
  defaultPasteTransformer,
  normalizeOtpPaste,
  readOtpFromClipboard,
} from "@/components/inputs/input-otps/utils/otp-paste";

export {
  isOtpComplete,
  resolveOtpPattern,
  type OtpPatternKind,
} from "@/components/inputs/input-otps/utils/otp-validators";

export { OtpInputCore, OtpSlots } from "@/components/inputs/input-otps/utils/otp-slots";

export { useControllableOtp } from "@/components/inputs/input-otps/utils/use-controllable-otp";
export { useOtpResend } from "@/components/inputs/input-otps/utils/use-otp-resend";
