class CanvasPanel1 extends HTMLDivElement {

    static get observedAttributes() {
        return ['data-canvas-uri', 'data-partof-uri', 'style'];
    }

    constructor(){
        super();
        const shadow = this.attachShadow({mode: 'open'});
        this.canvasUri = null; // the id of the canvas
        this.partOfUri = null; // a resource in which the canvas may be found, if not dereferenceable
        this.canvas = null; 
        this.partOf = null; 
    }
    
    connectedCallback() {
        console.log('connectedCallback()');
        this.readAttrs();
        this.render();
    }
    
    disconnectedCallback() {
        console.log('disconnectedCallback()');
    }
    
    adoptedCallback() {
        console.log('adoptedCallback');
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        console.log('Attribute ' + name + ' changed from ' + oldValue + ' to ' + newValue);
        this.readAttrs();
    }

    render() {
        // at this point, this.canvas is a normalised, P3 Canvas resource in memory.
        // this render is just going to draw the canvas as big as it can 
        // in the parent CP container.

    }

    readAttrs() {
        let newPartOfUri = this.getAttribute("data-partof-uri");
        if(this.partOfUri != newPartOfUri){
            this.partOfUri = newPartOfUri;
            this.partOf = await loadResource(this.partOfUri);
        }
        if(partOf == null) {
            canvas = await loadResource(this.canvasUri);
        } else {
            canvas = findCanvasIn(this.partOf);
        }
        this.render();
    }

    // set the Canvas directly as a blob of JSON
    get canvas() {
        return this.canvas;
    }
    
    set canvas(value) {
        this.canvas = value;
        this.canvasUri = value.id;
        this.partOfUri = null;
        this.partOf = null; // we could be more clever and keep this up to date, it's very likely the same
        this.render();
    } 

    // so... should this be in here at all?

    async loadResource(uri){
        res = await fetch(uri);
        asJson = await res.json();
        return asJson;
    }
}

customElements.define('canvas-panel-1', CanvasPanel1, { extends: 'div' });

