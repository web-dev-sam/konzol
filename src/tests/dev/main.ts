/** biome-ignore-all lint/style/noNonNullAssertion: Ignore this for now */









fetch(`https://jsonplaceholder.typicode.com/users`)
  .then((r) => r.json())
  .then((users) => {
    log!('Original:  {}', users)
    log!('{*.address.geo.lat}', users)
    log!('{*.address.geo.lat:k}', users) // |gt<0>
  })







fetch(`https://jsonplaceholder.typicode.com/photos`)
  .then((r) => r.json())
  .then((photos) => {
    log!('Photos:     {*:count}', photos)
    log!('Albums:     {*.albumId:unique|count}', photos)
    log!('Thumbnails: {*.thumbnailUrl:unique|count}', photos)
    // ^^^ 5000 - 4996 => 4 duplicate thumbnails ^^^
  })






















// string coding chars
// a-zA-Z0-9_
// .,;: []{}() <>@$%#?!= ~&| *+-/\^

// Categories of syntax
// 1. Arbitrary functions `(func)` `(func|func2)`
// 2. Injected variables `{}` `{varA}`
// 3. Literal props `[any(thing){is literal}]` // Result: "any(thing){is literal}"

// Features:
// 2. Injected Variables
//   2.1. `{varA}` `{varB}` `{varC}`
//   2.2. `{varA.propA.0.propB}` `{varA.propA.*.propB}``{varA.prop[.]A.*.propB}`
//   2.3. `{varA:.4}`          -> 3.1415
//        `{varA:,}`           -> 300,000,000
//        `{varA:.4,}` `{varA:,.4}` -> 300,000,000.1234
//        `{varA:<8}`          -> "    hello"      (right aligned text)
//        `{varA:>8}`          -> "hello    "      (left aligned text)
//        `{varA:^12}`         -> "    helo    "   (centered text)
//        `{varA:#^12}`        -> "####helo####"        (centered text)
//        `{{varA:^6}:#^12}`   -> "### helo ###"   (centered text)
//        `{varA:^6|#^12}`     -> "### helo ###"   (centered text)
//        `{varA:(^6)|(#^12)}` -> "### helo ###"   (centered text)
//        `{varA:?}`           -> "helo\n    at <anonymous>:1:1"   (stack-trace)
//        `{varA:(lower|upper|snake|kebab|camel|capitalize|repeat(3)|trim|first|last|center(12,#)|oneline|red|green|blue|<#fff>|italic|bold)}` -> ...
//        `{varA:@search}`   -> Search for any key or value that includes 'search' in it
//        `{varA:@[exactly this.]}` -> Search for any key or value that exactly matches 'exactly this.'
//        `{varA:@.search}`  -> Search for any key that includes 'search' in it
//        `{varA:@@search}`  -> Search for any value that includes 'search' in it
//        `{varA:@%regex%}`  -> Search for any key or value that matches the regex
//        `{varA:@.%regex%}` -> Search for any key that matches the regex
//        `{varA:@@%regex%}` -> Search for any value that matches the regex
//        `{varA:@@%regex%i}` -> Search for any value that matches the regex with flags

// Syntax:
// RootExpression:     `{VariableExpression:ModifierExpression}`
// ModifierExpression: `(FunctionExpression)` or `(FunctionExpression|FunctionExpression)`
// FunctionExpression: `FunctionName` or `FunctionName(ArgumentList)` or `Shorthand`
// ArgumentList:      `Argument` or `Argument, Argument` or `Argument, Argument, ...`
// Shorthand:         `(anything here ...)` or `@search` or `@.search` or `@@search` or `@@%regex%`
//                    or `?` or `<5` or `>5` or `^12` or `#^12` or ...
// ...

// API
// $format(format: Format, ...args: any[]): string
// $log(format: Format, ...args: any[]): void
// $warn(format: Format, ...args: any[]): void
// $error(format: Format, ...args: any[]): void
// $info(format: Format, ...args: any[]): void
// $debug(format: Format, ...args: any[]): void
