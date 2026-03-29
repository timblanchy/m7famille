import { FetchHttpClient, HttpApiClient } from "@effect/platform"
import { Api } from "@stemma/api/Api"
import { type Effect, ManagedRuntime } from "effect"

if (!import.meta.env.VITE_API_URL) {
  throw new Error("VITE_API_URL environment variable is not defined.")
}

const VITE_API_URL = import.meta.env.VITE_API_URL

const ApiLayer = FetchHttpClient.layer

export const runtime = ManagedRuntime.make(ApiLayer)

export const client = await runtime.runPromise(
  HttpApiClient.make(Api, { baseUrl: VITE_API_URL })
)

export const runApi = <TResult, TError>(
  effect: Effect.Effect<TResult, TError, never>
): Promise<TResult> => runtime.runPromise(effect)
