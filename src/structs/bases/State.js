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
    _fetch() {
        throw Error('Function "fetch" is not implemented');
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
    get(...args) {
        return this._get(...args);
    }
    async fetch(...args) {
        return this._fetch({rest: this.rest ? true : false}, ...args);
    }
    async set(...args) {
        return this._set({rest: this.rest ? true : false }, ...args);
    }
    async update(...args) {
        return this.set(...args);
    }
    del(...args) {
        return this._del(...args)
    }
    size() {
        return this._size();
    }
}