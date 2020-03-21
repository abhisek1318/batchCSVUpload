const cluster = require('cluster');

let workers = [];

const setupWorkerProcesses = () => {
  let numCores = require('os').cpus().length;
  console.log('Master cluster setting up ' + numCores + ' workers');

  for (let i = 0; i < numCores; i++) {
    workers.push(cluster.fork());

    workers[i].on('message', function (message) {
      console.log(message);
    });
  }

  cluster.on('online', function (worker) {
    console.log('Worker ' + worker.process.pid + ' is listening');
  });

  cluster.on('exit', function (worker, code, signal) {
    cluster.fork();
    workers.push(cluster.fork());
    workers[workers.length - 1].on('message', function (message) {
      console.log(message);
    });
  });
};

const setupServer = (isClusterRequired) => {
  if (isClusterRequired && cluster.isMaster) {
    setupWorkerProcesses();
  }
};

setupServer(true)