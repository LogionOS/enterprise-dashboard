"use client";

import useSWR, { type SWRResponse } from "swr";
import {
  buildReceiptQueryString,
  listReceipts,
  type ReceiptListQuery,
} from "../endpoints/receipts";
import type { ReceiptList } from "../schemas";
import { useClientToken } from "./useClientToken";

export function useClientReceipts(
  q: ReceiptListQuery,
): SWRResponse<ReceiptList, Error> {
  const getToken = useClientToken();
  const key = ["receipts", buildReceiptQueryString(q)] as const;
  return useSWR<ReceiptList, Error>(
    key,
    () => listReceipts(q, { getToken }),
    { revalidateOnFocus: false, shouldRetryOnError: false },
  );
}
