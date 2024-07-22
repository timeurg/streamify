# Building a song generation service from a csv file

While searching for a csv to use as an example I came across a [dataset of chord progressions](./data/chord-progressions.csv).

It has descriptions like 'Moody', 'Catchy' mixed with genres like 'Flamenco' and 'Grunge', which practically begs for a song-generating app.

Using `streamify` we already got it, just write our app logic in a [generate-a-song.js](./generate-a-song.js) file and you got yourself a one-command configurable microservice:

Call `streamify`.

`streamify --verbose \`

Pass our csv as `streamify` source. Some time later we might want to replace it with an AI-generation web service and will be able to do so with ease.

`./data/chord-progressions.csv \` 

We'll use third-party [library](https://csv.js.org/parse/) which we installed earlier via `npm i csv-parse`. Why reinvent the bike, right?

`-w from:csv-parse:parse:(delimiter=,) \` 

Add some built-in `streamify` workers to trasform arrays to objects and pack them into an array.

`-w row2obj -w aggregate \` 

We got ourselves a database for our generator to make decisions upon.

We expect array of `{"1st chord","2nd chord","3rd chord","4th chord","Progression Quality","Genre"}` string maps as input.

Write our song-generating logic into [generate-a-song.js](./generate-a-song.js) file and add it to pipeline.

`-w generate-a-song \` 

We'll output a `{songname: string, prompt: string, lines: Chord[4][1,4][]}` object for next workers in line to transform. 

Here, for example, we extract `prompt` property of our song and save it to a [file](./data/Wistful-Grunge-in-A-minor.json) (`streamify` destination) to use it for AI-generation later.

`-w extract:prompt ../temp/last-prompt.txt`

Actually, now that I think of it, prompt generation should've rather been a pipeline step of its own... Well, good enough for an example, illustrating using csv as source.
