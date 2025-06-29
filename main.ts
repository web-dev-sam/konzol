
// In your .d.ts files
declare function log(format: string, ...args: unknown[]): void




fetch(`https://jsonplaceholder.typicode.com/users`)
  .then((r) => r.json())
  .then((users) => {
    log!('Original: {}', users)
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




