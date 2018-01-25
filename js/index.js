/* 
How to finish (it used to say win, but it's not really winning, is it?):

dial 555-1212, CONNECTED
press 4 for customer service, plays main hold recording. QUEUEENTERED
main hold recording will loop indefinitely until you ragequit and press 0
the recording will shame you for ragequitting, and return you to the main menu PUNISHED
press 4 for customer service again. 
listen to the entire recording. 
The end. 

If you hang up before the end, you must start over. 

Every button but 4 and 5 will return you to the main menu, from the main menu.

to reach the end, you must be connected, queueentered and punished.

Optional:
press 5 to hear a sound clip. 

*/

angular.module('phonetree', []);

angular.module('phonetree')
    .controller('appController', appController)
    .controller('calcController', calcController)
    .controller('phoneController', phoneController);

function appController($timeout){
    var app = this;
    app.title = 'Phone Tree';
    app.subtitle = 'click anywhere to begin';
    app.phoneOpen = false;
    app.duckOpen = false;

    app.titlecard = true;
    app.fadeout = false;

    app.start = function(){
        // fade out the intro
        app.fadeout = true;
        $timeout(function(){
            //remove the titlecard after it's faded
            app.titlecard = false;
        }, 2000);
    };

    var ducksqueak = new Howl({
        src: ['audio/duck.mp3']
    });

    app.duck = function(){
        app.duckOpen = !app.duckOpen;
        if(app.duckOpen){ducksqueak.play();};
    };

    app.phone = function(){
        app.phoneOpen = true;
        $timeout(function(){
            app.phoneReady = true;
        }, 600);
    };

}

function calcController(){
    var calc = this;
    calc.calcOpen = false;
    calc.output = 0;

    calc.click = function(val){
        if(calc.output !== 0) {
            calc.output += val;
        } else {
            calc.output = val;
        }       
    }

    calc.result = function(){
        calc.output = eval(calc.output);
    }

    calc.clear = function(){
        calc.output = 0;
    }
    
    calc.delete = function(){
        calc.output = calc.output.slice(0, -1);
    }

    calc.pickUp = function(){
        calc.calcOpen = true;
    }

    calc.close = function(){
        calc.calcOpen = false;
    }
}

function phoneController($scope) {
    var vm = this;
    var howlerlist = {};

    vm.theEnd = '';

    vm.screen = false;

    vm.console = 'console';
    vm.display = '';
    vm.connected = false;
    vm.queueEntered = false;
    vm.punished = false;
    vm.lick = false;
    vm.disabled = false;

    var displayReset = 'Connected';

    howlerlist.menu = new Howl({
        src: ['audio/menu.mp3'],
        volume: 0.5
    });

    howlerlist.hold1 = new Howl({
        src: ['audio/hold1.mp3'],
        volume: 0.5,
        loop: true
    });

    howlerlist.hold2 = new Howl({
        src: ['audio/hold2.mp3'],
        volume: 0.5
    });

    howlerlist.lick = new Howl({
        src: ['audio/lick2.mp3'],
        volume: 0.5,
        onend: function(){
            vm.display = displayReset;
        }
    });

    howlerlist.ringback = new Howl({
        src: ['audio/ringback.wav'],
        volume: 0.3,
        onend: function(){
            if(vm.connected){
                howlerlist.menu.play();
            }
        }
    });

    howlerlist.errormsg = new Howl({
        src: ['audio/complete3-bell-f1.mp3'],
        volume: 0.3,
        onend: function(){
            vm.display = '';
            vm.connected = false;
            vm.queueEntered = false;
            vm.punished = false;
            $scope.$apply();
            }
        });

    howlerlist.soundErrormsg = new Howl({
          src: ['audio/ringback.wav'],
          volume: 0.3,
          onend: function(){ howlerlist.errormsg.play(); }
        });

    howlerlist.ringbacklong = new Howl({
        src: ['audio/ringback-long.mp3'],
        volume: 0.3,
        onend: function(){howlerlist.menu.play(); vm.disabled = false;}
    });

    vm.homeButton = function() {
        vm.screen = !vm.screen;
    };

    var synth = new(window.AudioContext || window.webkitAudioContext)();
    var oscillator1 = synth.createOscillator();
    var oscillator2 = synth.createOscillator();
    var node = synth.createGain(); 
    node.gain.value = 0.03; 
    oscillator1.type = 'sine'; 
    oscillator2.type = 'sine';
    oscillator1.start();
    oscillator2.start();

    vm.tone = function(val){
        var tones = {
            '1': [697,1209],
            '2': [697,1336],
            '3': [697,1477],
            '4': [770,1209],
            '5': [770,1336],
            '6': [770,1477],
            '7': [852,1209],
            '8': [852,1336],
            '9': [852,1477],
            '#': [941,1209],
            '0': [941,1336],
            '*': [941,1477]
        };

        //only play if screen is on
        if(vm.screen){
            //use setvalueattime to prevent sliding tones by directly setting frequency.value
            oscillator1.frequency.setValueAtTime(tones[val][0], synth.currentTime); 
            oscillator2.frequency.setValueAtTime(tones[val][1], synth.currentTime);  
            oscillator1.connect(node);
            oscillator2.connect(node);
            node.connect(synth.destination);
        }
    };

    vm.stop = function() {
        oscillator1.disconnect();
        oscillator2.disconnect();
        if(!vm.punished && !vm.disabled){
            Object.keys(howlerlist).forEach(function(key) {
                howlerlist[key].stop();
            });
        }
        
    };

    //all button presses are clicks
    vm.click = function(val){
        //only do stuff if the screen is on
        if(vm.screen){
            vm.console = val;
            press(val);
        } 
    };

    vm.del = function() {
        if(!vm.connected){
            vm.display = vm.display.slice(0, -1);
        }
    };

    function press(val){
        if(val === 'submit' && !vm.punished){
            vm.submit(vm.display);
        } else {
            //update the display
            if(val !== 'submit') {vm.display += val;} 
            if(vm.lick){
                //use lick input
                onLick(val); 
            } else if (vm.disabled){
                //do nothing
            } else if(vm.queueEntered && vm.connected && !vm.punished){
                //use the onHold input
                onHold(val);
            } else if(vm.connected && !vm.punished){ 
                //use the phoneTree input
                phoneTree[val](); 
            }
        }
    }

    

    vm.submit = function(display){

        Object.keys(howlerlist).forEach(function(key) {
                howlerlist[key].stop();
            });

        if(display === '5551212' && !vm.connected ){
            //connect
            vm.connected = true;
            vm.display = displayReset;
            howlerlist.ringback.play();
            
        } else {
            
            //if you try to dial any other number
            if(!vm.connected){ 
                vm.connected = true;
                howlerlist.soundErrormsg.play(); 
            } else {
                //hang up and reset everything
                vm.display = '';
                vm.connected = false;
                vm.queueEntered = false;
                vm.punished = false;
            }
            
        }
    };

    function onHold(){
        howlerlist.hold2.play();
        vm.punished = true; 
        vm.display = "you don't listen to instructions very well.";
    }

    function onLick(val){
        if(val === '1'){
            howlerlist.lick.play();
        } else if(val === '2'){
            vm.lick = false;
            howlerlist.menu.play();
        } else if (val === "0") {
            //hang up
            vm.lick = false;
            vm.submit();
        }
    }

    var phoneTree = {
        '1': function(){ howlerlist.ringbacklong.play(); vm.disabled = true; vm.display = displayReset; },
        '2': function(){ howlerlist.ringbacklong.play(); vm.disabled = true; vm.display = displayReset; },
        '3': function(){ howlerlist.ringbacklong.play(); vm.disabled = true; vm.display = displayReset; },
        '4': function(){ holdHandler(); }, //determine whether to play main hold or final hold
        '5': function(){ howlerlist.lick.play(); vm.lick = true; },
        '6': function(){ howlerlist.menu.play(); },
        '7': function(){ howlerlist.menu.play(); },
        '8': function(){ howlerlist.menu.play(); },
        '9': function(){ howlerlist.menu.play(); },
        '0': function(){ howlerlist.menu.play(); },
        '*': function(){ howlerlist.menu.play(); },
        '#': function(){ howlerlist.menu.play(); }
    };

    function holdHandler(){
        if(vm.punished){
            //final hold recording
            vm.display = 'please continue to hold.';
            alert('thank you for holding.');
            alert('you will never speak to a human.');
            alert('the end.');
            vm.theEnd = '(the end.)';
        } else {
            //main hold recording
            howlerlist.hold1.play();
            vm.queueEntered = true; 
            vm.display = 'please hold...';
        }
        
    }

}
