const State = require('./bases/State');
module.exports = class Guilds extends State {
    async _get({ rest, cache }, id) {
        let g = (await this.client.pg.query(`SELECT * FROM guilds WHERE guild_id = ${id}`))?.rows[0]
        if (g) {
            return this.client.mergeObjects({ id: g.guild_id }, g.data);
        }
        if (rest) {
            let channel = await this.client.rest.get(`/guilds/${id}`);
            if (cache) {
                let newObj = this.client.deepClone(channel);
                delete newObj.id
                await this.client.pg.query(`INSERT INTO guilds VALUES(
                    ${id},
                    ${channel.guild_id},
                    '${JSON.stringify(newObj).replace(`'`, ``)}'
                  ) ON CONFLICT("guild_id") DO UPDATE SET "data" = EXCLUDED.data;`)
            }
            return channel;
        }
        return null;
    }
    async _set({ rest }, id, data = false) {
        if (data) {
            delete data.id;
            await this.client.pg.query(`INSERT INTO guilds VALUES(
                ${id},
                '${JSON.stringify(data).replace(`'`, ``)}'
              ) ON CONFLICT("guild_id") DO UPDATE SET "data" = EXCLUDED.data;
            `)
            return true;
        }
        if (rest) {
            let channel = await this.client.rest.get(`/guilds/${id}`);
            delete channel.id;
            await this.client.pg.query(`INSERT INTO guilds VALUES(
                ${id},
                '${JSON.stringify(channel).replace(`'`, ``)}'
              ) ON CONFLICT("guild_id") DO UPDATE SET "data" = EXCLUDED.data;
            `)
        }
        return null;
    }
    async _size() {
        let amount = (await this.client.pg.query(`SELECT COUNT(*) FROM guilds`))?.rows[0]?.count;
        return amount ?? 0;
    }
}