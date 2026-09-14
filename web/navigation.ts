export function useRouter() {
  return { push(path: string) { window.location.hash = path; } };
}
