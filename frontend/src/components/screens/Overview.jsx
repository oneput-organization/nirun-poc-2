"use client";
import { useEffect } from "react";
import { useWorkspace } from "@/components/workspace-context";

export function Overview() {
  const { isOverview, goSetup } = useWorkspace();

  useEffect(() => {
    if (isOverview) goSetup();
  }, [isOverview, goSetup]);

  return null;
}
