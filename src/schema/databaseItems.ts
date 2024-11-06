export interface Participant {
  id: number;
  empid: string;
  name: string;
  category: string;
  serviceline: string;
  registered: boolean;
  registereddatetime: Date | null;
  isdrawn: boolean;
  prizewon: number | null;
}
