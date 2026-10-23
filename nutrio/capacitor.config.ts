import type { CapacitorConfig } from "@capacitor/cli";

// Live reload no aparelho: rode `npm run dev -- --host` no Mac e sincronize com
// CAP_SERVER_URL=http://<ip-do-mac>:5173 (veja docs/IOS.md). Sem a variável, o app usa o build em dist/.
const devServer = process.env.CAP_SERVER_URL;

const config: CapacitorConfig = {
  appId: "io.nutrio.app",
  appName: "Nutrio",
  webDir: "dist",
  ios: {
    // As áreas seguras (notch, barra inferior) são tratadas no CSS com env(safe-area-inset-*).
    contentInset: "never",
    backgroundColor: "#f4f6ef",
  },
  plugins: {
    Keyboard: { resizeOnFullScreen: true },
  },
  ...(devServer ? { server: { url: devServer, cleartext: true } } : {}),
};

export default config;
