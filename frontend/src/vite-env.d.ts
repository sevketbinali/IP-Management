/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_PLANT_CODE: string
  readonly VITE_ORGANIZATION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}