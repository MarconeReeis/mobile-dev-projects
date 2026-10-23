import "@fontsource-variable/figtree";
import "@fontsource-variable/urbanist";
import "@/styles/globals.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { queryClient, router } from "@/app/router";
import { AuthProvider } from "@/features/auth/auth-provider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
