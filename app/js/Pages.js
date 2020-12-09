import icons from './../assets/icons/*.png'
import Composer from './Composer'

// ----------------------------------------------------------------
// mod-write
// ----------------------------------------------------------------

window.customElements.define( 'mod-write', class extends HTMLElement{
    connectedCallback () {
        this.textarea = this.querySelector( 'textarea' )
        this.textarea.addEventListener( 'keyup', ( e ) => {
            if ( e.target.value.match(/\S+/g).length > 5 ) e.target.value = e.target.value.split(/\s+/, 5).join( ' ' ) + ' '
        } )
        this.querySelector( 'button' ).addEventListener( 'click', () => this.storeText() )
    }

    storeText( ){
        this.dispatchEvent(  new CustomEvent( 'setData', {  'detail' : { text : this.textarea.value } } ) )
        this.dispatchEvent(  new CustomEvent( 'navigate', {  'detail' : { page : 'mod-image' } } ) )
    }
} )

// ----------------------------------------------------------------
// mod-photo
// ----------------------------------------------------------------

window.customElements.define( 'mod-photo', class extends HTMLElement{
    connectedCallback () {
        this.querySelector( '.imgSelect' ).addEventListener( 'click', () => this.selectImage() )
        this.querySelector( 'input' ).addEventListener( 'input' , ( e ) =>this.displayImage( e ) )
        this.querySelector( '.cancelBut' ).addEventListener( 'click', () => this.dispatchEvent(  new CustomEvent( 'navigate', {  'detail' : { page : 'mod-image' } } ) ) ) 
        this.querySelector( '.okBut' ).addEventListener( 'click', () => this.storeImage() )
        
        this.canvas = document.createElement( 'canvas' )
        this.canvas.width = 16
        this.canvas.height = 16
    }

    processImage( im ){
        
        var ctx = this.canvas.getContext('2d')
        var img = document.createElement('img')
        img.onload = ( e ) => {
            var ar = img.height / img.width
            var w = this.canvas.width, h = this.canvas.height
            if( ar > 1 ) h = w * ar
            else w = h / ar
            ctx.filter = 'saturate( 0 ) contrast(100%)'
            ctx.drawImage( img, -( w - this.canvas.width ) / 2, -( h - this.canvas.height ) / 2, w, h )
            var imgData = ctx.getImageData( 0, 0, this.canvas.width, this.canvas.height )
            var data = imgData.data            
            
            var numLevels = 4
            var numAreas = 256 / numLevels
            var numValues = 255 / ( numLevels - 1 )

            var rect = imgData;
            var w = rect.width;
            var h = rect.height;
            var w4 = w*4;
            var y = h;
            do {
                var offsetY = (y-1)*w4;
                var x = w;
                do {
                var offset = offsetY + (x-1)*4;

                var r = numValues * ((data[offset] / numAreas)>>0);
                var g = numValues * ((data[offset+1] / numAreas)>>0);
                var b = numValues * ((data[offset+2] / numAreas)>>0);

                if (r > 255) r = 255;
                if (g > 255) g = 255;
                if (b > 255) b = 255;

                data[offset] = r;
                data[offset+1] = g;
                data[offset+2] = b;

                } while (--x);
            } while (--y);
            
            ctx.putImageData(imgData, 0, 0)
            var imgData = ctx.getImageData( 0, 0, this.canvas.width, this.canvas.height )
        }
        img.src = im
    }

    storeImage(){
        this.dispatchEvent(  new CustomEvent( 'setData', {  'detail' : { img : this.canvas.toDataURL() } } ) )
        this.dispatchEvent(  new CustomEvent( 'navigate', {  'detail' : { page : 'mod-photo-preview' } } ) )
    }

    displayImage( e ){
        if( !e.target.files.length ) return
        var file = e.target.files[ 0 ]
        const reader = new FileReader()
        reader.addEventListener( 'load', ( ) => { 
            this.querySelector( '.preview' ).style[ 'background-image' ] = 'url( ' + reader.result + ')' 
            this.processImage( reader.result )
        }, false);
        reader.readAsDataURL( file )
        this.querySelector( '#imageViewer' ).style.display = 'block'
    }

    onEnterPage(){}

    selectImage(){
        this.querySelector( 'input' ).click()
    }
} )

// ----------------------------------------------------------------
// mod-photo-preview
// ----------------------------------------------------------------

window.customElements.define( 'mod-photo-preview', class extends HTMLElement{
    connectedCallback () {
        this.querySelector( 'canvas' ).width = window.innerWidth - 40
        this.querySelector( 'canvas' ).height = window.innerWidth - 40
        this.querySelector( '.siBut' ).addEventListener( 'click', () => this.dispatchEvent(  new CustomEvent( 'navigate', {  'detail' : { page : 'mod-submit' } } ) ) )
        this.querySelector( '.noBut' ).addEventListener( 'click', () => {
            this.dispatchEvent(  new CustomEvent( 'setData', {  'detail' : { img : null } } ) )
            this.dispatchEvent(  new CustomEvent( 'navigate', {  'detail' : { page : 'mod-submit' } } ) ) 
        })
    }

    drawImage( b64img ){
        var img = new Image()
        img.onload = () => {
            console.log( img.width )
            var c = document.createElement( 'canvas' )
            c.width = img.width
            c.height = img.height
            var ct = c.getContext( '2d' )
            ct.drawImage( img, 0, 0 )
            var data = ct.getImageData( 0, 0, c.width, c.height ).data
            var ctx = this.querySelector( 'canvas' ).getContext( '2d' )
            var rl = this.querySelector( 'canvas' ).width / 16
            var ddd = []
            data.forEach( d => ddd.push( d ) )
            for( var i = 0 ; i < ddd.length ; i += 4 ){
                var r = this.querySelector( 'canvas' ).width / 16 / 2 * ( ddd[ i ] / 255 )    
                ctx.fillStyle = 'white'
                var px = Math.floor( i / 4 / 16 )
                var py = i / 4 % 16
                ctx.beginPath()
                ctx.arc( rl / 2 + py * rl, rl / 2 + px * rl, r, 0, 2 * Math.PI )
                ctx.fill()
            }
            console.log('here')
        }
        img.src = b64img
    }

    onEnterPage( data ){
        this.drawImage( data.img )
    }
} )

// ----------------------------------------------------------------
// mod-icon
// ----------------------------------------------------------------

window.customElements.define( 'mod-icon', class extends HTMLElement{
    connectedCallback () {
        this.querySelector( '.okBut' ).addEventListener( 'click', () => this.confirmSelect() )
        
        
        Object.values( icons ).forEach( i => {
            var iconHolder =  document.createElement( 'div' )
            iconHolder.dataset.url = i
            iconHolder.addEventListener( 'click', ( e ) => this.selectIcon( e ) )
            iconHolder.classList.add( 'iconHolder' )
            iconHolder.style[ 'background-image' ] = 'url(' + i + ')'
            this.querySelector( '.inner' ).appendChild( iconHolder )
        })
    }

    selectIcon( e ){
        Object.values( this.querySelectorAll( '.iconHolder' ) ).forEach( i => i.classList.remove( 'selected' ) )
        e.target.classList.add( 'selected' )
    }

    confirmSelect(){
        var selectedIcon = this.querySelector( '.selected' )
        console.log( selectedIcon.dataset.url  )
        this.dispatchEvent(  new CustomEvent( 'setData', {  'detail' : { img : selectedIcon.dataset.url } } ) )
        this.dispatchEvent(  new CustomEvent( 'navigate', {  'detail' : { page : 'mod-submit' } } ) ) 
    }
} )

// ----------------------------------------------------------------
// mod-submit
// ----------------------------------------------------------------

window.customElements.define( 'mod-submit', class extends HTMLElement{
    connectedCallback () {
        this.querySelector( '.otherBut' ).addEventListener( 'click', () => {
            this.dispatchEvent(  new CustomEvent( 'setData', {  'detail' : { text : 'A quick brown fox', img : null } } ) )
            this.dispatchEvent(  new CustomEvent( 'navigate', {  'detail' : { page : 'mod-intro' } } ) ) 
        } )
    }

    onEnterPage( data ){
        this.composer = new Composer( data )
        // submit here
        this.composer.on( 'ready', ( c ) => {

            c.toBlob( blob => {
        //         console.log( blob )

        //         fetch('https://cors-anywhere.herokuapp.com/https://susurros.herokuapp.com/uploadppb',{ 
                fetch('http://localhost:5000/uploadppb',{ 
                    method: 'post', 
                    body: JSON.stringify( { data:'asdf'}),
                    headers: { 'Content-Type': 'application/json' }
                } )
        //         .then( response => { if( response.status == 200 ) console.log( response ) } )
        //         .then( myJson => { console.log( 'there' ) } )

            }, 'image/png')

            
        //     console.log('wut')
        })

        
    }
} )

// ----------------------------------------------------------------
// mod-preview
// ----------------------------------------------------------------

window.customElements.define( 'mod-preview', class extends HTMLElement{
    connectedCallback () {

        this.querySelector( '.okBut' ).addEventListener( 'click' , () => {
            clearInterval( this.scrollInterval )
            document.querySelector( 'mod-submit' ).classList.add( 'active' )
            this.classList.remove( 'active' )
        })
        this.width = 48
        this.height = 18
        this.canvas = document.createElement( 'canvas' )
        console.log( this.querySelector( '.inner' ).offsetWidth )
        this.canvas.width = window.innerWidth - 40
        this.canvas.height = this.canvas.width * ( this.height / this.width )
        this.ctx = this.canvas.getContext( '2d' )
        this.querySelector( '.inner' ).appendChild( this.canvas )
    }

    updateCanvas(){
        this.ctx.clearRect( 0, 0, this.canvas.width, this.canvas.height )
        var cr = this.canvas.width / this.width
        for( var i = 0 ; i < this.width ; i++ ){
            for( var j = 0 ; j < this.height ; j++ ){
                var sel = this.pxls[ ( ( i + this.offset ) % this.c.width ) + this.c.width * j ]
                var r = cr * 0.9 / 2 * ( sel / 255 )
                this.ctx.fillStyle = '#ffffff'
                this.ctx.beginPath()
                this.ctx.arc( cr / 2 + i * cr, cr / 2 + j * cr, r, 0, 2 * Math.PI )
                this.ctx.fill()
            }
        }

        this.offset++
    }

    onEnterPage( data ){
        this.composer = new Composer( data )
        this.composer.on( 'ready', ( c ) => {
            this.c = c
            var data = c.getContext( '2d' ).getImageData( 0, 0, c.width, c.height ).data
            this.pxls = []
            for( var i = 0 ; i < data.length ; i += 4 ) this.pxls.push( data[ i ] )
            this.offset = 0
            this.updateCanvas()
            this.scrollInterval = setInterval( () => this.updateCanvas(), 120 )
        })
        
    }
    
    onLeavePage(){
        
        clearInterval( this.scrollInterval )
    }
} )