import Pages from './Pages'

class Main{
    constructor(){
        this.data = { text : 'A quick brown fox', img : null }
        Object.values( document.querySelectorAll( '.page' ) ).forEach( p => p.addEventListener( 'navigate', ( e ) => this.navigate( e.detail.page ) ) )
        Object.values( document.querySelectorAll( '.page' ) ).forEach( p => p.addEventListener( 'setData', ( e ) => this.setData( e.detail ) ) )
        Object.values( document.querySelectorAll( 'a.nav' ) ).forEach( a => a.addEventListener( 'click', ( e ) => { if( e.target.dataset.target ) this.navigate( e.target.dataset.target ) } ) )
        // this.navigate( 'mod-photo' )
        
        document.querySelector( '#menuBut' ).addEventListener( 'click', () => {
            if( this.currentPage == 'mod-menu' ) this.navigate( this.prevPage )
            else this.navigate( 'mod-menu' )
        } )

        this.currentPage = document.querySelector( '.page.active' ).nodeName.toLowerCase()
        this.prevPage = null
    }

    navigate( page ){
        Object.values( document.querySelectorAll( '.page' ) ).forEach( p => p.classList.remove( 'active' ) )
        document.querySelector( page ).classList.add( 'active' )
        this.prevPage = this.currentPage
        this.currentPage = page
        if( document.querySelector( page ).onEnterPage ) document.querySelector( page ).onEnterPage( this.data )
        if( this.prevPage && document.querySelector( this.prevPage ).onLeavePage ) document.querySelector( this.prevPage ).onLeavePage( this.data )
    }

    setData( detail ){
        Object.assign( this.data, detail )
    }
}

new Main()