class Websocket{
  constructor(){
    let ws = new WebSocket('ws://127.0.0.1:7429/socket');
    ws.onopen = function() {
      // Web Socket is connected, send data using send()
      let msg = '"Message to send"';
      ws.send(msg);
      console.log("Message is sent...", msg);
    };

    ws.onmessage = function (evt) { 
      var msg = evt.data;
      console.log("Message is received...",msg);
    };

    ws.onclose = function() { 
      
      // websocket is closed.
      console.log("Connection is closed..."); 
    };
  }
}

export default Websocket;