# A playground for PoeMD

This static website provides a simple playground for the PoeMD language. For more information about it, see [the PoeMD parser](https://github.com/tadeassoucek/poemd-parser) as well as [the PoeMD specification](https://github.com/tadeassoucek/poemd-parser/blob/main/docs/specification.md)

## Installation

~~~
npm install -g browserify
git clone https://github.com/tadeassoucek/poemd-online
npm install
npm start
~~~

And then open `index.html` in your browser of choice.

## Known issues

### Layout is wonky with long lines

Yeah, don't know what to do about that. In my defence, flexbox is hard. I'll probably fix it at some point. Can't promise anything tho.

### Auto-compile doesn't fire when I finish writing

That's because it fires on `keyup` in the typing area if the last compilation was more than 150 milliseconds ago. If not, it just gets ignored. I'll try to fix this as soon as possible.

It also fires unconditionally on the `change` event of the typing area, so clicking around should recompile the thing.
