export interface Space {
  id: string;
  name: string;
  description: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
}

export interface SearchSpacesResponse {
  spaces: Space[];
}
