const https = require('https')
const Jimp = require('jimp')
const WebSocket = require('ws')
const socket = require('dgram').createSocket('udp4')
var raf = require('raf')
const udp_server_port = 6000
socket.bind( () => socket.setBroadcast( true ) )

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
    console.log( 'Client connected')
    ws.on('message', function incoming(message) {
        console.log('received: %s', message)
    })
})

var queue = []
var width = 48
var height = 18
var currentPoster = 0
var isInitialFetch = true
var isInitialLoad = true
var offset = 0
var fadeControl = true
var intensity = 1



// var symbols = '.:-=+*#'.split( '' )
var symbols = '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/|()1{}[]?-_+~<>i!lI;:,"^`\'. '.split( '' ).reverse()

const fetchPosters = () => {
    https.get( 'https://susurros.herokuapp.com/getppb', res => {
        res.setEncoding( 'utf8' )
        res.on( 'data', data => {
            var count = 0
            JSON.parse( data ).forEach( f => {
                var added = false
                queue.forEach( q => { if( q.id == f.id ) added = true } )
                if( !added ) {
                    f.data = null
                    queue.push( f )
                    count++
                }
            })
            if( count ) console.log( '----> added ' + count + ' posters' )
            if( isInitialFetch ) {
                readPoster(  )
                setInterval( () => readPoster(), 2000 )
                isInitialFetch = false
            }
        })
    })
}

const readPoster = ( ) => {
    var select = null
    for( var i = 0 ; i < queue.length ; i++ ) {
        if( queue[ i ].data == null ) select = i
        if( select !== null ) break;
    }
    if( select == null ) return console.log( 'no new posters' )
    https.get( 'https://susurros.herokuapp.com/getppbposter/' + queue[ select ].id, res => {
        res.setEncoding( 'utf8' )
        res.on( 'data', data => {
            const buffer = Buffer.from( data, 'base64')
            var pxldata = []
            Jimp.read(buffer, (err, res) => {
                if (err) throw new Error(err)
                res.scan(0, 0, res.bitmap.width, res.bitmap.height, function(x, y, idx) {
                    var red = this.bitmap.data[ idx + 0 ]
                    pxldata.push( red )
                })

                queue[ select ].data = pxldata
                queue[ select ].width = res.bitmap.width
                queue[ select ].height = res.bitmap.height
                // console.log( "poster loaded" + select )
                if( isInitialLoad ) {
                    setInterval( () => {
                        fadeControl = false
                    }, 4500 )
                    setInterval( () => {
                        if( currentPoster < queue.length - 1 ) currentPoster++
                        else currentPoster = 0
                        offset = 0
                        fadeControl = true
                    }, 5000 )
                    isInitialLoad = false
                }
            })
        })
    })
}

const runCurrentPoster = () => {
    if( queue[ currentPoster ] == null || queue[ currentPoster ].data == null ) return
    console.clear()
    
    // set buffer
    const stride = 3 // r + g + b
    var image = new Buffer.alloc( width * height * stride )
    var pointer = 0
    
    var poster =  queue[ currentPoster ]
    for( var i = 0 ; i < height ; i++ ){
        var l = ''
        for( var j = 0 ; j < width ; j++ ){
            var pxlVal = poster.data[ ( ( j + offset ) % poster.width ) + poster.width * i ] * intensity
            l += symbols[ Math.floor( ( pxlVal / 255 ) * ( symbols.length - 1 ) ) ]
            image[ pointer * stride + 0 ] = pxlVal
            image[ pointer * stride + 1 ] = pxlVal
            image[ pointer * stride + 2 ] = pxlVal
            pointer++
        }
        console.log( l )
    }

    send( socket, image ) // ---> Error: send EMSGSIZE 255.255.255.255:6000
    
    offset++
}

function send( socket, message ) {
    socket.send( message, udp_server_port, 'localhost', err => {
        if( err ) return console.log( err )
        send(socket, message) 
    })
}

setInterval( () => fetchPosters(), 60000 )
setInterval( () => runCurrentPoster(), 100 )

raf(function tick() {
    if( fadeControl ) intensity += ( 1 - intensity ) * 0.1
    else intensity -= intensity * 0.1
    raf(tick)
  })


fetchPosters()