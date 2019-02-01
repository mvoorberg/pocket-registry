declare class PocketRegistry {
  register: Object;
  set(key: String, value: any): void;
  get(key: String, defaultValue?: any): any;
  has(key: String): boolean;
  remove(key: String): boolean;
  readonly keys: Array<keyof String>;
}

export default PocketRegistry;
