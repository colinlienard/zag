import * as hoverCard from "@zag-js/hover-card"
import { normalizeProps, useMachine, mergeProps } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { hoverCardControls } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Portal } from "solid-js/web"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(hoverCardControls)

  const [state, send] = useMachine(hoverCard.machine({ id: createUniqueId() }), {
    context: controls.context,
  })

  const api = createMemo(() => hoverCard.connect(state, send, normalizeProps))

  return (
    <>
      <main class="hover-card">
        <a href="https://twitter.com/zag_js" target="_blank" {...api().triggerProps}>
          Twitter
        </a>

        {api().isOpen && (
          <Portal>
            <div {...api().positionerProps}>
              <div class="hover-card-content" {...api().contentProps}>
                <div {...api().arrowProps}>
                  <div {...api().innerArrowProps} />
                </div>
                Twitter Preview
                <a href="https://twitter.com/zag_js" target="_blank">
                  Twitter
                </a>
              </div>
            </div>
          </Portal>
        )}
      </main>

      <Toolbar controls={controls.ui} visualizer={<StateVisualizer state={state} />} />
    </>
  )
}