import ui from "./UI/ui.js";
import * as utils_math from "./_utils/math.js";

class map {
  static instance = null;

  constructor(ctxMap, ctxMapBuffer, tileHeight, tileWidth, name = "map001") {
    if (map.instance !== null) return map.instance;

    this.ctxMap = ctxMap;
    this.ctxMapBuffer = ctxMapBuffer;
    this.tileHeight = tileHeight;
    this.tileWidth = tileWidth;
    this.name = name;
    this.mapData = null;
    this.mapDataKeys = null;
    this.drawSides = true;

    this.drawRuler = false;

    this.highestLayerChache = new Map();

    map.instance = this;
    //console.log(ctxMapBuffer.canvas.height);
  }

  normaliseMapData(jsondata) {
    let maxLen = 0;
    let normalized = {};
    for (let [key, col] of Object.entries(jsondata)) {
      for (let row of col) maxLen = Math.max(maxLen, row.length);
    }
    if (maxLen % 2 !== 0) maxLen++;

    //console.log('maxLen',maxLen);
    for (let [key, col] of Object.entries(jsondata)) {
      normalized[key] = [];
      for (let row of col) {
        while (row.length < maxLen) row.push(0);
        normalized[key].push(row);
      }
      while (normalized[key].length < maxLen) {
        let row = [];
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
  async load(name = null) {
    if (name) this.name = name;
    await fetch(`/json/tileMaps/${this.name}.json`)
      .then((response) => response.json())
      .then((jsondata) => this.normaliseMapData(jsondata))
      .then((jsondata) => {
        this.mapData = jsondata;
        this.mapDataKeys = Object.keys(jsondata).reverse();
        //this.rotate();
        ui.jasonMapData.textContent = JSON.stringify(jsondata);
        return true;
      })
      //.then( _ => this.drawGrid() )
      //.then( _ => this.rotate() )
      .then((_) => this.clear())
      .then((_) => this.draw())
      .then((_) => {});
  }

  /**
   * clears canvas.
   */
  clear(_ctx) {
    const ctx = _ctx ?? this.ctxMapBuffer;

    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    ctx.clearRect(-(w / 2), -200, w, h);
  }

  rotate(){
    const key0 = this.mapDataKeys[0];
    const n = this.mapData[key0].length;
    let i,j,temp;
    this.mapDataKeys.forEach(layer => {
      console.log(`rotate layer ${layer}`)

      //Step 1 transpose matrix (trurn rows to columns) 
      for(i=0; i<n; i++) {
        for(j=i; j<n; j++){
          //do the swap
          if (this.mapData[layer][i][j] === this.mapData[layer][j][i]) continue
          console.log('swap',i,j,this.mapData[layer][i][j],this.mapData[layer][j][i]);
          temp = this.mapData[layer][i][j];
          this.mapData[layer][i][j] = this.mapData[layer][j][i];
          this.mapData[layer][j][i] = temp;
          console.log('swap',i,j,this.mapData[layer][i][j],this.mapData[layer][j][i]);
          temp = null;
        }
      }

      //Step 2 reverse the rows
      for (i = 0; i < n; i++) {
        for (j = 0; j < n / 2; j++) {
          const temp = this.mapData[layer][i][j];
          this.mapData[layer][i][j] = this.mapData[layer][i][n - 1 - j];
          this.mapData[layer][i][n - 1 - j] = temp;
        }
      }
    });
  }

  /**
   * { function_description }
   *
   * @return     {Promise}  { description_of_the_return_value }
   */
  async draw() {
    if (!this.mapData) return "no Map data";

    let data = this.mapData;

    //data = this.getHightMap();

    const colors = {
      0: "rgba(0,0,0,0)",
      1: "green",
      2: "blue",
    };

    let xInit = 0;
    let x = xInit;
    let yInit = 0;
    let y = yInit;
    let z = 0.5;

    const ctx = this.ctxMapBuffer;

    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    if (this.drawRuler) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      ctx.strokeStyle = "#00ff00";

      ctx.lineWidth = 6;
      ctx.strokeRect(3, 3, w - 6, h - 6);

      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w / 2, h);
      ctx.closePath();
      ctx.stroke();

      ctx.restore();
    }

    for (const [layerIndex, name] of Object.entries(this.mapDataKeys)) {
      //console.log(layerIndex,name);
      const layer = this.mapData[name];
      console.log(`draw layer ${name}`);
      y = yInit;
      for (let row of layer) {
        x = xInit;
        for (let tile of row) {
          const color = colors[tile];
          if (tile >= 1) this.drawBlock(x, y, layerIndex, tile);
          //if (tile >= 1 ) this.drawBlockImage(x,y,0.5,tile);
          //if (tile >= 1 ) this.drawTile(x,y,0.5,tile);
          x += 1;
        }
        y += 1;
      }
      //break;
      z += 0.5;
    }

    return { ok: true };
  }

  /**
   * Draws a grid.
   *
   * @return     {Promise}  { description_of_the_return_value }
   */

  async drawGrid() {
    var gridOptions = {
      color: "#f2f2f2",
      GridSize: 15,
      LinesSize: 1,
    };
    var ctx, canvas;

    ctx = this.ctxMapBuffer;
    var height = ctx.canvas.height;
    var width = ctx.canvas.width;

    let xOffset = 0;
    let yOffset = 1;
    while (yOffset * this.tileWidth < width - 200) {
      xOffset = 0;
      while (xOffset * this.tileHeight < height - 200) {
        //console.log({xOffset,yOffset})
        this.drawTile(xOffset, yOffset);
        xOffset += 1;
      }
      yOffset += 1;
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

    return true;
  }

  getTileData(x, y, z = null) {}

  /**
   * Gets the highest layer.
   *
   * @param      {int}  x map coordinate
   * @param      {int}  y map coordinate
   * @return     {int}  The highest layer. (min 0)
   */
  getHighestLayer(pos) {
    const {x, y} = pos;
    let ret = -1;
    const key = JSON.stringify({x,y});

    if (this.mapDataKeys === null) return ret;
    if (this.highestLayerChache.has(key)) {
      const layer = this.highestLayerChache.get(key);
      //console.log({x,y}, layer);
      return layer;
    }
    const reversedKeys = Object.entries(this.mapDataKeys).reverse();
    let index, layerName;
    for ([index, layerName] of reversedKeys) {
      if (this.mapData?.[layerName]?.[y]?.[x] > 0) {
        ret = Number(index);
        break;
      }
    }
    this.highestLayerChache.set(key, ret);
    return ret;
  }

  // if(facing.x ==  1 && facing.y ==  0) return 'north'
  // if(facing.x ==  1 && facing.y ==  1) return 'northeast'
  // if(facing.x ==  1 && facing.y == -1) return 'northwest'

  // if(facing.x ==  0 && facing.y ==  1) return 'east'
  // if(facing.x ==  0 && facing.y == -1) return 'west'

  // if(facing.x == -1 && facing.y ==  0) return 'south'
  // if(facing.x == -1 && facing.y ==  1) return 'southeast'
  // if(facing.x == -1 && facing.y == -1) return 'northwest'

  getNeighbors(position) {
    x = position.x;
    y = position.y;
    layer = position.layer;

    const layerName = this.mapDataKeys[layer];
    const neighbors = new Map();

    neighbors.set("north", {
      type: this.mapData?.[layerName]?.[y + 0]?.[x + 1] || 0,
    });
    neighbors.set("northeast", {
      type: this.mapData?.[layerName]?.[y + 1]?.[x + 1] || 0,
    });
    neighbors.set("northwest", {
      type: this.mapData?.[layerName]?.[y - 1]?.[x + 1] || 0,
    });

    neighbors.set("east", {
      type: this.mapData?.[layerName]?.[y + 1]?.[x + 0] || 0,
    });
    neighbors.set("west", {
      type: this.mapData?.[layerName]?.[y + 1]?.[x + 0] || 0,
    });

    neighbors.set("south", {
      type: this.mapData?.[layerName]?.[y + 0]?.[x - 1] || 0,
    });
    neighbors.set("southeast", {
      type: this.mapData?.[layerName]?.[y + 1]?.[x - 1] || 0,
    });
    neighbors.set("southwest", {
      type: this.mapData?.[layerName]?.[y - 1]?.[x - 1] || 0,
    });

    return neighbors;
  }

  /**
   * { function_description }
   *
   * @param      {int}  x           map coordinate
   * @param      {int}  y           map coordinate
   * @param      {int}  layerIndex  The layer index
   * @return     {boolean}
   */
  tileHasNeighborLeft(pos) {
    const {x, y, layer} = pos;
    if (!this.mapData) return false;
    const layerName = this.mapDataKeys[layer];
    if (this.mapData?.[layerName]?.[y + 1]?.[x] > 0) return true;
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
  getTileNeighborLeft(pos) {
    const {x, y, layer} = pos;
    if (!this.mapData) return 0;
    const layerName = this.mapDataKeys[layer];
    return this.mapData?.[layerName]?.[y + 1]?.[x] | 0;
  }

  /**
   * { function_description }
   *
   * @param      {int}  x           map coordinate
   * @param      {int}  y           map coordinate
   * @param      {int}  layerIndex  The layer index
   * @return     {boolean}
   */
  tileHasNeighborRight(pos) {
    const {x, y, layer} = pos;
    //if (!this.mapData) return false;
    const layerName = this.mapDataKeys[layer];

    if (this.mapData[layerName]?.[y]?.[x + 1]) return true;
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
  getTileNeighborRight(pos) {
    const {x, y, layer} = pos;
    if (!this.mapData) return 0;
    const layerName = this.mapDataKeys[layer];
    return this.mapData?.[layerName]?.[y]?.[x + 1] | 0;
  }

  /**
   * Draws a tile.
   *
   * @param      {number}  x                            { parameter_description }
   * @param      {number}  y                            { parameter_description }
   * @param      {<type>}  color                        The color
   * @param      {<type>}  [context=this.ctxMapBuffer]  The context
   */
  drawTile(position, color, context = null, Offset = { x: 0, y: 0 }) {
    const x = position.x;
    const y = position.y;
    const layerIndex = position.layer;

    const ctx = context ?? this.ctxMapBuffer;

    ctx.save();

    const tw = this.tileWidth;
    const th = this.tileHeight;
    const z = 0.5;

    const twHalf = tw * 0.5;
    const thHalf = th * 0.5;

    ctx.fillStyle = "rgba(90,250,99,0.4)";
    ctx.strokeStyle = "rgba(20,250,20,0.5)";

    ctx.translate((x - y) * twHalf, (x + y) * thHalf);
    ctx.translate(-Offset.x, -Offset.y);

    if (layerIndex >= 1) {
      ctx.translate(
        -(0.5 * layerIndex - 0.5 * layerIndex) * twHalf,
        -(0.5 * layerIndex + 0.5 * layerIndex) * thHalf
      );
    }

    ctx.beginPath();
    ctx.moveTo(0, -z * th);
    ctx.lineTo(twHalf, thHalf - z * th);
    ctx.lineTo(0, th - z * th);
    ctx.lineTo(-twHalf, thHalf - z * th);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  drawBlock(x, y, layerIndex, type) {
    layerIndex = Number(layerIndex);
    //console.log('drawBlock',layerIndex,x,y);
    const context = this.ctxMapBuffer;

    let hue = Math.random() * 360;
    let sat = 60;
    let lig = 90;
    let alpha = 1;

    context.save();

    let z = 0.5;

    switch (type) {
      case 1:
        hue = 0;
        sat = 70;
        break;
      case 2:
        hue = 240;
        sat = 60;
        z = 0.45;
        alpha = 0.7;
        break;
      case 3:
        hue = 120;
        sat = 60;
        break;
    }

    if (layerIndex > 1) {
      //context.globalCompositeOperation = 'lighter';
    }

    //sat = 0;

    context.translate(
      ((x - y) * this.tileWidth) / 2,
      ((x + y) * this.tileHeight) / 2
    );

    if (layerIndex >= 1) {
      context.translate(
        (-(0.5 * layerIndex - 0.5 * layerIndex) * this.tileWidth) / 2,
        (-(0.5 * layerIndex + 0.5 * layerIndex) * this.tileHeight) / 2
      );
    }

    //context.strokeStyle = '#222222';

    //draw top
    context.beginPath();
    context.moveTo(0, -z * this.tileHeight);
    context.lineTo(
      this.tileWidth / 2,
      this.tileHeight / 2 - z * this.tileHeight
    );
    context.lineTo(0, this.tileHeight - z * this.tileHeight);
    context.lineTo(
      -this.tileWidth / 2,
      this.tileHeight / 2 - z * this.tileHeight
    );
    context.closePath();

    context.fillStyle = `HSLA(${hue}, ${sat}%, ${lig}%, ${alpha} )`;
    context.strokeStyle = `HSLA(${hue}, ${sat}%, ${lig - 25}%, ${alpha} )`;

    context.stroke();
    context.fill();

    const layer = layerIndex;
    if (this.drawSides) {
      (() => {
        const neighborLeft = this.getTileNeighborLeft({x, y, layer});
        if (!([0, 2].indexOf(neighborLeft) > -1)) return;
        if (type === 2 && neighborLeft === 2) return;
        // draw left
        lig = 70;
        context.beginPath();
        context.moveTo(
          -this.tileWidth / 2,
          this.tileHeight / 2 - z * this.tileHeight
        );
        context.lineTo(0, this.tileHeight - z * this.tileHeight);
        context.lineTo(0, this.tileHeight);
        context.lineTo(-this.tileWidth / 2, this.tileHeight / 2);
        context.closePath();

        context.fillStyle = `HSLA(${hue}, ${sat}%, ${lig}%, ${alpha} )`;
        context.strokeStyle = `HSLA(${hue}, ${sat}%, ${lig - 25}%, ${alpha} )`;
        context.stroke();
        context.fill();
      })();

      (() => {
        const neighborRight = this.getTileNeighborRight({x, y, layer});
        if (!([0, 2].indexOf(neighborRight) > -1)) return;

        if (type == 2 && neighborRight == 2) return;
        // draw right
        lig = 60;
        sat -= 10;

        context.fillStyle = `HSLA(${hue}, ${sat}%, ${lig}%, ${alpha} )`;
        context.strokeStyle = `HSLA(${hue}, ${sat}%, ${lig - 25}%, ${alpha} )`;

        context.beginPath();
        context.moveTo(
          this.tileWidth / 2,
          this.tileHeight / 2 - z * this.tileHeight
        );
        context.lineTo(0, this.tileHeight - z * this.tileHeight);
        context.lineTo(0, this.tileHeight);
        context.lineTo(this.tileWidth / 2, this.tileHeight / 2);
        context.closePath();

        context.stroke();
        context.fill();
      })();
    }

    //lig = 60;
    //context.fillStyle = `HSLA(${hue}, ${sat}%, ${lig}%)`;
    //context.fillRect(-3,-3,6,6);

    context.restore();
  }

  drawCaracter(position, hue = 60, _ctx = null, Offset = { x: 0, y: 0 }) {
    const x = position.x;
    const y = position.y;
    const layerIndex = position.layer;

    //console.log('drawBlock',layerIndex,x,y);
    const context = _ctx ?? this.ctxMapBuffer;

    let sat = 60;
    let lig = 90;
    let alpha = 0.9;

    const tileHeight = this.tileHeight || 64;
    const tileWidth = this.tileWidth || 128;
    context.save();

    const z = 1.1;

    if (layerIndex > 1) {
      //context.globalCompositeOperation = 'lighter';
    }

    context.translate(
      ((x - y) * tileWidth) / 2,
      ((x + y) * tileHeight) / 2 - 0.25 * tileHeight
    );

    context.translate(-Offset.x, -Offset.y);

    if (layerIndex >= 1) {
      context.translate(
        (-(0.5 * layerIndex - 0.5 * layerIndex) * tileWidth) / 2,
        (-(0.5 * layerIndex + 0.5 * layerIndex) * tileHeight) / 2
      );
    }

    context.strokeStyle = "#222222";

    //draw top
    context.beginPath();
    context.moveTo(0, (-z * tileHeight) / 2);
    context.lineTo(tileWidth / 4, tileHeight / 4 - (z * tileHeight) / 2);
    context.lineTo(0, tileHeight / 2 - (z * tileHeight) / 2);
    context.lineTo(-tileWidth / 4, tileHeight / 4 - (z * tileHeight) / 2);
    context.closePath();

    context.fillStyle = `HSLA(${hue}, ${sat}%, ${lig}%, ${alpha} )`;
    context.stroke();
    context.fill();

    alpha = 0.5;

    // draw left
    lig = 70;
    context.beginPath();
    context.moveTo(-tileWidth / 4, tileHeight / 4 - (z * tileHeight) / 2);
    context.lineTo(0, tileHeight / 2 - (z * tileHeight) / 2);
    context.lineTo(0, tileHeight / 2);
    context.lineTo(-tileWidth / 4, tileHeight / 4);
    context.closePath();

    context.fillStyle = `HSLA(${hue}, ${sat}%, ${lig}%, ${alpha} )`;
    context.stroke();
    context.fill();

    // draw right
    lig = 60;
    sat -= 10;
    context.beginPath();
    context.moveTo(tileWidth / 4, tileHeight / 4 - (z * tileHeight) / 2);
    context.lineTo(0, tileHeight / 2 - (z * tileHeight) / 2);
    context.lineTo(0, tileHeight / 2);
    context.lineTo(tileWidth / 4, tileHeight / 4);
    context.closePath();

    context.fillStyle = `HSLA(${hue}, ${sat}%, ${lig}%, ${alpha} )`;
    context.stroke();
    context.fill();

    lig = 60;

    context.fillStyle = `HSLA(${hue}, ${sat}%, ${lig}%)`;

    context.restore();
  }

  drawBlockImage(x, y, z) {
    const context = this.ctxMapBuffer;

    const image = tile128X128;

    context.save();
    context.translate(
      ((x - y) * this.tileWidth) / 2,
      ((x + y) * this.tileHeight) / 2
    );

    context.drawImage(image, -image.width / 2, -image.height / 2);

    //context.fillRect(-3,-3,6,6);

    context.restore();
  }

  getData() {}
}

export { map };
export default map;
