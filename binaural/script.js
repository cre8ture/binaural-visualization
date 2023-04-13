var Example = Example || {};
var Common = Matter.Common;
var Render = Matter.Render;


// var binauralButton = document.getElementById("start-btn");
// binauralButton.addEventListener('click', startBinauralBeats);

var binauralButton = document.getElementById('start-btn');
var isBinauralPlaying = false;



const audioButton = document.getElementById('audio-button');

let audio2;
let houseIsOn = false;
let binauralIsOn = false;
function toggleAudio() {

  if (!audio2) {
    audio2 = new Audio('house.mp3')
  }
  if (audio2.paused) {
    houseIsOn = true;
    audio2.play();
    audioButton.textContent = 'Stop Deep House Track';
    Example.softBody()

  } else {
    houseIsOn = false;
    audio2.pause();
    audio2.currentTime = 0;
    audioButton.textContent = 'Play Deep House Track';
  }
}

// get frequencies and deltas
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function getAudioFrequency(audioNew) {
  let source = audioNew.__audioSourceNode;
  let analyser = audioNew.__audioAnalyserNode;

  if (!source) {
    source = audioCtx.createMediaElementSource(audioNew);
    audioNew.__audioSourceNode = source;
  }

  if (!analyser) {
    analyser = audioCtx.createAnalyser();
    audioNew.__audioAnalyserNode = analyser;
  }

  source.connect(analyser);
  analyser.connect(audioCtx.destination);
  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(dataArray);
  const delta = audioCtx.sampleRate / dataArray.length;
  const frequency = findFrequency(dataArray, delta);
  return { frequency, delta };
}


function findFrequency(dataArray, delta) {
  let maxIndex = 0;
  let maxValue = 0;
  for (let i = 0; i < dataArray.length; i++) {
    if (dataArray[i] > maxValue) {
      maxValue = dataArray[i];
      maxIndex = i;
    }
  }
  return maxIndex * delta;
}

function getValueAtTime2(time, frequency, delta) {
  // console.log("house!", time, frequency, delta)


  var leftSine = Math.sin(2 * Math.PI * (frequency - delta / 2) * time),
    rightSine = Math.sin(2 * Math.PI * (frequency + delta / 2) * time);
  console.log("time, leftSine, rightSine", time, leftSine, rightSine)
  return (leftSine + rightSine) / 2;
}


audioButton.addEventListener('click', toggleAudio);

binauralButton.addEventListener('click', function() {
  if (isBinauralPlaying) {
    stopBinauralBeats();
    binauralButton.textContent = 'Start Binaural Beats';
  } else {
    startBinauralBeats();
    binauralButton.textContent = 'Stop Binaural Beats';
  }
  isBinauralPlaying = !isBinauralPlaying;
});


var Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Composites = Matter.Composites,
  MouseConstraint = Matter.MouseConstraint,
  Mouse = Matter.Mouse,
  Composite = Matter.Composite,
  Bodies = Matter.Bodies,
  Events = Matter.Events,
  World = Matter.World; // add this line to import World module
var engine = Engine.create(),
  world = engine.world
var Body = Matter.Body;

Example.softBody = function() {

  // create renderer
  var render = Render.create({
    element: document.body,
    engine: engine,
    options: {
      width: 800,
      height: 600,
      showAngleIndicator: false
    }
  });

  let collisionForceThreshold = 0.2;
  Events.on(engine, 'collisionStart', function(event) {
    // Iterate over all pairs in the event
    for (var i = 0; i < event.pairs.length; i++) {
      var pair = event.pairs[i];

      // If the pair has enough collision force
      if (pair.collision.force > collisionForceThreshold) {
        // Create mini particles
        var numParticles = 10;
        var particleRadius = 3;
        var particleOptions = {
          friction: 0.05,
          frictionStatic: 0.1,
          render: {
            sprite: {
              texture: './paper',
              xScale: 0.5,
              yScale: 0.5
            }
          }
        };
        for (var j = 0; j < numParticles; j++) {
          var particle = Bodies.circle(pair.collision.position.x, pair.collision.position.y, particleRadius, particleOptions);
          World.add(world, particle);
          // Apply an impulse to the particles
          Body.applyForce(particle, particle.position, {
            x: Common.random(-0.05, 0.05),
            y: Common.random(-0.05, 0.05)
          });
        }
      }
    }
  });

  Render.run(render);

  // create runner
  var runner = Runner.create();
  Runner.run(runner, engine);

  // add bodies
  var particleOptions = {
    friction: 0.05,
    frictionStatic: 0.1,
    render: { visible: true }
  };

  Composite.add(world, [
    // see softBody function defined later in this file
    Example.softBody.softBody(250, 100, 5, 5, 0, 0, true, 18, particleOptions),
    Example.softBody.softBody(400, 300, 8, 3, 0, 0, true, 15, particleOptions),
    Example.softBody.softBody(250, 400, 4, 4, 0, 0, true, 15, particleOptions),
    // walls
    Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
    Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
    Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
    Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
  ]);

  // add mouse control
  var mouse = Mouse.create(render.canvas),
    mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.9,
        render: {
          visible: false
        }
      }
    });

  Composite.add(world, mouseConstraint);

  // keep the mouse in sync with rendering
  render.mouse = mouse;

  // fit the render viewport to the scene
  Render.lookAt(render, {
    min: { x: 0, y: 0 },
    max: { x: 800, y: 600 }
  });

  // context for MatterTools.Demo
  return {
    engine: engine,
    runner: runner,
    render: render,
    canvas: render.canvas,
    stop: function() {
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
    }
  };
};

Example.softBody.title = 'Soft Body';
Example.softBody.for = '>=0.14.2';

let oscillator1;
let oscillator2;
let gainNode;

var binauralBeats = {

  frequency: 440, // the base frequency of the beat
  delta: 5, // the difference in frequency between the two sine waves
  sampleRate: 44100, // the sample rate of the audio
  duration: 5, // the duration of the audio in seconds

  play2: function() {
    // set the base frequency of the beat
    binauralIsOn = true;
    // create a new AudioContext
    audioContext = new AudioContext();

    // create two oscillators with frequencies that differ by the beat frequency
    oscillator1 = audioContext.createOscillator();
    oscillator1.frequency.value = binauralBeats.frequency;
    oscillator1.start();

    oscillator2 = audioContext.createOscillator();
    oscillator2.frequency.value = binauralBeats.frequency + binauralBeats.delta;
    oscillator2.start();

    // create a gain node to control the volume of the oscillators
    gainNode = audioContext.createGain();
    gainNode.gain.value = 0.5;

    // connect the oscillators to the gain node
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);

    // connect the gain node to the audio output
    Example.softBody()
    gainNode.connect(audioContext.destination);
  },

  stop: function() {

    binauralIsOn = false;
    // stop the oscillators
    oscillator1.stop();
    oscillator2.stop();

    // disconnect all audio nodes
    oscillator1.disconnect();
    oscillator2.disconnect();
    gainNode.disconnect();

    // reset values
    audioContext = null;
    oscillator1 = null;
    oscillator2 = null;
    gainNode = null;

  },

  getValueAtTime: function(time) {
    // console.log("U IS HERE!!!")



    var leftSine = Math.sin(2 * Math.PI * (this.frequency - this.delta / 2) * time),
      rightSine = Math.sin(2 * Math.PI * (this.frequency + this.delta / 2) * time);
    // console.log("time, leftSine, rightSine", time, leftSine, rightSine)
    return (leftSine + rightSine) / 2;
  }
};


Example.softBody.softBody = function(xx, yy, columns, rows, columnGap, rowGap, crossBrace, particleRadius, particleOptions, constraintOptions) {
  var Common = Matter.Common,
    Composites = Matter.Composites,
    Bodies = Matter.Bodies;

  particleOptions = Common.extend({ inertia: Infinity }, particleOptions);
  constraintOptions = Common.extend({ stiffness: 0.2, render: { type: 'line', anchors: false } }, constraintOptions);

  var softBody = Composites.stack(xx, yy, columns, rows, columnGap, rowGap, function(x, y) {
    return Bodies.circle(x, y, particleRadius, particleOptions);
  });

  Composites.mesh(softBody, columns, rows, crossBrace, constraintOptions);

  // set the positions of the particles based on the binaural beats
  Events.on(engine, 'beforeUpdate', function() {
    var time = engine.timing.timestamp / 1000; // convert to second
    softBody.bodies.forEach(function(body, index) {
      var x = xx + (index % columns) * (particleRadius * 2 + columnGap);
      var y = yy + Math.floor(index / columns) * (particleRadius * 2 + rowGap);
      var values = binauralBeats.getValueAtTime(time);

      // KAI ADDED
      var houseFreqDelt;
      var values2 = 0;
      console.log("audio2.paused", audio2?.paused)
      if (houseIsOn) {
        console.log("audio is not paused, values, values2", values, values2)
        houseFreqDelt = getAudioFrequency(audio2)

        values2 = getValueAtTime2(time, 125, houseFreqDelt.delta)

      }
      else {
        console.log("audio is paused!", values, values2)
        values2 = 0
      }

      console.log("houseFreqDelt!", values, values2)

      var rebalancePos = index * 50

      var displacement = (values + values2) * 5; // adjust the amplitude of the vibration
      console.log("DISPLACEMENT", displacement)

      if (displacement === 0 || !binauralIsOn && !houseIsOn) {
        var currentPosition = body.position;
        Body.setPosition(body, { x: currentPosition.x, y: currentPosition.y });
      } else {
        if (x < 0) {
          x = 0;
        } else if (x > 300) {
          x = 300 - rebalancePos;
        }
        if (y < 0) {
          y = 0;
        } else if (y > 300) {
          y = 300 - rebalancePos;
        }
        Body.setPosition(body, { x: Math.abs(x), y: Math.abs(y + displacement) });
      }
    });
  });

  return softBody;
};

function startBinauralBeats() {
  binauralBeats.frequency = 400
  binauralBeats.delta = 5
  binauralBeats.play2();

  Example.softBody()
}

function stopBinauralBeats() {
  binauralBeats.frequency = 0
  binauralBeats.delta = 0
  binauralBeats.stop();

  // Example.softBody().stop();
}



// //mp3
// Get a reference to the audio element
// const audio = new Audio('house.mp3');

// Create a function to play the audio
function playAudio() {
  audio.play();
}

// Create a function to stop the audio
function stopAudio() {
  audio.pause();
  audio.currentTime = 0;
}
