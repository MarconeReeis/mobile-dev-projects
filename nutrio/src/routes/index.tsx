import { createFileRoute } from "@tanstack/react-router";

import { DashboardPage } from "@/features/dashboard/dashboard-page";
import { useToday } from "@/features/profile/api";
import { dateSearchSchema } from "@/lib/date-search";

// A data selecionada fica na URL (?data=AAAA-MM-DD): voltar/avançar e links funcionam.
export const Route = createFileRoute("/")({
  validateSearch: dateSearchSchema,
  component: DashboardRoute,
});

function DashboardRoute() {
  const { data } = Route.useSearch();
  const navigate = Route.useNavigate();
  const now = useToday();
  const date = data ?? now;

  return (
    <DashboardPage
      date={date}
      today={now}
      onDateChange={(next) => void navigate({ search: { data: next === now ? undefined : next } })}
    />
  );
}
