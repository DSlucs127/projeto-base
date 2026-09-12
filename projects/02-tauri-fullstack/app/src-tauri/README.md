# Tauri v2 adapter

O adaptador entrega o frontend React nos alvos desktop e mobile:

- `Cargo.toml` declara `staticlib`, `cdylib` e `rlib`, exigidos pelo mobile.
- `src/lib.rs` usa `tauri::mobile_entry_point` no build mobile.
- `tauri.conf.json` aponta para Vite no desenvolvimento e `app/dist` no bundle.
- `capabilities/default.json` concede apenas `core:default`.

```bash
# Desenvolvimento desktop
pnpm tauri dev

# Android/iOS (com toolchains Tauri configurados)
pnpm tauri android init
pnpm tauri android dev
pnpm tauri ios init
pnpm tauri ios dev
```

Para desktop/mobile contra VPS, compile com `VITE_API_BASE_URL` apontando para
o endpoint HTTPS `/api/v1` da instalacao. Nao inclua secrets no bundle.
