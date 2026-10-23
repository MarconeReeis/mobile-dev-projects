import { createFileRoute } from "@tanstack/react-router";

import { MealsPage } from "@/features/meals/meals-page";
import { useToday } from "@/features/profile/api";
import { dateSearchSchema } from "@/lib/date-search";

export const Route = createFileRoute("/refeicoes")({
  validateSearch: dateSearchSchema,
  component: MealsRoute,
});

function MealsRoute() {
  const { data } = Route.useSearch();
  const navigate = Route.useNavigate();
  const now = useToday();
  const date = data ?? now;

  return (
    <MealsPage
      date={date}
      today={now}
      onDateChange={(next) => void navigate({ search: { data: next === now ? undefined : next } })}
    />
  );
}
