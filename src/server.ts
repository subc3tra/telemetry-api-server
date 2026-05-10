import http from 'http';



function httpRequest(path: string) {

  const options = {
    hostname: 'localhost',
    port: 8002,
    path: path,
    method: 'GET'
  }

  const req = http.request(options, (res) => {
    let data ='';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      if(res.statusCode !== 200) {
        console.log('Bad response:', res.statusCode);
        return;
      }

      try {
        const parsed = JSON.parse(data);
        console.log(parsed);
      } catch {
        console.log('Response was not valid JSON');
      }
      
    })
  });

  req.on('error', (err) => {
    console.log('Connection failed', err.message)
  })

  req.end();
}

const telemetryPacket = httpRequest('/JSON/telemetrypacket');
const aiData = httpRequest('/JSON/aidata');