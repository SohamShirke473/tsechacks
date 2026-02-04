/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions from "../actions.js";
import type * as aiTasks from "../aiTasks.js";
import type * as analysis from "../analysis.js";
import type * as continuousAnalytics from "../continuousAnalytics.js";
import type * as gemini from "../gemini.js";
import type * as kanban from "../kanban.js";
import type * as projects from "../projects.js";
import type * as riskPrediction from "../riskPrediction.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  actions: typeof actions;
  aiTasks: typeof aiTasks;
  analysis: typeof analysis;
  continuousAnalytics: typeof continuousAnalytics;
  gemini: typeof gemini;
  kanban: typeof kanban;
  projects: typeof projects;
  riskPrediction: typeof riskPrediction;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
