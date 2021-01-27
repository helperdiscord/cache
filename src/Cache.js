const Client = require('pg-native');
const Channels = require('./structs/Channels');
const Guilds = require('./structs/Guilds');
module.exports = class Cache {
    constructor(url, options) {
        this.con = new Client();
        this.con.connectSync(url);
        this.channels = new Channels(this, { cache: options?.cache, rest: options?.rest });
        this.guilds = new Guilds(this, { cache: options?.cache, rest: options?.rest });
    }
    query(q, values = []) {
        return this.con.querySync(q, values);
    }
    mergeObjects(objTarget, objSource) {
        for (const [key, value] of Object.entries(objSource)) {
            const targetValue = Reflect.get(objTarget, key);
            if (this.isObject(value)) {
                Reflect.set(objTarget, key, this.isObject(targetValue) ? this.mergeObjects(targetValue, value) : value);
            }
            else if (!this.isObject(targetValue)) {
                Reflect.set(objTarget, key, value);
            }
        }
        return objTarget;
    }
    deepClone(source) {
        if (source === null || this.isPrimitive(source))
            return source;
        if (Array.isArray(source)) {
            const output = [];
            for (const value of source)
                output.push(this.deepClone(value));
            return output;
        }
        if (this.isObject(source)) {
            const output = {};
            for (const [key, value] of Object.entries(source))
                output[key] = this.deepClone(value);
            return output;
        }
        if (source instanceof Map) {
            const output = new source.constructor();
            for (const [key, value] of source.entries())
                output.set(key, this.deepClone(value));
            return output;
        }
        if (source instanceof Set) {
            const output = new source.constructor();
            for (const value of source.values())
                output.add(this.deepClone(value));
            return output;
        }
        return source;
    }
    isObject(input) {
        return typeof input === 'object' && input ? input.constructor === Object : false;
    }
    isPrimitive(input) {
        return ['string', 'bigint', 'number', 'boolean'].includes(typeof input);
    }
}