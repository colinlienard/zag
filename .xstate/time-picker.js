"use strict";

var _xstate = require("xstate");
const {
  actions,
  createMachine,
  assign
} = _xstate;
const {
  choose
} = actions;
const fetchMachine = createMachine({
  id: "time-picker",
  initial: ctx.open ? "open" : "idle",
  context: {},
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    idle: {
      tags: ["closed"],
      on: {
        "TRIGGER.CLICK": [{
          target: "open",
          actions: ["invokeOnOpen"]
        }],
        "CONTROLLED.OPEN": [{
          target: "open",
          actions: ["invokeOnOpen"]
        }]
      }
    },
    focused: {
      tags: ["closed"],
      on: {
        "TRIGGER.CLICK": [{
          target: "idle",
          actions: ["invokeOnOpen"]
        }],
        "CONTROLLED.OPEN": [{
          target: "open",
          actions: ["invokeOnOpen"]
        }]
      }
    },
    open: {
      tags: ["open"],
      activities: ["computePlacement"],
      on: {
        "TRIGGER.CLICK": [{
          target: "idle",
          actions: ["invokeOnClose"]
        }],
        "CONTROLLED.CLOSE": [{
          target: "idle",
          actions: ["invokeOnClose"]
        }],
        "POSITIONING.SET": {
          actions: ["reposition"]
        },
        "HOUR.CLICK": {
          actions: ["setHour", "invokeValueChange", "syncInputElement"]
        },
        "MINUTE.CLICK": {
          actions: ["setMinute", "invokeValueChange", "syncInputElement"]
        },
        "PERIOD.CLICK": {
          actions: ["setPeriod", "invokeValueChange", "syncInputElement"]
        }
      }
    }
  }
}, {
  actions: {
    updateContext: assign((context, event) => {
      return {
        [event.contextKey]: true
      };
    })
  },
  guards: {}
});