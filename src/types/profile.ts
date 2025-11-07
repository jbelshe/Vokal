import { Birthday } from "./birthday";
export type Profile = {
  phoneNumber: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  zipCode: string | null;
  gender: string | null;
  birthday: Birthday | null;
  emailSubscribed: boolean;
  userId: string | null;
  role: string | null;
};
