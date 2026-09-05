export function isAuthorized(
  providedSecret: string | undefined,
  configuredSecret: string,
): boolean {
  return (
    configuredSecret.length > 0 &&
    providedSecret !== undefined &&
    providedSecret === configuredSecret
  );
}
