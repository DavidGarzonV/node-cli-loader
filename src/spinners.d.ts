import { Spinner } from 'utils/loader/types';

declare module './spinners.json' {
  const value: Record<string, Spinner>;
  export default value;
}