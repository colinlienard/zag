import { createMachine } from "@zag-js/core"
import { compact } from "@zag-js/utils"
import type { MachineContext, MachineState, UserDefinedContext } from "./time-picker.types"
import { dom } from "./time-picker.dom"
import { getPlacement } from "@zag-js/popper"
import { Time } from "@internationalized/date"
import { getTimeValue, getStringifiedValue, getPeriodHour } from "./time-picker.utils"
import { trackDismissableElement } from "@zag-js/dismissable"
import { raf } from "@zag-js/dom-query"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "time-picker",
      initial: ctx.open ? "open" : "idle",
      watch: {
        open: ["toggleVisibility"],
      },
      context: {
        value: undefined,
        period: "am",
        ...ctx,
        positioning: {
          placement: "bottom-end",
          gutter: 8,
          ...ctx.positioning,
        },
      },
      on: {
        "INPUT.BLUR": {
          actions: ["applyInputValue", "guardWrongValue", "syncInputElement"],
        },
        "INPUT.ENTER": {
          actions: ["applyInputValue", "guardWrongValue", "syncInputElement"],
        },
        "VALUE.CLEAR": {
          actions: ["clearValue", "syncInputElement"],
        },
      },
      states: {
        idle: {
          tags: ["closed"],
          on: {
            "TRIGGER.CLICK": [
              {
                target: "open",
                actions: ["invokeOnOpen", "focusFirstHour"],
              },
            ],
            "CONTROLLED.OPEN": [
              {
                target: "open",
                actions: ["invokeOnOpen"],
              },
            ],
          },
        },
        focused: {
          tags: ["closed"],
          on: {
            "TRIGGER.CLICK": [
              {
                target: "idle",
                actions: ["invokeOnOpen"],
              },
            ],
            "CONTROLLED.OPEN": [
              {
                target: "open",
                actions: ["invokeOnOpen"],
              },
            ],
          },
        },
        open: {
          tags: ["open"],
          entry: ["focusFirstHour"],
          activities: ["computePlacement", "trackDismissableElement"],
          on: {
            "TRIGGER.CLICK": [
              {
                target: "idle",
                actions: ["invokeOnClose", "scrollUpColumns"],
              },
            ],
            "CONTROLLED.CLOSE": [
              {
                target: "idle",
                actions: ["invokeOnClose", "scrollUpColumns"],
              },
            ],
            "CONTENT.INTERACT_OUTSIDE": {
              target: "idle",
              actions: ["invokeOnClose", "scrollUpColumns"],
            },
            "POSITIONING.SET": {
              actions: ["reposition", "scrollUpColumns"],
            },
            "HOUR.CLICK": {
              actions: ["setHour", "invokeValueChange", "syncInputElement"],
            },
            "MINUTE.CLICK": {
              actions: ["setMinute", "invokeValueChange", "syncInputElement"],
            },
            "SECOND.CLICK": {
              actions: ["setSecond", "invokeValueChange", "syncInputElement"],
            },
            "PERIOD.CLICK": {
              actions: ["setPeriod", "guardWrongValue", "invokeValueChange", "syncInputElement"],
            },
            "CONTENT.COLUMN.ARROW_UP": {
              actions: ["focusPreviousCell"],
            },
            "CONTENT.COLUMN.ARROW_DOWN": {
              actions: ["focusNextCell"],
            },
            "CONTENT.COLUMN.ARROW_LEFT": {
              actions: ["focusPreviousColumnFirstCell"],
            },
            "CONTENT.COLUMN.ARROW_RIGHT": {
              actions: ["focusNextColumnFirstCell"],
            },
            "CONTENT.COLUMN.ENTER": {
              actions: ["setCurrentCell", "focusNextColumnFirstCell", "syncInputElement"],
            },
          },
        },
      },
    },
    {
      guards: {},
      activities: {
        computePlacement(ctx) {
          ctx.currentPlacement = ctx.positioning.placement
          const triggerEl = () => dom.getTriggerEl(ctx)
          const positionerEl = () => dom.getPositionerEl(ctx)
          return getPlacement(triggerEl, positionerEl, {
            defer: true,
            ...ctx.positioning,
            onComplete(data) {
              ctx.currentPlacement = data.placement
            },
          })
        },
        trackDismissableElement(ctx, _evt, { send }) {
          const contentEl = () => dom.getContentEl(ctx)
          return trackDismissableElement(contentEl, {
            defer: true,
            exclude: [dom.getTriggerEl(ctx), dom.getClearTriggerEl(ctx)],
            // onFocusOutside: ctx.onFocusOutside,
            // onPointerDownOutside: ctx.onPointerDownOutside,
            // onInteractOutside(event) {
            //   ctx.onInteractOutside?.(event)
            //   ctx.restoreFocus = !event.detail.focusable
            // },
            onDismiss() {
              send({ type: "CONTENT.INTERACT_OUTSIDE" })
            },
          })
        },
      },
      actions: {
        reposition(ctx, evt) {
          const positionerEl = () => dom.getPositionerEl(ctx)
          getPlacement(dom.getTriggerEl(ctx), positionerEl, {
            ...ctx.positioning,
            ...evt.options,
            defer: true,
            listeners: false,
            onComplete(data) {
              ctx.currentPlacement = data.placement
            },
          })
        },
        toggleVisibility(ctx, evt, { send }) {
          send({ type: ctx.open ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE", previousEvent: evt })
        },
        invokeOnOpen(ctx) {
          ctx.onOpenChange?.({ open: true })
        },
        invokeOnClose(ctx) {
          ctx.onOpenChange?.({ open: false })
        },
        invokeValueChange(ctx) {
          ctx.onValueChange?.({ value: ctx.value })
        },
        applyInputValue(ctx, evt) {
          const timeValue = getTimeValue(evt.value)
          if (!timeValue) return
          ctx.value = timeValue.time
          ctx.period = timeValue.period
        },
        syncInputElement(ctx) {
          const inputEl = dom.getInputEl(ctx)
          if (!inputEl) return
          inputEl.value = getStringifiedValue(ctx)
        },
        setHour(ctx, { hour }) {
          const newValue = (ctx.value ?? new Time(0)).set({ hour: getPeriodHour(hour, ctx.period) })
          if (ctx.min && ctx.min.compare(newValue) > 0) {
            ctx.value = newValue.set({ minute: ctx.min.minute, second: ctx.min.second })
            return
          }
          ctx.value = newValue
        },
        setMinute(ctx, { minute }) {
          const newValue = (ctx.value ?? new Time(0)).set({ minute })
          if (ctx.min && ctx.min.compare(newValue) > 0) {
            ctx.value = newValue.set({ second: ctx.min.second })
            return
          }
          ctx.value = newValue
        },
        setSecond(ctx, { second }) {
          ctx.value = (ctx.value ?? new Time(0)).set({ second })
        },
        setPeriod(ctx, { period }) {
          if (period === ctx.period) return
          ctx.period = period
          if (ctx.value) {
            const diff = period === "pm" ? 12 : 0
            ctx.value = ctx.value.set({ hour: (ctx.value.hour % 12) + diff })
          }
        },
        clearValue(ctx) {
          ctx.value = undefined
          ctx.period = "am"
        },
        guardWrongValue(ctx, _, { send }) {
          const { value, min, max } = ctx
          if (!value) return
          if ((min && min.compare(value) > 0) || (max && max.compare(value) < 0)) {
            send({ type: "VALUE.CLEAR" })
          }
        },
        scrollUpColumns(ctx) {
          const columnEls = dom.getContentColumnEls(ctx)
          for (const columnEl of columnEls) {
            columnEl.scrollTo({ top: 0 })
          }
        },
        focusFirstHour(ctx) {
          raf(() => {
            dom.getHourCellEls(ctx)?.[0]?.focus()
          })
        },
        focusPreviousCell(_, evt) {
          raf(() => {
            const next = evt.target.previousSibling
            if (next && !next.disabled) {
              next.focus()
            }
          })
        },
        focusNextCell(_, evt) {
          raf(() => {
            const previous = evt.target.nextSibling
            if (previous && !previous.disabled) {
              previous.focus()
            }
          })
        },
        setCurrentCell(_, evt, { send }) {
          const { value, unit } = evt.target.dataset
          switch (unit) {
            case "hour":
              send({ type: "HOUR.CLICK", hour: value })
              return
            case "minute":
              send({ type: "MINUTE.CLICK", minute: value })
              return
            case "second":
              send({ type: "SECOND.CLICK", second: value })
              return
            case "period":
              send({ type: "PERIOD.CLICK", period: value })
              return
          }
        },
        focusPreviousColumnFirstCell(ctx, evt) {
          raf(() => {
            switch (evt.target.dataset.unit) {
              case "minute":
                dom.getHourCellEls(ctx)?.[0]?.focus()
                return
              case "second":
                dom.getMinuteCellEls(ctx)?.[0]?.focus()
                return
              case "period":
                if (ctx.withSeconds) {
                  dom.getSecondCellEls(ctx)?.[0]?.focus()
                  return
                }
                dom.getMinuteCellEls(ctx)?.[0]?.focus()
                return
              default:
                return
            }
          })
        },
        focusNextColumnFirstCell(ctx, evt) {
          raf(() => {
            switch (evt.target.dataset.unit) {
              case "hour":
                dom.getMinuteCellEls(ctx)?.[0]?.focus()
                return
              case "minute":
                if (ctx.withSeconds) {
                  dom.getSecondCellEls(ctx)?.[0]?.focus()
                  return
                }
                dom.getPeriodCellEls(ctx)?.[0]?.focus()
                return
              case "second":
                dom.getPeriodCellEls(ctx)?.[0]?.focus()
                return
              default:
                return
            }
          })
        },
      },
    },
  )
}
