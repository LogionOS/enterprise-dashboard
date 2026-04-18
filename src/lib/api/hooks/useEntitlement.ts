"use client";

import useSWR, { type SWRResponse } from "swr";
import { getEntitlement } from "../endpoints/entitlement";
import type { Entitlement } from "../schemas";
import { useClientToken } from "./useClientToken";

// Client-side SWR hook for the current user's entitlement. Feature pages call
// `useClientEntitlement()` — they MUST NOT call `fetch('/v1/entitlement')`
// directly. Server components should use `getEntitlement()` directly with a
// server-side token.

export function useClientEntitlement(): SWRResponse<Entitlement, Error> {
  const getToken = useClientToken();
  return useSWR<Entitlement, Error>(
    ["entitlement"],
    () => getEntitlement({ getToken }),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    },
  );
}
