import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppFrame } from "@/components/app-frame";

export const Route = createFileRoute("/_app")({
  component: () => (
    <AppFrame>
      <Outlet />
    </AppFrame>
  ),
});
