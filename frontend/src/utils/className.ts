/**
 * 여러 className을 공백으로 구분하여 하나의 문자열로 결합합니다.
 * falsy 값들은 자동으로 필터링됩니다.
 * @param classes - 결합할 className들
 * @returns 공백으로 구분된 className 문자열
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
