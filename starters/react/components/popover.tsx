import * as popover from "@zag-js/popover"
import { useMachine, normalizeProps, Portal } from "@zag-js/react"
import { useId } from "react"

interface Props extends Omit<popover.Context, "open.controlled" | "id"> {
  defaultOpen?: boolean
}

export function Popover(props: Props) {
  const { open, defaultOpen, ...context } = props

  const [state, send] = useMachine(
    popover.machine({
      id: useId(),
      open: open ?? defaultOpen,
    }),
    {
      context: {
        ...context,
        "open.controlled": open !== undefined,
        open,
      },
    },
  )

  const api = popover.connect(state, send, normalizeProps)

  return (
    <>
      <button {...api.triggerProps}>
        Click me
        <div {...api.indicatorProps}>{">"}</div>
      </button>

      <Portal>
        <div {...api.positionerProps}>
          <div {...api.contentProps}>
            <div {...api.arrowProps}>
              <div {...api.arrowTipProps} />
            </div>
            <div {...api.titleProps}>Popover Title</div>
            <div data-part="body">
              <a>Non-focusable Link</a>
              <a href="#">Focusable Link</a>
              <input placeholder="input" />
              <button {...api.closeTriggerProps}>X</button>
            </div>
          </div>
        </div>
      </Portal>
    </>
  )
}
