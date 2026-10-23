import { createFileRoute } from "@tanstack/react-router";

import { FoodsPage } from "@/features/foods/foods-page";

export const Route = createFileRoute("/alimentos")({
  component: FoodsPage,
});
