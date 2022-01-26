import type { RouteDefinition } from "solid-app-router"
import { lazy } from "solid-js"

import Home from "./pages/home"

export const routes: RouteDefinition[] = [
  {
    path: "/",
    component: Home,
  },
  {
    path: "/accordion",
    component: lazy(() => import("./pages/accordion")),
  },
  {
    path: "/combobox",
    component: lazy(() => import("./pages/combobox")),
  },
  {
    path: "/editable",
    component: lazy(() => import("./pages/editable")),
  },
  {
    path: "/dialog",
    component: lazy(() => import("./pages/dialog")),
  },
  {
    path: "/menu",
    component: lazy(() => import("./pages/menu")),
  },
  {
    path: "/nested-menu",
    component: lazy(() => import("./pages/nested-menu")),
  },
  {
    path: "/number-input",
    component: lazy(() => import("./pages/number-input")),
  },
  {
    path: "/pin-input",
    component: lazy(() => import("./pages/pin-input")),
  },
  {
    path: "/popover",
    component: lazy(() => import("./pages/popover")),
  },
  {
    path: "/range-slider",
    component: lazy(() => import("./pages/range-slider")),
  },
  {
    path: "/rating",
    component: lazy(() => import("./pages/rating")),
  },
  {
    path: "/slider",
    component: lazy(() => import("./pages/slider")),
  },
  {
    path: "/split-view",
    component: lazy(() => import("./pages/split-view")),
  },
  {
    path: "/tabs",
    component: lazy(() => import("./pages/tabs")),
  },
  {
    path: "/tags-input",
    component: lazy(() => import("./pages/tags-input")),
  },
  {
    path: "/toggle",
    component: lazy(() => import("./pages/toggle")),
  },
  {
    path: "/tooltip",
    component: lazy(() => import("./pages/tooltip")),
  },
  {
    path: "**",
    component: lazy(() => import("./errors/404")),
  },
]
