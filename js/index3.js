angular.module("phonetree", []);

angular.module("phonetree")
    .controller("appController", appController);

function appController($scope) {
    var vm = this;
    vm.title = "Phone Tree";
    vm.screen = false;
    vm.callActive = false;
    vm.number = "";
    vm.convo = "";
    vm.message = "";

    var synth = new(window.AudioContext || window.webkitAudioContext)();
    var oscillator1 = synth.createOscillator();
    var oscillator2 = synth.createOscillator();
    var node = synth.createGain(); 
    node.gain.value = 0.03; 
    oscillator1.type = 'sine'; 
    oscillator2.type = 'sine';
    oscillator1.start();
    oscillator2.start();
  
    vm.homeButton = function() {
        vm.screen = !vm.screen;
    };

    vm.del = function() {
        vm.number = vm.number.slice(0, -1);
    };

    vm.touch = function(key,num) {
        vm.number += num;
        console.log(vm.number);
        $scope.$broadcast('press', num);
        var tones = {
            'one': [697,1209],
            'two': [697,1336],
            'three': [697,1477],
            'four': [770,1209],
            'five': [770,1336],
            'six': [770,1477],
            'seven': [852,1209],
            'eight': [852,1336],
            'nine': [852,1477],
            'pound': [941,1209],
            'zero': [941,1336],
            'star': [941,1477]
        }

        //use setvalueattime to prevent sliding tones by directly setting frequency.value
        oscillator1.frequency.setValueAtTime(tones[key][0], synth.currentTime); 
        oscillator2.frequency.setValueAtTime(tones[key][1], synth.currentTime);  
        oscillator1.connect(node);
        oscillator2.connect(node);
        node.connect(synth.destination);
    }

    vm.stop = function() {
        oscillator1.disconnect();
        oscillator2.disconnect();
    }

    vm.call = function() {
        if(vm.callActive){
            vm.number = "";
            vm.callActive = false;
        } else {
            alert('ringback');
            vm.callActive = true;
            vm.convo = "press one for sales, two for billing, three for lab, four for customer service, five for licking";
        }
        
    };
   
    vm.phoneTree = function(){
        alert('ring ring ring');
        alert('thank you for calling.');
        $scope.$on('press', options(event, data));
    }

    function options(event, data){
        if(!data){
            vm.convo = "press one for sales, two for billing, three for lab, four for customer service, five for licking";
        } else if (data == 1 || data == 2 || data == 3) {
            alert('nobody picks up.');
            options();
        } else if(data == 5) {
            alert('lick lick lick');
            options();
        } else if (data == 4) {
            alert('7 minutes of sitting on hold.');
            options();
        }
    }

    function play(url) {
        return new Promise(function(resolve, reject) { // return a promise
            var audio = new Audio();                     // create audio wo/ src
            audio.volume = 0.5;
            audio.preload = "auto";                      // intend to play through
            audio.autoplay = true;                       // autoplay when loaded
            audio.onerror = reject;                      // on error, reject
            audio.onended = resolve;                     // when done, resolve

            audio.src = url
        });
    }

  // play(audi).then(function() {
  //   alert("Done!");
  // })
  
}
