const { Client } = require('pg-native');
const Channels = require('./structs/Channels');
const Guilds = require('./structs/Guilds');
module.exports = class Cache {
    constructor(url, options) {
        this.pg = new Client({ connectionString: url });
        this.channels = new Channels(this, { cache: options?.cache, rest: options?.rest });
        this.guilds = new Channels(this, { cache: options?.cache, rest: options?.rest });
    }
    static mergeObjects(objTarget, objSource) {
        for (const [key, value] of Object.entries(objSource)) {
            const targetValue = Reflect.get(objTarget, key);
            if (Cache.isObject(value)) {
                Reflect.set(objTarget, key, Cache.isObject(targetValue) ? mergeObjects(targetValue, value) : value);
            }
            else if (!Cache.isObject(targetValue)) {
                Reflect.set(objTarget, key, value);
            }
        }
        return objTarget;
    }
    static deepClone(source) {
        if (source === null || Cache.isPrimitive(source))
            return source;
        if (Array.isArray(source)) {
            const output = [];
            for (const value of source)
                output.push(deepClone(value));
            return output;
        }
        if (Cache.isObject(source)) {
            const output = {};
            for (const [key, value] of Object.entries(source))
                output[key] = deepClone(value);
            return output;
        }
        if (source instanceof Map) {
            const output = new source.constructor();
            for (const [key, value] of source.entries())
                output.set(key, deepClone(value));
            return output;
        }
        if (source instanceof Set) {
            const output = new source.constructor();
            for (const value of source.values())
                output.add(deepClone(value));
            return output;
        }
        return source;
    }
    static isObject(input) {
        return typeof input === 'object' && input ? input.constructor === Object : false;
    }
    static isPrimitive(input) {
        return ['string', 'bigint', 'number', 'boolean'].includes(typeof input);
    }
}