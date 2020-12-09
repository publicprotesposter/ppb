import EventEmitter from 'events'
import font from './../assets/pixelar.otf'

class Composer extends EventEmitter{
    constructor( data = { text : null, img : null } ){
        super()

        this.data = {}

        this.data.text = data.text || 'SOMETHING WENT WRONG...'
        this.data.img = data.img

        this.node = document.querySelector( '#composer' )
        this.font = new FontFace( 'pixelar', 'url(' + font + ')' );
        this.font.load().then(() => this.init() )
    }

    init(){
        document.fonts.add( this.font )
        
        var testBox, type

        if( this.data.text.split( ' ' ).length < 3 ) {
            testBox = document.createElement( 'span' )
            testBox.style['font-family'] = this.font
            testBox.innerHTML = this.data.text.toUpperCase()
            testBox.style.fontSize = '14px'
            type = 'large'
        } else {
            this.node.style.width = '48px'
            testBox = document.createElement( 'div' )
            testBox.innerHTML = this.data.text.toUpperCase()
            testBox.style['font-family'] = this.font
            testBox.style.fontSize = '7px'
            this.node.appendChild( testBox )
            while( testBox.offsetHeight > 18 ) testBox.style.width = testBox.offsetWidth + 1 + 'px'
            while( testBox.offsetHeight < 18 ) testBox.style.width = testBox.offsetWidth - 1 + 'px'
            testBox.style.width = testBox.offsetWidth + 1 + 'px'
            type = 'small'
        }

        this.node.appendChild( testBox )
        
        var fontsize, lines
        if( type == 'large' ){
            fontsize = 14
            lines = [ testBox.innerHTML ]
        }

        if( type == 'small' ){
            var words = testBox.innerHTML.split( ' ' )
            var c = testBox.cloneNode( true )
            
            c.innerHTML = ''
            this.node.appendChild( c )
            lines = [ '' , '' ]
            words.forEach( w => {
                var s = document.createElement( 'span' )
                s.innerHTML = w + ' '
                c.appendChild( s )
                if( s.getBoundingClientRect().top - c.getBoundingClientRect().top < 4 ) lines[ 0 ] += w + ' '
                else lines[ 1 ] += w + ' '
            } )
            fontsize = 7
            this.node.style.width = 'auto'
        }
        
        // return
        var scale = 10
        this.canvas = document.createElement( 'canvas' )
        if( type == 'small' ) this.canvas.width = ( c.offsetWidth * 2 + 2 ) * scale
        else this.canvas.width = ( testBox.offsetWidth * 2 + 2 ) * scale
        if( this.data.img ) this.canvas.width += ( 18 ) * scale
        this.canvas.height = ( 18 ) * scale
        this.canvas.style.width = ( this.canvas.width / ( scale / 2 ) ) + 'px'
        this.canvas.style.height = ( this.canvas.height / ( scale / 2 ) ) + 'px'
        // this.node.appendChild( this.canvas )
        var ctx = this.canvas.getContext( '2d' )
        
        this.canvas.style.webkitFontSmoothing = 'grayscale'
        
        ctx.fillStyle = '#000000'
        ctx.fillRect( 0, 0, this.canvas.width, this.canvas.height)

        ctx.fillStyle = 'white'
        ctx.imageSmoothingEnabled= false
        ctx.textBaseline = 'top'
        ctx.font = fontsize * scale * 2 + 'px pixelar'
        lines.forEach( ( l, i ) => {
            if( type == 'small' ) ctx.fillText( l, 1 * scale, ( i * ( fontsize + 2 ) - 2.5 ) * scale ) 
            else ctx.fillText( l, 2 * scale, -5 * scale )
        })
        
        if( this.data.img ){
            var i = new Image()
            i.onload = () => { 
                ctx.drawImage( i, this.canvas.width - 17 * scale, 1 * scale, i.width * scale, i.height * scale ) 
                this.donwRes( scale )
                this.downloadImg( )
            }
            i.src = this.data.img

        } else {
            this.donwRes( scale )
            this.downloadImg( )
        }
        if( c ) c.remove()
        testBox.remove()
    }

    donwRes( scale ){
        this.canvas2 = document.createElement( 'canvas' )
        this.canvas2.width = this.canvas.width / scale
        this.canvas2.height = this.canvas.height / scale
        var ctx2 = this.canvas2.getContext( '2d' )
        // this.node.appendChild( this.canvas2 )
        ctx2.fillRect( 0, 0, this.canvas2.width, this.canvas2.height )
        ctx2.drawImage( this.canvas, 0, 0, this.canvas2.width, this.canvas2.height )
    }

    downloadImg( ){
        this.emit( 'ready', this.canvas2 )
    }
}

export { Composer as default }