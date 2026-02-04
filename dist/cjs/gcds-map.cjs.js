'use strict';

var ContextMenu = require('./index-CvEoZNXZ.js');
var appGlobals = require('./app-globals-BetXQdEf.js');

var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
/*
 Stencil Client Patch Browser v4.38.2 | MIT Licensed | https://stenciljs.com
 */

var patchBrowser = () => {
  {
    patchCloneNodeFix(ContextMenu.H.prototype);
  }
  const importMeta = (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === 'SCRIPT' && _documentCurrentScript.src || new URL('gcds-map.cjs.js', document.baseURI).href));
  const opts = {};
  if (importMeta !== "") {
    opts.resourcesUrl = new URL(".", importMeta).href;
  }
  return ContextMenu.promiseResolve(opts);
};
var patchCloneNodeFix = (HTMLElementPrototype) => {
  const nativeCloneNodeFn = HTMLElementPrototype.cloneNode;
  HTMLElementPrototype.cloneNode = function(deep) {
    if (this.nodeName === "TEMPLATE") {
      return nativeCloneNodeFn.call(this, deep);
    }
    const clonedNode = nativeCloneNodeFn.call(this, false);
    const srcChildNodes = this.childNodes;
    if (deep) {
      for (let i = 0; i < srcChildNodes.length; i++) {
        if (srcChildNodes[i].nodeType !== 2) {
          clonedNode.appendChild(srcChildNodes[i].cloneNode(true));
        }
      }
    }
    return clonedNode;
  };
};

patchBrowser().then(async (options) => {
  await appGlobals.globalScripts();
  return ContextMenu.bootstrapLazy([["gcds-map_2.cjs",[[257,"gcds-map",{"lat":[1026],"lon":[1026],"zoom":[1026],"projection":[1025],"controls":[516],"static":[516],"_controlslist":[513,"controlslist"],"locale":[1032],"whenProjectionDefined":[64],"whenReady":[64],"whenLayersReady":[64]},null,{"controls":["controlsChanged"],"_controlslist":["controlsListChanged"],"projection":["projectionChanged"],"static":["staticChanged"]}],[257,"map-layer",{"src":[1537],"checked":[1540],"hidden":[1540],"opacity":[1026],"_opacity":[1026],"media":[1537],"whenReady":[64],"whenElemsReady":[64]},null,{"src":["srcChanged"],"checked":["checkedChanged"],"_opacity":["opacityChanged"],"media":["mediaChanged"],"hidden":["hiddenChanged"]}]]],["map-a.cjs",[[0,"map-a",{"href":[513],"target":[513],"type":[513],"inplace":[516]}]]],["map-caption.cjs",[[256,"map-caption"]]],["map-extent.cjs",[[257,"map-extent",{"checked":[1540],"_label":[1025],"opacity":[1026],"_opacity":[1026],"hidden":[1540],"units":[513],"disabled":[1540],"whenReady":[64],"whenLinksReady":[64]},null,{"units":["unitsChanged"],"_label":["labelChanged"],"checked":["checkedChanged"],"_opacity":["opacityChanged"],"hidden":["hiddenChanged"]}]]],["map-feature.cjs",[[257,"map-feature",{"zoom":[1026],"min":[1538],"max":[1538],"whenReady":[64]},null,{"zoom":["zoomChanged"],"min":["minChanged"],"max":["maxChanged"]}]]],["map-featurecaption.cjs",[[256,"map-featurecaption"]]],["map-geometry.cjs",[[260,"map-geometry",{"cs":[1537]},null,{"cs":["csChanged"]}]]],["map-input.cjs",[[256,"map-input",{"name":[513],"type":[513],"value":[1537],"axis":[513],"units":[513],"position":[513],"rel":[513],"min":[513],"max":[513],"step":[513],"whenReady":[64]}]]],["map-link.cjs",[[257,"map-link",{"type":[513],"rel":[513],"href":[513],"hreflang":[513],"tref":[513],"media":[513],"tms":[516],"projection":[513],"disabled":[1540],"whenReady":[64]},null,{"type":["typeChanged"],"rel":["relChanged"],"href":["hrefChanged"],"hreflang":["hreflangChanged"],"tref":["trefChanged"],"media":["mediaChanged"],"tms":["tmsChanged"],"projection":["projectionChanged"],"disabled":["disabledChanged"]}]]],["map-meta.cjs",[[256,"map-meta",{"name":[513],"content":[513]},null,{"name":["nameChanged"],"content":["contentChanged"]}]]],["map-properties.cjs",[[257,"map-properties"]]],["map-select.cjs",[[256,"map-select",{"name":[513],"whenReady":[64]},null,{"name":["nameChanged"]}]]],["map-span.cjs",[[0,"map-span"]]],["map-style.cjs",[[0,"map-style",{"media":[513]},null,{"media":["mediaChanged"]}]]],["map-tile.cjs",[[256,"map-tile",{"row":[514],"col":[514],"zoom":[514],"src":[513],"zoomTo":[64]},null,{"src":["srcChanged"]}]]]], options);
});

exports.setNonce = ContextMenu.setNonce;
//# sourceMappingURL=gcds-map.cjs.js.map
