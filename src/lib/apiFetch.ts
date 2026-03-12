import { treaty } from '@elysiajs/eden'
import type { ServerApp } from '..'

const apiFetch = treaty<ServerApp>(window.location.origin)

export default apiFetch
