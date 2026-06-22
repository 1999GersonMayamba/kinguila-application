/** Papel de autorização atribuível a um utilizador. */
export interface Role {
  id: string;
  name: string;
}

/** Papéis conhecidos do sistema. */
export const ROLE_ADMIN = 'admin';
/** Role atribuída por omissão a quem cria conta na plataforma. */
export const ROLE_CLIENT = 'client';
