class CanvasPanel1 extends HTMLDivElement {

    static get observedAttributes() {
        return ['data-canvas-uri', 'data-partof-uri', 'style'];
    }

    constructor(){
        super();
        console.log("CP1 constructor");
        this.initialised = false;
        this.shadow = this.attachShadow({mode: 'open'});
        this.canvasUri = null; // the id of the canvas
        this.partOfUri = null; // a resource in which the canvas may be found, if not dereferenceable
        this.canvasObj = null; 
        this.partOf = null; 
    }
    
    connectedCallback() {
        console.log('connectedCallback()');
        this.readAttrs();
    }
    
    disconnectedCallback() {
        console.log('disconnectedCallback()');
    }
    
    adoptedCallback() {
        console.log('adoptedCallback');
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if(this.initialised){
            console.log('Attribute ' + name + ' changed from ' + oldValue + ' to ' + newValue);
            this.readAttrs();
        }
    }

    render() {
        // clear out...
        while (this.shadow.firstChild) {
            this.shadow.removeChild(this.shadow.firstChild);
        }
        // Create some CSS to apply to the shadow dom
        const style = document.createElement('style');
        style.textContent = `
        #wrapper {
            width:100%;
            height:100%;
            display:flex;
            justify-content: center;
            align-items: center;
        }
        .canvas {
            padding:0;
            margin:0;
            border:1px solid red;
        }

        img {
            border:0;
        }
        `;
        this.shadow.appendChild(style);
        // At this point, this.canvasObj is a normalised, P3 Canvas resource in memory.
        // this render is just going to draw the canvas as big as it can 
        // in the parent CP container. We'll make lots of assumptions about what this
        // canvas is that a real CP couldn't make.
        
        // cp component itself is the viewport; we need to draw the canvas in it.
        // The viewport management of real CP is far more sophisticated than this
        const wrapper = document.createElement("div");
        wrapper.setAttribute('id', 'wrapper');
        this.shadow.appendChild(wrapper);
        const canvasDiv = document.createElement("div");        
        canvasDiv.setAttribute('class', 'canvas');
        const imgTag = document.createElement("img");    
        imgTag.setAttribute('class', 'painting');

        // Real CP would not do this! It has no idea what's on the canvas!
        let imgResource = this.canvasObj.items[0].items[0].body;
        imgTag.setAttribute("src", imgResource.id);
        // Also not dealing with any segments/regions:
        let computedStyle = window.getComputedStyle(this);
        let viewportToFit = {
            width: parseInt(computedStyle.width) - 2,
            height: parseInt(computedStyle.height) - 2
        } // allow for the red border we added, 1+1
        console.log("must fit inside " + viewportToFit.width + " x " + viewportToFit.height);
        let canvasSize = confine(viewportToFit, this.canvasObj);
        setWidthHeightStyle(canvasDiv, canvasSize);
        // in our very simple case this is also our image size
        setWidthHeightStyle(imgTag, canvasSize);
        // paint the image onto the canvas, simplistically
        canvasDiv.appendChild(imgTag);
        // put the canvas in the viewport
        wrapper.appendChild(canvasDiv);
    }

    async readAttrs() {
        let newPartOfUri = this.getAttribute("data-partof-uri");
        this.canvasUri = this.getAttribute("data-canvas-uri");
        if(this.partOfUri != newPartOfUri){
            this.partOfUri = newPartOfUri;
            this.partOf = await this.loadResource(this.partOfUri);
        }
        if(this.partOf == null) {
            this.canvasObj = await this.loadResource(this.canvasUri);
        } else {
            this.canvasObj = this.partOf.items.find(c => c.id == this.canvasUri);
        }
        this.render();
        this.initialised = true;
    }

    // set the Canvas directly as a blob of JSON
    get canvas() {
        return this.canvasObj;
    }
    
    set canvas(value) {
        this.canvasObj = value;
        this.canvasUri = value.id;
        this.partOfUri = null;
        this.partOf = null; // we could be more clever and keep this up to date, it's very likely the same
        this.render();
    } 

    // so... should this be in here at all? 
    // Or does any fetching of resources take place externally...
    // but then, how does the consumer of CP follow links to more stuff?
    // notify the consumer that there is more stuff, let them load it, then give it back?
    async loadResource(uri){
        let res = await fetch(uri);
        let asJson = await res.json();
        return asJson;
    }

}

customElements.define('canvas-panel-1', CanvasPanel1, { extends: 'div' });

function confine(requiredSize, sourceSize)
{
    if (sourceSize.width <= requiredSize.width && sourceSize.height <= requiredSize.height)
    {
        return sourceSize;
    }
    let scaleW = requiredSize.width / sourceSize.width;
    let scaleH = requiredSize.height / sourceSize.height;
    let scale = Math.min(scaleW, scaleH);
    return {
        width: Math.round((sourceSize.width * scale)),
        height: Math.round((sourceSize.height * scale))
    };
}

function setWidthHeightStyle(element, size){
    element.style.width = size.width + "px";
    element.style.height = size.height + "px";
}
