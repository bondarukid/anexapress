import type {
  BaseDrawerProps,
  DrawerEventAction,
  DrawerFormField,
} from "@/components/drawers/types/drawer.types";

export type BottomDrawerVariant =
  | "simple"
  | "withForm"
  | "scrollable"
  | "snapPoints"
  | "nested"
  | "noScaleBackground"
  | "eventDetails";

export type BottomDrawerProps = BaseDrawerProps & {
  variant?: BottomDrawerVariant;
  bodyText?: string;
  fields?: DrawerFormField[];
  scrollItems?: string[];
  nestedTitle?: string;
  nestedDescription?: string;
  nestedTriggerLabel?: string;
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
  eventAttendees?: string;
  eventActions?: DrawerEventAction[];
  onSubmit?: () => void;
};
