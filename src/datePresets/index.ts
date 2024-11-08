import { dndCalendarOfHarptosDalereckoningDatePreset } from "./dndCalendarOfHarptosDalereckoning";
import { imperialDatePreset } from "./imperial";
import { normalDatePreset } from "./normal";
import { verboseDayDatePreset } from "./verboseDay";
import { malanachanCalendarDatePreset } from "./malanachanCalendar";

export { dndCalendarOfHarptosDalereckoningDatePreset } from "./dndCalendarOfHarptosDalereckoning";
export { verboseDayDatePreset } from "./verboseDay";
export { imperialDatePreset } from "./imperial";
export { normalDatePreset } from "./normal";
export { malanachanCalendarDatePreset } from "./malanachanCalendar"

export const allFormats = [
	normalDatePreset,
	imperialDatePreset,
	verboseDayDatePreset,
	dndCalendarOfHarptosDalereckoningDatePreset,
	malanachanCalendarDatePreset
] as const;
