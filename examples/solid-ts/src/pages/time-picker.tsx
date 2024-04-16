import * as timePicker from "@zag-js/time-picker"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { For, createMemo, createUniqueId, type ParentProps } from "solid-js"
import { Portal } from "solid-js/web"
import { timePickerControls } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

function Wrapper(props: ParentProps) {
  return <Portal mount={document.body}>{props.children}</Portal>
}

export default function Page() {
  const controls = useControls(timePickerControls)

  const [state, send] = useMachine(timePicker.machine({ id: createUniqueId() }), {
    context: controls.context,
  })

  const api = createMemo(() => timePicker.connect(state, send, normalizeProps))

  return (
    <>
      <main class="time-picker">
        <div {...api().rootProps}>
          <div {...api().controlProps} style={{ display: "flex", gap: "10px" }}>
            <input {...api().inputProps} />
            <button {...api().triggerProps}>🗓</button>
            <button {...api().clearTriggerProps}>❌</button>
          </div>

          <Wrapper>
            <div {...api().positionerProps}>
              <div {...api().contentProps}>
                <div {...api().getContentColumnProps({ type: "hour" })}>
                  <For each={api().getAvailableHours()}>
                    {(hour) => <button {...api().getHourCellProps({ hour })}>{hour}</button>}
                  </For>
                </div>
                <div {...api().getContentColumnProps({ type: "minute" })}>
                  <For each={api().getAvailableMinutes()}>
                    {(minute) => <button {...api().getMinuteCellProps({ minute })}>{minute}</button>}
                  </For>
                </div>
                <div {...api().getContentColumnProps({ type: "second" })}>
                  <For each={api().getAvailableSeconds()}>
                    {(second) => <button {...api().getSecondCellProps({ second })}>{second}</button>}
                  </For>
                </div>
                <div {...api().getContentColumnProps({ type: "period" })}>
                  <button {...api().getPeriodCellProps({ period: "am" })}>AM</button>
                  <button {...api().getPeriodCellProps({ period: "pm" })}>PM</button>
                </div>
              </div>
            </div>
          </Wrapper>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
