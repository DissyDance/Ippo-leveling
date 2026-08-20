/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as feedback from "../feedback.js";
import type * as http from "../http.js";
import type * as items from "../items.js";
import type * as model_consistency from "../model/consistency.js";
import type * as model_player from "../model/player.js";
import type * as players from "../players.js";
import type * as running from "../running.js";
import type * as sessions from "../sessions.js";
import type * as validators from "../validators.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  feedback: typeof feedback;
  http: typeof http;
  items: typeof items;
  "model/consistency": typeof model_consistency;
  "model/player": typeof model_player;
  players: typeof players;
  running: typeof running;
  sessions: typeof sessions;
  validators: typeof validators;
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
