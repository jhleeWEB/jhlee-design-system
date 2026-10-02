#!/usr/bin/env bash
# Next App Router 스모크(계획 §2.5-g, #31) — 발행물(tarball)을 소비자 모양 그대로 최소 App Router 앱에 설치해 `next build` 가 서는지 본다.
#
#  - 서버 컴포넌트(app/page.tsx)에서 `buttonVariants()` 등 `*Variants` 를 호출한다 — `*.variants.ts` 에 지시문이 없어야 통과한다.
#  - 클라이언트 페이지(app/client/page.tsx, "use client")가 루트 배럴의 **전 export** 를 로드하고 이름을 나열하며, props 없이 서는 것들을 렌더한다.
#    (Radix 부품처럼 Root 밖에서 던지는 것까지 전부 렌더하면 스모크가 DS 가 아니라 픽스처를 검사하게 된다 — 로드는 전부, 렌더는 안정된 부분집합.)
#  - CSS 는 소비자 계약 네 줄(README «쓰기») 그대로다.
# 비필수 야간 workflow(.github/workflows/smoke-next.yml)가 돌리고, 로컬은 `bash scripts/smoke-next.sh` (네트워크 필요: next · react · tailwind 를 받는다).
set -euo pipefail
ROOT=$(cd "$(dirname "$0")/.." && pwd)
PKG="$ROOT/packages/ui"
WORK=${SMOKE_NEXT_DIR:-$(mktemp -d "${TMPDIR:-/tmp}/jds-smoke-next.XXXXXX")}
NEXT_VERSION=${SMOKE_NEXT_VERSION:-latest}
echo "smoke-next: work dir $WORK (next@$NEXT_VERSION)"

# 1. tarball — pnpm pack 이어야 publishConfig.exports(dist) 치환을 받는다(npm pack 은 못 받는다).
mkdir -p "$WORK/pack"
(cd "$PKG" && pnpm pack --pack-destination "$WORK/pack" >/dev/null)
TARBALL=$(ls "$WORK/pack"/*.tgz | head -1)
echo "smoke-next: tarball $TARBALL"

# 2. 최소 App Router 앱
APP="$WORK/app"
mkdir -p "$APP/app/client"
cat > "$APP/package.json" <<JSON
{
  "name": "jds-smoke-next",
  "private": true,
  "type": "module",
  "scripts": { "build": "next build" },
  "dependencies": {
    "@jhleeweb/jhlee-design-system": "file:$TARBALL",
    "next": "$NEXT_VERSION",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.3.0",
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "postcss": "^8",
    "tailwindcss": "^4.3.0",
    "typescript": "^5"
  }
}
JSON
cat > "$APP/postcss.config.mjs" <<'JS'
export default { plugins: { "@tailwindcss/postcss": {} } };
JS
cat > "$APP/next.config.mjs" <<'JS'
export default { typescript: { ignoreBuildErrors: false }, eslint: { ignoreDuringBuilds: true } };
JS
cat > "$APP/tsconfig.json" <<'JSON'
{
  "compilerOptions": {
    "target": "ES2022", "lib": ["dom", "dom.iterable", "esnext"], "module": "esnext", "moduleResolution": "bundler", "jsx": "preserve",
    "strict": true, "skipLibCheck": true, "noEmit": true, "isolatedModules": true, "esModuleInterop": true, "incremental": true,
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
JSON
cat > "$APP/app/globals.css" <<'CSS'
@import "tailwindcss/theme.css" layer(theme);
@import "@jhleeweb/jhlee-design-system/theme.css";
@import "tailwindcss/utilities.css" source(none);
@source "./";
CSS
cat > "$APP/app/layout.tsx" <<'TSX'
import "./globals.css";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="light">
      <body>{children}</body>
    </html>
  );
}
TSX
# 서버 컴포넌트 — *Variants 만 부른다(지시문 없는 모듈이어야 서버에서 실행된다).
cat > "$APP/app/page.tsx" <<'TSX'
import Link from "next/link";
import { alertVariants, badgeVariants, buttonVariants, cardVariants, inputVariants, modalVariants, toastVariants } from "@jhleeweb/jhlee-design-system";

export default function Page() {
  const classes = [
    buttonVariants({ variant: "solid", tone: "primary" }),
    badgeVariants({}),
    cardVariants({}),
    alertVariants({}),
    inputVariants({}),
    modalVariants({}),
    toastVariants({}),
  ];
  return (
    <main className="p-6">
      <h1 className="text-title">Server component — variants only</h1>
      <ul className="text-body">{classes.map((c, i) => <li key={i}><code>{c}</code></li>)}</ul>
      <Link className={buttonVariants({ variant: "link" })} href="/client">client page</Link>
    </main>
  );
}
TSX
# 클라이언트 페이지 — 전 export 를 로드하고 안정된 부분집합을 렌더한다.
cat > "$APP/app/client/page.tsx" <<'TSX'
"use client";
import * as DS from "@jhleeweb/jhlee-design-system";
import { Alert, Badge, Button, ButtonGroup, Card, Input, Progress, Separator, Skeleton, Spinner, StatusDot, ToastProvider, TooltipProvider } from "@jhleeweb/jhlee-design-system";

export default function ClientPage() {
  const names = Object.keys(DS).sort();
  return (
    <TooltipProvider>
      <ToastProvider>
        <main className="p-6 flex flex-col gap-4">
          <h1 className="text-title">Client page — {names.length} exports loaded</h1>
          <ButtonGroup>
            <Button tone="primary" variant="solid">Primary</Button>
            <Button loading>Loading</Button>
          </ButtonGroup>
          <Badge tone="success">ok</Badge>
          <StatusDot tone="warning" label="warning" />
          <Alert tone="info">Alert</Alert>
          <Card>card</Card>
          <Input placeholder="input" />
          <Progress value={40} />
          <Spinner />
          <Skeleton />
          <Separator />
          <ul className="text-label">{names.map(n => <li key={n}>{n}</li>)}</ul>
        </main>
      </ToastProvider>
    </TooltipProvider>
  );
}
TSX

# 3. 설치 · 빌드
cd "$APP"
echo "smoke-next: npm install"
npm install --no-audit --no-fund --loglevel=error
echo "smoke-next: next build"
npx next build
echo "smoke-next: OK ($(node -p "require('next/package.json').version"))"
