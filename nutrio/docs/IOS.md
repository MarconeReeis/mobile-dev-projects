# Rodar o Nutrio no iPhone

O projeto iOS (Capacitor 8, Swift Package Manager, sem CocoaPods) fica em `ios/`.
Compilar para iPhone exige um **Mac com Xcode**; o resto pode ser feito em qualquer sistema.

## 1. Preparar no Mac (primeira vez)

```bash
git fetch
git switch feature/nutrio
cd nutrio
npm install
```

Crie `nutrio/.env.local` (não vai para o git) com os mesmos valores do Windows:

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Sem esse arquivo o app abre em **modo demonstração** (dados de exemplo, sem login).

## 2. Abrir no Xcode

```bash
npm run ios
```

Isso gera o build web, copia para `ios/` (`cap sync`) e abre o Xcode.

No Xcode, na primeira vez:

1. Selecione o projeto **App** → target **App** → aba **Signing & Capabilities**.
2. Em **Team**, escolha seu Apple ID (o time pessoal gratuito serve para testar).
3. Se aparecer erro de _bundle identifier_ indisponível, troque `io.nutrio.app` por algo único,
   como `io.nutrio.app.seunome`, e altere o mesmo valor em `capacitor.config.ts`.

## 3. Rodar no iPhone

1. Conecte o iPhone por cabo e desbloqueie.
2. No iPhone: **Ajustes → Privacidade e Segurança → Modo de Desenvolvedor** → ligar (reinicia).
3. No Xcode, escolha o iPhone no seletor de destino (topo) e clique em **Run** (▶).
4. Na primeira instalação: **Ajustes → Geral → VPN e Gerenciamento de Dispositivos** → confiar no seu certificado.

Com Apple ID gratuito, o app instalado vale por **7 dias**; depois é só rodar de novo pelo Xcode.

## Depois de mudar o código

```bash
npm run cap:sync
```

e **Run** de novo no Xcode.

> Rode o `cap:sync` no **Mac**. No Windows, o Capacitor regrava `ios/App/CapApp-SPM/Package.swift`
> com barras invertidas nos caminhos (`..\..\node_modules`), que o Xcode não entende. Se isso
> acontecer, rode `npm run cap:sync` no Mac antes de abrir o Xcode.

## Opcional: live reload no aparelho

Para ver as mudanças sem recompilar, com Mac e iPhone na mesma rede Wi-Fi:

```bash
npm run dev -- --host
```

Em outro terminal (troque pelo IP do Mac):

```bash
CAP_SERVER_URL=http://192.168.0.10:5173 npx cap sync ios
```

Rode pelo Xcode. Para voltar ao build normal, rode `npm run cap:sync` sem a variável.

## Limitações conhecidas (por enquanto)

- **Links de e-mail** (confirmação de cadastro e recuperação de senha) apontam para
  `http://localhost:5173` e não abrem no iPhone. Entrar com e-mail e senha funciona normalmente.
  Resolve quando o app tiver uma URL publicada ou deep links (roadmap).
- **Exportar dados** abre a folha de compartilhamento do iOS (Salvar em Arquivos, AirDrop…).
