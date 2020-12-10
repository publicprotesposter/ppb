const https = require('https')
const Jimp = require('jimp')

// setup socket
const socket = require('dgram').createSocket('udp4')
const udp_server_port = 6000
socket.bind( () => socket.setBroadcast( true ) )

var queue = []
var width = 48
var height = 18
var currentPoster = 0
var isInitial = true
var offset = 0
var symbols = '.:-=+*#'.split( '' )

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
            if( isInitial ) {
                readPoster( currentPoster )
                isInitial = false
            }
        })
    })
}

const readPoster = ( queueId ) => {
    https.get( 'https://susurros.herokuapp.com/getppbposter/' + queue[ queueId ].id, res => {
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

                queue[ queueId ].data = pxldata
                queue[ queueId ].width = res.bitmap.width
                queue[ queueId ].height = res.bitmap.height

                runCurrentPoster()
            })
        })
    })
}



const runCurrentPoster = () => {
    if( queue[ currentPoster ] == null || queue[ currentPoster ].data == null ) return
    // console.clear()
    
    // set buffer
    const stride = 3 // r + g + b
    var image = new Buffer.alloc( width * height * stride )
    var pointer = 0
    
    var poster =  queue[ currentPoster ]
    for( var i = 0 ; i < height ; i++ ){
        var l = ''
        for( var j = 0 ; j < width ; j++ ){
            var pxlVal = poster.data[ ( ( j + offset ) % poster.width ) + poster.width * i ]
            l += symbols[ Math.floor( ( pxlVal / 255 ) * ( symbols.length - 1 ) ) ]
            image[ pointer * stride + 0 ] = pxlVal
            image[ pointer * stride + 1 ] = pxlVal
            image[ pointer * stride + 2 ] = pxlVal
            pointer++
        }
        console.log( l )
    }

    // send( socket, image ) ---> Error: send EMSGSIZE 255.255.255.255:6000
    
    offset++
}

function send( socket, message ) {
    socket.send( message, udp_server_port, '255.255.255.255', err => {
        if( err ) return console.log( err )
        send(socket, message) 
    })
}

setInterval( () => fetchPosters(), 60000 )

setInterval( () => runCurrentPoster(), 1000 )

fetchPosters()