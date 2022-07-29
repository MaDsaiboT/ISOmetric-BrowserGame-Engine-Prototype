import ui               from './UI/ui.js'
import * as utils_math  from './_utils/math.js';

class map {

  constructor (ctxMap, ctxMapBuffer, tileHeight, tileWidth, name = 'map001') {
    this.ctxMap       = ctxMap;
    this.ctxMapBuffer = ctxMapBuffer;
    this.tileHeight   = tileHeight;
    this.tileWidth    = tileWidth;
    this.name         = name;
    this.mapData      = null;
    this.mapDataKeys  = null;
    this.drawSides    = true;

    this.drawRuler = false;

    //console.log(ctxMapBuffer.canvas.height);
  }

  normaliseMapData(jsondata) {
    let maxLen = 0;
    let normalized = {};
    for (let [key,col] of Object.entries(jsondata)) {
      for (let row of col) {
        maxLen = Math.max(maxLen, row.length);
      }
    }
    //console.log('maxLen',maxLen);
    for (let [key,col] of Object.entries(jsondata)) {
      normalized[key] = [];
      for (let row of col) {
        while (row.length < maxLen) row.push(0);
        normalized[key].push(row);
      }
    }

    //console.log(normalized)
    return normalized;
  }

  /**
   * loads a map in json format 
   *
   * @param      {String}   [name=null]  The name
   * @return     {Promise}  
   */
  async load(name=null) {
    if (name) this.name = name;
    await fetch(`./json/tileMaps/${this.name}.json`)
    .then( response => response.json() )
    .then( jsondata => this.normaliseMapData(jsondata) )
    .then( jsondata => {
      this.mapData     = jsondata;
      this.mapDataKeys = Object.keys(jsondata).reverse()
      ui.jasonMapData.textContent = JSON.stringify(jsondata);
      return true
    } )
    .then( _ => this.clear() )
    .then( _ => this.drawGrid() )
    .then( _ => this.draw()  )
    .then( _ => {
    
       } 
   
      //this.drawCaracter(1,2),
      //this.drawCaracter(1,2),
     )
    ;
  }

  /**
   * Clears the object.
   */

  clear(_ctx){
    const ctx = _ctx ?? this.ctxMapBuffer;

    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    ctx.clearRect(
     -(w/2),
     -200,
      w,h
    );
  }


  /**
   * { function_description }
   *
   * @return     {Promise}  { description_of_the_return_value }
   */
  async draw() {
    if (!this.mapData) return 'no Map data';
  
    let data = this.mapData;

    //data = this.getHightMap();

    const colors = {
      0 : 'rgba(0,0,0,0)',
      1 : 'green',
      2 : 'blue'
    }

    let xInit      = 0;
    let x          = xInit;
    let yInit      = 0;
    let y          = yInit;
    let z          = 0.5;

    const ctx = this.ctxMapBuffer;

    const w = ctx.canvas.width;
    const h = ctx.canvas.height;


    if (this.drawRuler ){
      ctx.save();
      ctx.setTransform(1,0,0,1,0,0);

      ctx.strokeStyle = "#00ff00";

      ctx.lineWidth = 6;
      ctx.strokeRect(3,3,w-6,h-6);

      ctx.beginPath();
      ctx.moveTo(w/2, 0);
      ctx.lineTo(w/2, h);
      ctx.closePath();
      ctx.stroke();

      ctx.restore();
    }

    for (const [layerIndex,name] of Object.entries(this.mapDataKeys)) {
      //console.log(layerIndex,name);
      const layer = this.mapData[name];
      y = yInit;
      for (let row of layer) {
        x = xInit;
        for (let tile of row) {
          const color = colors[tile];
          if (tile >= 1 ) this.drawBlock(x,y,layerIndex,tile);
          //if (tile >= 1 ) this.drawBlockImage(x,y,0.5,tile);
          //if (tile >= 1 ) this.drawTile(x,y,0.5,tile);
          x += 1;
        }
        y += 1;
      }
      //break;
      z += 0.5;
    }

    return {ok:true}
  }

  /**
   * Draws a grid.
   *
   * @return     {Promise}  { description_of_the_return_value }
   */

  async drawGrid() {
    var gridOptions = {
        color: '#f2f2f2',
        GridSize: 15,
        LinesSize: 1
    };
    var ctx, canvas;
   
    ctx = this.ctxMapBuffer;
    var height = ctx.canvas.height;
    var width  = ctx.canvas.width;
   
    let xOffset = 0;
    let yOffset = 1;
    while(yOffset*this.tileWidth < width - 200){
      xOffset = 0
      while(xOffset*this.tileHeight < height - 200){
        //console.log({xOffset,yOffset})
        this.drawTile(xOffset,yOffset);
        xOffset +=1
      }
      yOffset +=1
    }



    // ctx.lineWidth = 1;

    // let rad = utils_math.degsToRads(26.585);
    // console.log({rad})
    // let z = 0.5;

    // ctx.beginPath();

    // ctx.moveTo(0,-(z * this.tileHeight));
    // ctx.lineTo(
    //    this.tileWidth  / 2,
    //    this.tileHeight / 2 - z * this.tileHeight
    // );
    // ctx.lineWidth = 1;
    // ctx.strokeStyle = '#ff0000'
    // ctx.stroke();

    // ctx.closePath();

   
    // ctx.beginPath();
    // ctx.moveTo(0,-z * this.tileHeight);
    // let x, y
    // let len = (Width/2 - 10) *
    // (Math.sin(utils_math.degsToRads(90))/
    //   Math.sin(utils_math.degsToRads(63.415)))
    // x = len * Math.cos(rad);
    // y = len * Math.sin(rad) -z * this.tileHeight;
    // console.log('draw angle',{x,y});


    // ctx.lineTo(-x,y);

    // ctx.lineWidth = 1;
    // ctx.strokeStyle = '#aaaaaa'
    // ctx.stroke();

    // ctx.closePath();


    // return

    // GridSize = 0;
    // GridSize = parseInt(gridOptions.GridSize);

    // for (i = 0; i < Height; i += GridSize) {
    //     ctx.moveTo(0, i);
    //     ctx.lineTo(Width, i);
    //     ctx.stroke();
    // }
    // for (i = 0; i < Width; i += GridSize) {
    //     ctx.moveTo(i, 0);
    //     ctx.lineTo(i, Height);
    //     ctx.stroke();
    // }


    return true
  }

  getTileData(x,y,z = null) {
    
  }

  /**
   * Gets the highest layer.
   *
   * @param      {int}  x map coordinate 
   * @param      {int}  y map coordinate 
   * @return     {int}  The highest layer. (min 0)
   */

  getHighestLayer(x,y){
    let ret = -1
    if (this.mapDataKeys === null) return; 
    //if (this.mapData) return -1;
    
    for (let [index,layerName] of Object.entries(this.mapDataKeys).reverse() ) {
      index = Number(index);
      if (this.mapData?.[layerName]?.[y]?.[x] > 0) return index;
    }

    return ret;
  }

  getNeighbors(x,y){

  }

  /**
   * { function_description }
   *
   * @param      {int}  x           map coordinate 
   * @param      {int}  y           map coordinate 
   * @param      {int}  layerIndex  The layer index
   * @return     {boolean}
   */
  tileHasNeighborLeft(x,y,layerIndex) {
    if (!this.mapData ) return false;
    const layerName = this.mapDataKeys[layerIndex];
    if ( this.mapData?.[layerName]?.[y+1]?.[x] > 0  ) return true;
    return false;
  }

  /**
   * { function_description }
   *
   * @param      {int}  x           map coordinate 
   * @param      {int}  y           map coordinate 
   * @param      {int}  layerIndex  The layer index
   * @return     {boolean}
   */
  tileHasNeighborRight(x,y,layerIndex) {
    if (!this.mapData ) return false;
    const layerName = this.mapDataKeys[layerIndex];
    if ( this.mapData?.[layerName]?.[y]?.[x+1] > 0 ) return true;
    return false;
  }

  /**
   * Draws a tile.
   *
   * @param      {number}  x                            { parameter_description }
   * @param      {number}  y                            { parameter_description }
   * @param      {<type>}  color                        The color
   * @param      {<type>}  [context=this.ctxMapBuffer]  The context
   */
  drawTile(x,y,color,context = this.ctxMapBuffer) {
    context = this.ctxMapBuffer;

    context.save();

    //console.log('drawTile',x,y,color);

    context.fillStyle = 'rgba(90,250,99,0.5)';

    context.translate(
      (x - y) * this.tileWidth  / 2 + this.tileWidth / 2,
      (x + y) * this.tileHeight / 2
    );

    const z = 0.5;

    context.beginPath();
    context.moveTo(0,-z * this.tileHeight);
    context.lineTo(
       this.tileWidth  / 2,
       this.tileHeight / 2 - z * this.tileHeight
    );
    context.lineTo(
      0,
      this.tileHeight -z * this.tileHeight
    );
    context.lineTo(
      -this.tileWidth  / 2,
       this.tileHeight / 2 - z * this.tileHeight
    );
    context.closePath();
    //context.fillStyle = 'rgba(90,200,99,0.1)';
    //context.stroke();
    context.strokeStyle = 'rgba(20,20,20,0.5)';
    context.stroke();
    context.restore();
  }

  drawBlock(x,y,layerIndex,type) {
    layerIndex = Number(layerIndex);
    //console.log('drawBlock',layerIndex,x,y);
    const context = this.ctxMapBuffer;

    let hue = Math.random()*360;
    let sat = 60;
    let lig = 90;
    let alpha = 0.9;

    context.save();

    switch(type){
      case 1:
        hue = 0;
        sat = 70;
        break;
      case 2:
        hue = 240;
        sat = 60;
        break;
      case 3:
        hue = 120;
        sat = 60;
        break;
    }

    const z = 0.5;


    if (layerIndex > 1) {
      //context.globalCompositeOperation = 'lighter';
    }

    //sat = 0;

    context.translate(
      (x - y) * this.tileWidth  / 2 ,
      (x + y) * this.tileHeight / 2
    );

    if (layerIndex >= 1) {
      context.translate(
       -( (0.5*layerIndex) - (0.5*layerIndex)) * this.tileWidth / 2,
       -( (0.5*layerIndex) + (0.5*layerIndex)) * this.tileHeight / 2
      );
    }

    context.strokeStyle = '#222222';

    //draw top
    context.beginPath();
    context.moveTo(0,-z * this.tileHeight);
    context.lineTo(
       this.tileWidth  / 2,
       this.tileHeight / 2 - z * this.tileHeight
    );
    context.lineTo(
      0,
      this.tileHeight -z * this.tileHeight
    );
    context.lineTo(
      -this.tileWidth  / 2,
       this.tileHeight / 2 - z * this.tileHeight
    );
    context.closePath();

    context.fillStyle = `HSLA(${hue}, ${sat}%, ${lig}%, ${alpha} )`;
    context.stroke();
    context.fill();

    if (this.drawSides) {
      let alpha = 0.5;


      if (!this.tileHasNeighborLeft(x,y,layerIndex)) {
        // draw left
        lig = 70;
        context.beginPath();
        context.moveTo(-this.tileWidth / 2, this.tileHeight / 2 - z * this.tileHeight);
        context.lineTo(0, this.tileHeight - z * this.tileHeight);
        context.lineTo(0, this.tileHeight);
        context.lineTo(-this.tileWidth / 2, this.tileHeight / 2);
        context.closePath();

        context.fillStyle = `HSLA(${hue}, ${sat}%, ${lig}%, ${alpha} )`;
        context.stroke()
        context.fill();
      }
   
      if (!this.tileHasNeighborRight(x,y,layerIndex) ) {
        // draw right
        lig = 60;
        sat -= 10;
        context.beginPath();
        context.moveTo(this.tileWidth / 2, this.tileHeight / 2 - z * this.tileHeight);
        context.lineTo(0, this.tileHeight - z * this.tileHeight);
        context.lineTo(0, this.tileHeight);
        context.lineTo(this.tileWidth / 2, this.tileHeight / 2);
        context.closePath();

        context.fillStyle = `HSLA(${hue}, ${sat}%, ${lig}%, ${alpha} )`;
        context.stroke();
        context.fill();
      }
    }
    lig = 60;

    context.fillStyle = `HSLA(${hue}, ${sat}%, ${lig}%)`;

    context.fillRect(-3,-3,6,6);

    context.restore();
  }

  drawCaracter(x,y,layerIndex,_ctx, Offset = {x:0,y:0}){
    layerIndex = Number(layerIndex|0);
    //console.log('drawBlock',layerIndex,x,y);
    const context = _ctx ?? this.ctxMapBuffer;

    let hue = 60;
    let sat = 60;
    let lig = 90;
    let alpha = 0.9;

    context.save();

    const z = 1.1;

    if (layerIndex > 1) {
      //context.globalCompositeOperation = 'lighter';
    }

    context.translate(
        (x - y) * this.tileWidth  / 2 ,
      ( (x + y) * this.tileHeight / 2 ) - 0.25 * this.tileHeight
    );

    context.translate(
      -Offset.x,
      -Offset.y
    )

    if (context !== this.ctxMapBuffer) {

    }

    if (layerIndex >= 1) {
      context.translate(
       -( (0.5*layerIndex) - (0.5*layerIndex)) * this.tileWidth / 2,
       -( (0.5*layerIndex) + (0.5*layerIndex)) * this.tileHeight / 2
      );
    }

    context.strokeStyle = '#222222';

    //draw top
    context.beginPath();
    context.moveTo(0,-z * this.tileHeight/2);
    context.lineTo(
       this.tileWidth  / 4,
       this.tileHeight / 4 - z * this.tileHeight /2
    );
    context.lineTo(
      0,
      this.tileHeight /2 -z * this.tileHeight /2
    );
    context.lineTo(
      -this.tileWidth  / 4,
       this.tileHeight / 4 - z * this.tileHeight /2
    );
    context.closePath();

    context.fillStyle = `HSLA(${hue}, ${sat}%, ${lig}%, ${alpha} )`;
    context.stroke();
    context.fill();

    alpha = 0.5;

    // draw left
    lig = 70;
    context.beginPath();
    context.moveTo(-this.tileWidth / 4, this.tileHeight / 4 - z * this.tileHeight /2);
    context.lineTo(0, this.tileHeight /2 - z * this.tileHeight/2);
    context.lineTo(0, this.tileHeight / 2 );
    context.lineTo(-this.tileWidth / 4, this.tileHeight / 4);
    context.closePath();

    context.fillStyle = `HSLA(${hue}, ${sat}%, ${lig}%, ${alpha} )`;
    context.stroke()
    context.fill();
  
    // draw right
    lig  = 60;
    sat -= 10;
    context.beginPath();
    context.moveTo(this.tileWidth / 4, this.tileHeight / 4 - z * this.tileHeight /2);
    context.lineTo(0, this.tileHeight/2 - z * this.tileHeight/2);
    context.lineTo(0, this.tileHeight/2);
    context.lineTo(this.tileWidth / 4, this.tileHeight / 4);
    context.closePath();

    context.fillStyle = `HSLA(${hue}, ${sat}%, ${lig}%, ${alpha} )`;
    context.stroke();
    context.fill();
 
    lig = 60;

    context.fillStyle = `HSLA(${hue}, ${sat}%, ${lig}%)`;

    context.restore();
  }

  drawBlockImage(x,y,z) {

    const context = this.ctxMapBuffer;

    const image = tile128X128

    context.save();
    context.translate(
      (x - y) * this.tileWidth  / 2,
      (x + y) * this.tileHeight / 2
    );

    context.drawImage(image, -image.width / 2, -image.height/2);

    //context.fillRect(-3,-3,6,6);

    context.restore();
  }

  getData() {

  }
}

export default map;