import { StateMachine as S } from "@ui-machines/core"
import { dataAttr, EventKeyMap, isFocusable, isTabbable, validateBlur } from "@ui-machines/dom-utils"
import { getArrowStyle, getFloatingStyle, innerArrowStyle } from "@ui-machines/popper"
import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/types"
import { dom } from "./popover.dom"
import type { MachineContext, MachineState } from "./popover.types"

export function connect<T extends PropTypes = ReactPropTypes>(
  state: S.State<MachineContext, MachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = normalizeProp,
) {
  const isOpen = state.matches("open")
  const arrow = state.context.positioning.arrow
  const pointerdownNode = state.context.pointerdownNode

  return {
    portalled: state.context.currentPortalled,
    isOpen,
    open() {
      send("OPEN")
    },
    close() {
      send("CLOSE")
    },

    arrowProps: normalize.element<T>({
      id: dom.getArrowId(state.context),
      "data-part": "arrow",
      style: getArrowStyle({
        measured: state.context.isPlacementComplete,
        size: arrow?.size,
        shadowColor: arrow?.shadowColor,
      }),
    }),

    innerArrowProps: normalize.element<T>({
      "data-part": "arrow--inner",
      style: innerArrowStyle,
    }),

    anchorProps: normalize.element<T>({
      "data-part": "anchor",
      id: dom.getAnchorId(state.context),
    }),

    triggerProps: normalize.button<T>({
      "data-part": "trigger",
      "data-placement": state.context.currentPlacement,
      id: dom.getTriggerId(state.context),
      "aria-haspopup": "dialog",
      "aria-expanded": isOpen,
      "data-expanded": dataAttr(isOpen),
      "aria-controls": dom.getContentId(state.context),
      onClick() {
        send("TRIGGER_CLICK")
      },
    }),

    positionerProps: normalize.element<T>({
      id: dom.getPositionerId(state.context),
      "data-part": "positioner",
      style: getFloatingStyle(state.context.isPlacementComplete),
    }),

    contentProps: normalize.element<T>({
      "data-part": "content",
      id: dom.getContentId(state.context),
      tabIndex: -1,
      role: "dialog",
      hidden: !isOpen,
      "aria-labelledby": state.context.isTitleRendered ? dom.getTitleId(state.context) : undefined,
      "aria-describedby": state.context.isDescriptionRendered ? dom.getDescriptionId(state.context) : undefined,
      "data-placement": state.context.currentPlacement,
      onKeyDown(event) {
        const keyMap: EventKeyMap = {
          Escape(event) {
            send("ESCAPE")
            event.stopPropagation()
          },
          Tab(event) {
            const type = event.shiftKey ? "SHIFT_TAB" : "TAB"
            send({ type, preventDefault: () => event.preventDefault() })
          },
        }

        const exec = keyMap[event.key]
        exec?.(event)
      },
      onBlur(event) {
        const isValidBlur = validateBlur(event, {
          exclude: [dom.getTriggerEl(state.context), dom.getContentEl(state.context)],
          fallback: pointerdownNode,
        })

        const el = (event.relatedTarget ?? pointerdownNode) as HTMLElement
        const focusable = isTabbable(el) || isFocusable(el)

        if (isValidBlur) {
          send({ type: "INTERACT_OUTSIDE", focusable })
        }
      },
    }),

    titleProps: normalize.element<T>({
      "data-part": "title",
      id: dom.getTitleId(state.context),
    }),

    descriptionProps: normalize.element<T>({
      "data-part": "description",
      id: dom.getDescriptionId(state.context),
    }),

    closeButtonProps: normalize.button<T>({
      "data-part": "close-button",
      id: dom.getCloseButtonId(state.context),
      type: "button",
      "aria-label": "close",
      onClick() {
        send("CLOSE")
      },
    }),
  }
}
