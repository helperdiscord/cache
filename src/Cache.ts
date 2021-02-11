//@ts-ignore
import Client from 'pg-native';
import { Channels } from './structs/Channels';
import { Guilds } from './structs/Guilds';
import { Roles } from './structs/Roles';
import { Members } from './structs/Members';
import { Users } from './structs/Users';
/**
 *
 *
 * @export
 * @interface ClientOptions
 */
export interface ClientOptions {
    cache?: boolean;
    rest?: any;
}
/**
 *
 *
 * @export
 * @class Cache
 */
export class Cache {
    /**
     *
     * @description The postgres client for this cache instance
     * @type {Client}
     * @memberof Cache
     */
    public con: Client;
    public guilds: Guilds;
    public roles: Roles;
    public members: Members;
    public users: Users;
    public channels: Channels;
    /**
     * Creates an instance of Cache.
     * @param {string} url
     * @param {ClientOptions} options
     * @memberof Cache
     */
    constructor(url: string, options: ClientOptions) {
        this.con = new Client();
        this.con.connectSync(url);
        this.channels = new Channels(this, { cache: options?.cache, rest: options?.rest });
        this.guilds = new Guilds(this, { cache: options?.cache, rest: options?.rest });
        this.roles = new Roles(this, { cache: options?.cache, rest: options?.rest });
        this.members = new Members(this, { cache: options?.cache, rest: options?.rest });
        this.users = new Users(this, { cache: options?.cache, rest: options?.rest });
    }
    /**
     *
     *
     * @template T
     * @param {string} q
     * @param {string[]} [values=[]]
     * @return {*}  {T}
     * @memberof Cache
     */
    public query<T>(q: string, values: string[] = []): T {
        return this.con.querySync(q, values);
    }
    /**
     *
     *
     * @template A
     * @template B
     * @param {A} objTarget
     * @param {Readonly<B>} objSource
     * @return {*}  {(A & B)}
     * @memberof Cache
     */
    public mergeObjects<A extends object, B extends object>(objTarget: A, objSource: Readonly<B>): A & B {
        for (const [key, value] of Object.entries(objSource)) {
            const targetValue = Reflect.get(objTarget, key);
            if (this.isObject(value)) {
                Reflect.set(objTarget, key, this.isObject(targetValue) ? this.mergeObjects(targetValue, value as object) : value);
            } else if (!this.isObject(targetValue)) {
                Reflect.set(objTarget, key, value);
            }
        }

        return objTarget as A & B;
    }
    /**
     *
     *
     * @template T
     * @param {T} source
     * @return {*}  {T}
     * @memberof Cache
     */
    public deepClone<T>(source: T): T {
        // Check if it's a primitive (with exception of function and null, which is typeof object)
        if (source === null || this.isPrimitive(source)) return source;
        if (Array.isArray(source)) {
            const output = [] as unknown as T & T extends (infer S)[] ? S[] : never;
            for (const value of source) output.push(this.deepClone(value));
            return output as unknown as T;
        }
        if (this.isObject(source)) {
            const output = {} as Record<PropertyKey, unknown>;
            for (const [key, value] of Object.entries(source)) output[key] = this.deepClone(value);
            return output as unknown as T;
        }
        if (source instanceof Map) {
            const output = new (source.constructor as MapConstructor)() as unknown as T & T extends Map<infer K, infer V> ? Map<K, V> : never;
            for (const [key, value] of source.entries()) output.set(key, this.deepClone(value));
            return output as unknown as T;
        }
        if (source instanceof Set) {
            const output = new (source.constructor as SetConstructor)() as unknown as T & T extends Set<infer K> ? Set<K> : never;
            for (const value of source.values()) output.add(this.deepClone(value));
            return output as unknown as T;
        }
        return source;
    }
    /**
     *
     *
     * @param {unknown} input
     * @return {*}  {(input is Record<PropertyKey, unknown> | object)}
     * @memberof Cache
     */
    public isObject(input: unknown): input is Record<PropertyKey, unknown> | object {
        return typeof input === 'object' && input ? input.constructor === Object : false;
    }
    /**
     *
     *
     * @param {unknown} input
     * @return {*}  {(input is (string | bigint | number | boolean))}
     * @memberof Cache
     */
    public isPrimitive(input: unknown): input is (string | bigint | number | boolean) {
        return ['string', 'bigint', 'number', 'boolean'].includes(typeof input);
    }
}