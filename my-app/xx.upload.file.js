const express = require('express')
const app = express()
const port = 3000
const path = require('path')
const cors = require('cors');
const fs = require('fs');

app.use(cors({
    origin: '*'
}));

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/file/:name', function (req, res, next) {
    var options = {
        root: path.join(__dirname, 'public'),
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true,
            // "Content-Type": "application/octet-stream"
        }
    }

    var fileName = req.params.name
    res.sendFile(fileName, options, function (err) {
        if (err) {
            next(err)
        } else {
            console.log('Sent:', fileName)
        }
    })
})

app.get('/file1/:name', function (req, res, next) {
    const fileName = req.params.name;
    const filePath = path.join(__dirname, 'public', fileName);
    fs.readFile(filePath,  (err, data) => {
        if (err) {
            return res.status(500).json({ msg: '文件未找到', data: null });
        }
        // const base64Data = data.toString('base64');
        // res.json({ msg: '成功获取文件', data: base64Data });
        // res.send(data);

        // res.setHeader('Content-Type', 'application/pdf');
        res.json({ msg: '成功获取文件', data: data });
    });
});

app.get('/file2/:name', function (req, res, next) {
    const fileName = req.params.name;
    const filePath = path.join(__dirname, 'public', fileName);
    
    const stream = fs.createReadStream(filePath);
    
    stream.on('error', (err) => {
        return res.status(500).json({ msg: '文件未找到', data: null });
    });
    
    res.setHeader('Content-Type', 'application/octet-stream');
    
    stream.pipe(res);
});

app.get('/file3/:name', function (req, res, next) {
    const fileName = req.params.name;
    const filePath = path.join(__dirname, 'public', fileName);

    fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
            return res.status(500).json({ msg: '文件未找到', data: null });
        }
        res.setHeader('Content-Type', 'text/plain');
        let index = 0;
        function sendNextChar() {
            if (index < data.length) {
                res.write(data[index]);
                index++;
                setTimeout(sendNextChar, 100);
            } else {
                res.end();
            }
        }
        sendNextChar();
    });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

async function readFile(filePath) {
    const readStream = fs.createReadStream(filePath, { encoding: 'utf8' });
    try {
      for await (const chunk of readStream) {
        console.log('--- File chunk start ---');
        console.log(chunk);
        console.log('--- File chunk end ---');
      }
      console.log('Finished reading the file.');
    } catch (error) {
      console.error(`Error reading file: ${error.message}`);
    }
  }