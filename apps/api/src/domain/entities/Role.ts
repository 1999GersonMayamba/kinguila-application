/** Papel de autorização atribuível a um utilizador. */
export interface Role {
  id: string;
  name: string;
}

/** Papéis conhecidos do sistema. */
export const ROLE_ADMIN = 'admin';
export const ROLE_USER = 'user';
