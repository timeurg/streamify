const { Transform } = require('node:stream');


class GenerateSong extends Transform {
    constructor(opts, logger,) {
        super({ ...opts, objectMode: true, readableObjectMode: true, writeableObjectMode: true });
        this.logger = logger;
    }
    _transform(
        chord_progressions,
        encoding,
        callback,
    ) {
        const random_progression = () => {
            const i = Math.floor(Math.random() * chord_progressions.length);
            const result = chord_progressions[i];
            console.log('got', result["Progression Quality"], 'at', i)
            return Object.assign(result)
        }
        const mutations = [];
        let genre = {};
        while (genre["Genre"] != '1') {
            const result = random_progression();
            if (result["Genre"] != '1') {
                mutations.push(result)
            } else {
                genre = result;
            }
        }
        if (mutations.length === 0) {
            mutations.push(random_progression())
        }
        const lines = [];
        let songname = genre['Progression Quality'];
        while (lines.length < 4 && (!(lines.length > 16) || Math.random() > 0.1)) {
            const roll = Math.random();
            if (roll > 0.5) {
                lines.push([genre['1st chord'], genre['2nd chord'], genre['3rd chord'], genre['4th chord']])
            } else if (roll > 0.3) {
                const mutation = mutations[Math.floor(Math.random() * mutations.length)];
                if (songname.indexOf(mutation['Progression Quality']) == -1) {
                    songname = `${mutation['Progression Quality']} ${songname}`
                }
                const variations = [
                    [mutation['1st chord'], mutation['2nd chord'], mutation['3rd chord'], mutation['4th chord']],
                    [mutation['1st chord'], mutation['2nd chord'], mutation['3rd chord'], mutation['4th chord']],
                    [mutation['1st chord'], mutation['2nd chord'], mutation['3rd chord'], mutation['4th chord']],
                    [mutation['1st chord'], mutation['2nd chord'], mutation['3rd chord'], mutation['4th chord']],
                    [genre['1st chord'], genre['2nd chord'], mutation['3rd chord'], mutation['4th chord']],
                    [genre['1st chord'], genre['2nd chord'], mutation['3rd chord'], mutation['4th chord']],
                    [mutation['1st chord'], mutation['2nd chord'], genre['3rd chord'], genre['4th chord']],
                    [mutation['1st chord'], mutation['2nd chord'], genre['3rd chord'], genre['4th chord']],
                    [mutation['1st chord'], genre['2nd chord'], mutation['3rd chord'], genre['4th chord']],
                    [genre['1st chord'], mutation['2nd chord'], genre['3rd chord'], mutation['4th chord']],
                ]
                while (Math.random() > 0.1) {
                    lines.push(variations[Math.floor(Math.random() * variations.length)]);
                }
            }
        }
        const scales = {
            "C major": ["C", "Dm", "Em", "F", "G", "Am", "Bdim"],
            "A minor": ["Am", "Bdim", "C", "Dm", "Em", "F", "G"],
            "E minor": ["Em", "F#dim", "G", "Am", "Bm", "C", "D"],
            "G major": ["G", "A", "B", "C", "D", "E", "F"]
        }
        const scale = Object.keys(scales)[Math.floor(Math.random() * Object.keys(scales).length)];
        console.log('scale', scale)
        songname = `${songname} in ${scale}`;
        callback(null, ({
            songname,
            lines: lines.map(line => line.map(i => scales[scale][+i - 1]))
                .map((v, i, a) => (i % 4 == 0) ? [a[i], a[i + 1], a[i + 2], a[i + 3]].filter(i => i) : undefined)
                .filter(i => i),
        }));
    }
}

module.exports = new GenerateSong()