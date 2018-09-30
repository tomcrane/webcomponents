export function getThumbnail(resource, options){
    // Trivial implementation for discussion purposes; useless in real world.
    // just here to demonstrate what a helper library does.
    // see https://github.com/tomcrane/iiif-expts/blob/gh-pages/getthumbnail/iiif.js#L159
    // and http://tomcrane.github.io/iiif-expts/getthumbnail/
    // options is ignored, and we assume that resource has a thumbnail property
    // and that it is an image, and we just return its id.
    return resource.thumbnail[0].id;
}


export function getString(langMap, preflang){
    // Noddy impl, ignores args preflang (a list, probably)
    if(typeof langMap === 'string') return langMap; // not valid, but...
    let anyValue = null;
    for(let lang in langMap){
        anyValue = langMap[lang][0];
        break;
    }
    return anyValue;
}