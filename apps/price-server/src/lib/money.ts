/** All server arithmetic is in integer cents; strings only exist on the wire. */
export function formatCents(cents: number): string {
  const whole = Math.trunc(cents / 100);
  const rest = String(cents % 100).padStart(2, '0');
  return `${whole}.${rest}`;
}
