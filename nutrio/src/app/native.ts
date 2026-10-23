// Ajustes que só valem dentro do app nativo (Capacitor). No navegador, nada acontece.

import { Capacitor } from "@capacitor/core";

export const isNative = Capacitor.isNativePlatform();

export async function setupNative() {
  if (!isNative) return;
  // Import dinâmico: os plugins só são baixados no app nativo.
  const [{ StatusBar, Style }, { Keyboard }] = await Promise.all([
    import("@capacitor/status-bar"),
    import("@capacitor/keyboard"),
  ]);
  // Fundo claro do app → texto escuro na barra de status.
  await StatusBar.setStyle({ style: Style.Light }).catch(() => {});
  // Barra "Concluído" acima do teclado do iOS: ajuda a fechar o teclado numérico.
  await Keyboard.setAccessoryBarVisible({ isVisible: true }).catch(() => {});
}
