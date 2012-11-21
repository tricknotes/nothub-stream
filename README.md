# NotHub Stream

[![Build Status](https://secure.travis-ci.org/tricknotes/nothub-stream.png)](http://travis-ci.org/tricknotes/nothub-stream)

NotHub Stream is a Server of [NotHub](http://nothub.org)

## Setup

``` sh
$ git clone git://github.com/tricknotes/nothub-stream.git ./nothub-stream
$ cd nothub-stream
$ npm install .
```

Edit config:

``` sh
$ cp ./config/stream.config.example ./config/stream.config
```

Write your setting to `./config/stream.config`.

And run:

``` sh
$ npm start
```

## Test

``` sh
$ npm test
```

## Authorization

You can use github authorization, to use advansed rate limit.
- http://developer.github.com/v3/oauth/

Run using `GITHUB_ACCESS_TOKEN` as an environment variable:

``` sh
$ GITHUB_ACCESS_TOKEN="Your API Token" npm start
```

## License

(The MIT License)

Copyright (c) 2012 Ryunosuke SATO &lt;tricknotes.rs@gmail.com&gt;
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
