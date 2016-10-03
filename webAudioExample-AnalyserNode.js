var audio = {};
var dataArray, dataArray2;
var biquadFilter = {};
var bufferLength;
var audioEnable = false;

function getMicrophone(){
  function onError (res) {
    console.log('callback res:', res);
  }
  function onSuccess (stream) {
    initCanvas()
    audioEnable = true;
    audio.stream = stream;
    
    var myAudioContext =new  window.AudioContext();
    
    // Create a MediaStreamAudioSourceNode
    // Feed the HTMLMediaElement into it
    console.log('%c Sample Rate:'+myAudioContext.sampleRate , 'font-size: 50px;');
    $('#sampleRate').val(myAudioContext.sampleRate);
    
    audio.gainNode = myAudioContext.createGain();
    audio.gainNode.gain.value = 5;
    
    audio.source = myAudioContext.createMediaStreamSource(stream);
    
    audio.analyser = myAudioContext.createAnalyser();
    audio.analyser.minDecibels = -90;
    audio.analyser.maxDecibels = -10;
    audio.analyser.fftSize = 2048;
    // audio.analyser.smoothingTimeConstant = 0; //0 to 1, default is 0.8;
    
    bufferLength = audio.analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    dataArray2 = new Uint8Array(bufferLength);
    
    
    // Connect speaker to audio source
    audio.source.connect(audio.analyser);
    audio.analyser.connect(audio.gainNode);
    // audio.gainNode.connect(myAudioContext.destination);
    
    
    
    
    drawFreqDomain();
    drawTimeDomain();
  }
  navigator.mediaDevices.getUserMedia({audio: true}).then(onSuccess).then(onError);
}

function stop() {
  audioEnable = false;
  // audio.stream.stop();
  audio.stream.getAudioTracks()[0].stop();
}

function mute() {
  audio.stream.getAudioTracks()[0].enabled = !audio.stream.getAudioTracks()[0].enabled ;
}

function changeVolume() {
  audio.gainNode.gain.value = Number($('#gainNodeVolume').val());
}  


//-----------------Frequency analysis start-------------------
function freqAnalys() {
  var rms = 0;

  audio.analyser.frequencyBuffer = new Float32Array(audio.analyser.fftSize);
  this.frequencyBuffer = audio.analyser.frequencyBuffer;
  // Fill up the data.
  audio.analyser.getFloatTimeDomainData(frequencyBuffer);


  // Figure out the root-mean-square, or rms, of the audio. Basically
  // this seems to be the amount of signal in the buffer.
  for (var d = 0; d < this.frequencyBuffer.length; d++) {
    rms += this.frequencyBuffer[d] * this.frequencyBuffer[d];
  }

  rms = Math.sqrt(rms / this.frequencyBuffer.length);


}
//-----------------Frequency analysis end-------------------


//-----------------Canvas start-------------------
var freqDomainCell = {};
var timeDomainCell = {};


function initCanvas () {
  freqDomainCell.canvas = document.getElementById("freqDomain");
  // debugger;
  freqDomainCell.ctx = freqDomainCell.canvas.getContext("2d");
  freqDomainCell.canvas.width = 500;
  freqDomainCell.canvas.height = 200;
  
  timeDomainCell.canvas = document.getElementById("timeDomain");
  timeDomainCell.ctx = timeDomainCell.canvas.getContext("2d");
  timeDomainCell.canvas.width = 500;
  timeDomainCell.canvas.height = 200;
}

function drawFreqDomain() {
  freqDomainCell.ctx.clearRect(0, 0, freqDomainCell.canvas.width, freqDomainCell.canvas.height);
  if(!audioEnable)return;
  
  audio.analyser.getByteFrequencyData(dataArray);

  var barWidth = (freqDomainCell.canvas.width / bufferLength) * 2.5;
  var barHeight;
  var x = 0;
  

  for(var i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i];
    
    freqDomainCell.ctx.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';
    freqDomainCell.ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
    freqDomainCell.ctx.fillRect(x, freqDomainCell.canvas.height - barHeight/2, barWidth, barHeight/2);

    x += barWidth + 1;
  }
  
  window.requestAnimationFrame(drawFreqDomain);
}

function drawTimeDomain() {
  timeDomainCell.ctx.clearRect(0, 0, freqDomainCell.canvas.width, freqDomainCell.canvas.height);
  if(!audioEnable)return;
  
  audio.analyser.getByteTimeDomainData(dataArray2);
  timeDomainCell.ctx.lineWidth = 2;
  timeDomainCell.ctx.strokeStyle = 'rgb(0, 0, 0)';

  timeDomainCell.ctx.beginPath();

  var sliceWidth = timeDomainCell.canvas.width * 1.0 / bufferLength;
  var x = 0;

  for(var i = 0; i < bufferLength; i++) {

    var v = dataArray2[i] / 128.0;
    var y = v * timeDomainCell.canvas.height/2;

    if(i === 0) {
      timeDomainCell.ctx.moveTo(x, y);
    } else {
      timeDomainCell.ctx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  timeDomainCell.ctx.lineTo(timeDomainCell.canvas.width, timeDomainCell.canvas.height/2);
  timeDomainCell.ctx.stroke();

  window.requestAnimationFrame(drawTimeDomain);
}

// initCanvas();

// animeloop();
//-----------------Canvas end---------------------


// (
// function () {
//   getMicrophone();
// }
// )()