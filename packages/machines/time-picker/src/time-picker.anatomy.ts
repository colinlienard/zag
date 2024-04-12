import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("time-picker").parts(
  "root",
  "label",
  "clearTrigger",
  "content",
  "contentColumn",
  "control",
  "input",
  "hourCell",
  "minuteCell",
  "secondCell",
  "periodTrigger",
  "positioner",
  "trigger",
)

export const parts = anatomy.build()
