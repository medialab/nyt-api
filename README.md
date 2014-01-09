# warning

super QAD nyt-api fetcher, used during sprint with the query: `"global warming" OR "climate change"`

# example

to see sample result of the `/authors` endpoint, go to:

[http://medialab.github.io/nyt-api/public/sample.html](http://medialab.github.io/nyt-api/public/sample.html)

it works because i just copied and pasted my local rendered html (and the `/css` and `/js` are relatives in the same `/public` folder)

# to do

* put all the special cases from `bam.utils.js` in `config.js`
* automatic time-interval splitting (not only month by month)
* allow multiple queries

# install

> npm install

# run

> cp config.default.js config.js (and update)

> mongod

> npm start

# use

got to:
* `http://localhost:3000/all` to display all articles json
* `http://localhost:3000/write` to write db to a local .csv file
* `http://localhost:3000/launch` to start fetching articles (warning!)
* `http://localhost:3000/authors` to display list of authors (see sample above)

fetch will be done by month between the years defined in `config.js`

# License

Based on the [node-express-mongoose](https://github.com/madhums/node-express-mongoose) boilerplate

License is MIT
