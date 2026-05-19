export interface Label {
  id: string;
  name: string;
  colour: string;
}

export interface CreateLabelRequest {
  name: string;
  colour: string;
}
