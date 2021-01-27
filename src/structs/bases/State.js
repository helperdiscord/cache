module.exports = class State {
    constructor(client, options) {
        this.client = client;
        this.rest = options.rest ?? false;
        this.options = {
            cache: options.cache ?? true
        };
    }
    _get() {
        throw Error('Function "get" is not implemented');
    }
    _set() {
        throw Error('Function "set" is not implemented');
    }
    _size() {
        throw Error('Function "size" is not implemented');
    }
    _del(){
        throw Error('Function "del" is not implemented');
    }
    async get(...args) {
        return this._get({rest: this.rest ? true : false, cache: this.options.cache }, ...args);
    }
    async set(...args) {
        return this._set({rest: this.rest ? true : false }, ...args);
    }
    async update(...args) {
        return this.set(...args);
    }
    async del(...args) {
        return this._del(...args)
    }
    async size() {
        return this._size();
    }
}