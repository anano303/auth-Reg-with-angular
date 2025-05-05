export interface User {
  id?: string | number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  token?: string;
}
