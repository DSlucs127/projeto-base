param(
  [switch]$SkipMigrate
)

$ErrorActionPreference = 'Stop'
$root = Resolve-Path (Join-Path $PSScriptRoot '..\..')
Set-Location $root

if (-not (Test-Path '.env')) {
  Copy-Item '.env.example' '.env'
  throw 'Created .env. Fill every required secret and DATABASE_URL, then re-run this command.'
}

corepack enable
pnpm install
pnpm --filter @template/api prisma:generate
if (-not $SkipMigrate) {
  pnpm --filter @template/api prisma:migrate
}
pnpm dev
