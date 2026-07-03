export const JUMP_TO_TODAY_EVENT = 'shiftsync:jump-to-today'

export function requestJumpToToday(): void {
  window.dispatchEvent(new CustomEvent(JUMP_TO_TODAY_EVENT))
}

export function onJumpToToday(handler: () => void): () => void {
  const listener = () => handler()
  window.addEventListener(JUMP_TO_TODAY_EVENT, listener)
  return () => window.removeEventListener(JUMP_TO_TODAY_EVENT, listener)
}
