import { createProps } from "@zag-js/types"
import type { UserDefinedContext } from "./number-input.types"

export const props = createProps<UserDefinedContext>()([
  "allowMouseWheel",
  "allowOverflow",
  "clampValueOnBlur",
  "dir",
  "disabled",
  "focusInputOnChange",
  "form",
  "formatOptions",
  "getRootNode",
  "id",
  "ids",
  "inputMode",
  "invalid",
  "locale",
  "max",
  "min",
  "name",
  "onFocusChange",
  "onValueChange",
  "onValueInvalid",
  "pattern",
  "readOnly",
  "spinOnPress",
  "step",
  "translations",
  "value",
])
