import type { Space } from "./space";

export interface User {
  id: number;
  name: string;
  last_name: string;
  email: string;
  image: string;
  spaces: Space[];
}

