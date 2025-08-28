import type { Space } from "./space";

export interface User {
  id: string;
  name: string;
  last_name: string;
  email: string;
  created_at: string;
  updated_at: string;
  image: string;
  spaces: Space[];
}

