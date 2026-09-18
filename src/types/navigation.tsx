export type Page =
  | 'home'
  | 'reports'
  | 'detail'
  | 'map'
  | 'create'
  | 'login'
  | 'register'
  | 'profile'
  | 'admin'
  | 'admin-organismos'
  | 'maltrato'
  | 'chat';

export type NavigateFn = (page: Page, id?: string) => void;