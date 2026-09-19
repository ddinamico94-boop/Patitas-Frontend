export type Page =
  | 'home'
  | 'reports'
  | 'adoptar'
  | 'map'
  | 'create'
  | 'detail'
  | 'login'
  | 'register'
  | 'profile'
  | 'admin'
  | 'admin-organismos'
  | 'maltrato'
  | 'chat';

export type NavigateFn = (
  page: Page,
  id?: string
) => void;