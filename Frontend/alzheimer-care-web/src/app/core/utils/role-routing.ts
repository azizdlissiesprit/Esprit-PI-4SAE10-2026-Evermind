export type AppRole = 'ADMIN' | 'AIDANT' | 'MEDECIN' | 'RESPONSABLE';

export function normalizeRole(role: string | null | undefined): AppRole | null {
  const normalized = (role || '').toUpperCase();

  switch (normalized) {
    case 'ADMIN':
    case 'ROLE_ADMIN':
      return 'ADMIN';
    case 'AIDANT':
    case 'ROLE_AIDANT':
      return 'AIDANT';
    case 'MEDECIN':
    case 'ROLE_MEDECIN':
      return 'MEDECIN';
    case 'RESPONSABLE':
    case 'ROLE_RESPONSABLE':
      return 'RESPONSABLE';
    default:
      return null;
  }
}

export function getUserAreaBase(role: string | null | undefined): string {
  switch (normalizeRole(role)) {
    case 'AIDANT':
    case 'MEDECIN':
    case 'RESPONSABLE':
      return '/app';
    case 'ADMIN':
      return '/admin';
    default:
      return '/auth/login';
  }
}

export function getRoleHomeRoute(role: string | null | undefined): string {
  const normalized = normalizeRole(role);

  if (!normalized) {
    return '/auth/login';
  }

  const base = getUserAreaBase(normalized);
  return `${base}/dashboard`;
}

export function getRoleReclamationsRoute(
  role: string | null | undefined,
  reclamationId?: number | null
): string {
  const base = normalizeRole(role) === 'ADMIN' ? '/app/backoffice/reclamations' : `${getUserAreaBase(role)}/reclamations`;

  return reclamationId ? `${base}/${reclamationId}` : base;
}
