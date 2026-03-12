import { treaty } from '@elysiajs/eden'
import type { ServerApp } from '..'

const URL = process.env.BUN_PUBLIC_BASE_URL || window.location.origin

const apiFetch = treaty<ServerApp>(URL)

export default apiFetch
