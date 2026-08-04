"use client";

import { Refresh } from "@solar-icons/react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import type { ComponentProps } from "react";

/**
 * Must live inside the <form> it submits: `useFormStatus` reads the pending
 * state from the nearest form context.
 */
export function SubmitButton({
  children,
  pendingLabel,
  ...props
}: ComponentProps<typeof Button> & { pendingLabel?: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending ? (
        <>
          <Refresh size={16} weight="Linear" className="animate-spin" />
          {pendingLabel ?? "Salvando"}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
