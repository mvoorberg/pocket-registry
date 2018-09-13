import {PropertyPath} from 'lodash';

declare class PocketRegistry<T extends Object = {}> {
  register: T;
  set(key: PropertyPath, value: any): T;
  get<TKey extends keyof T, TDefault>(key: TKey, defaultValue: TDefault): T[TKey] | TDefault;
  has<T extends PropertyPath = PropertyPath>(key: T): boolean;
  remove(key: PropertyPath): boolean;
  readonly keys: Array<keyof T>;
}

export default PocketRegistry;
