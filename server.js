const https = require("https")
const http = require("http")
const url = 'https://susurros.herokuapp.com/getppb'

var queue = []

https.get(url, res => {
  res.setEncoding( 'utf8' )
  res.on( 'data', data => {
      JSON.parse( data ).forEach( f => {
          var added = false
          queue.forEach( q => { if( q.id == f.id ) added = true } )
          if( !added ) queue.push( f )
      })
      console.log( queue )
  })
})


http.get( 'http://localhost:5000/getppbposter/1GdYpNrqtKLMWfeZ9-TYBAFlZ8D-9fCGJ', res => {
    res.setEncoding( 'utf8' )
    res.on( 'data', data => {
        console.log( Buffer.from( data, 'base64' ) )
        require("fs").writeFile("out.png", Buffer.from( data, 'base64' ), function(err) {
            console.log(err);
        });
    })
})