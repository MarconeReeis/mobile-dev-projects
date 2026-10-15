import { Observable, Subscription } from 'rxjs';

export interface StreamConnection {
  subscription: Subscription;
  /** Resolve na primeira emissão (ou erro), para o app não ficar travado esperando a rede. */
  ready: Promise<void>;
}

export function connectStream<T>(
  source: Observable<T>,
  onNext: (value: T) => void | Promise<void>,
  label: string,
): StreamConnection {
  let markReady: () => void = () => undefined;
  const ready = new Promise<void>((resolve) => (markReady = resolve));

  const subscription = source.subscribe({
    next: async (value) => {
      try {
        await onNext(value);
      } catch (error) {
        console.error(`[Dados] Falha ao processar ${label}`, error);
      } finally {
        markReady();
      }
    },
    error: (error) => {
      console.error(`[Dados] Falha ao carregar ${label}`, error);
      markReady();
    },
  });

  return { subscription, ready };
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
