
window.T = window.T || {}; 

window.T = {

	error: function(message) {
    alert(message);
    return false;
  },

	state: {
		food: 	1,
		toilet: 1,
		fun: 	  1
	}, // END T.state
  
  // let's avoid magic numbers, maybe we change the rules of the game
  _state: {
    max:   5,
    min:   1,
    mid:   3
  },
	
	action: {
		
    track: {
      feed:   0,
      toilet: 0,
      play:   0,
      study:  0
    },
    
		_improve: function(what, points) {
			if (undefined == what || undefined == T.state[what]) 
				return T.error("Can't improve undefined attribute");
        
      if (undefined == points || false == !!(parseInt(points))) 
				return T.error("Can't improve "+what+" by undefined points");
      
      T.state[what] += parseInt(points);
      T.state[what] = (T._state.max < T.state[what]) ? T._state.max : T.state[what];
      
      return T;
		}, // END T.action._improve()
	
		_worsen: function(what, points) {
      if (undefined == what || undefined == T.state[what]) 
				return T.error("Can't worsen undefined attribute");
        
      if (undefined == points || false == !!(parseInt(points))) 
				return T.error("Can't worsen "+what+" by undefined points");
      
      T.state[what] -= parseInt(points);
      T.state[what] = (T._state.min > T.state[what]) ? T._state.min : T.state[what];
      
      return T;
		}, // END T.action._worsen()
	
		feed: function() {
      T.action._improve('food', 2);
      T.action.track.feed++;
      return T.mood.update();
		}, // END T.action.feed()
		
		toilet: function() {
      T.action._improve('toilet', 2);
      T.action.track.toilet++;
      return T.mood.update();
		}, // END T.action.toilet()
		
		play: function() {
      if (T.mood.isSad) return false;
      T.action._improve('fun', 2).action._worsen('food', 1).action._worsen('toilet', 1);
      T.action.track.play++;
      return T.mood.update();
		}, // END T.action.play()
		
		study: function() {
      if (!T.mood.isHappy) return false;
      T.action._worsen('fun', 1).action._worsen('food', 1).action._worsen('toilet', 1);
      T.action.track.study++;
      return T.mood.update();
		}, // END T.action.study()
	}, // END T.action

  mood: {
    isSad:      false,
    isNeutral:  false,
    isHappy:    false,
    update: function() {
      T.mood.isSad = T.mood.isNeutral = T.mood.isHappy = false;
      var limitNo = 0;
      
      for(var which in T.state) {
        if (T.state[which] >= T._state.mid)
          limitNo++;
      }
      
      if (3 == limitNo) { 
        T.mood.isHappy = true;
      } else if (2 == limitNo) {
        T.mood.isNeutral = true;
      } else {
        T.mood.isSad = true;
      }
      
      return T.mood.display();
    }, // END T.mood.update()
    
    display: function() {
      
      if (T.mood.isSad) {
        $('#face').text(':/');
        $('#play,#study').addClass('disabled');
      }
      
      if (T.mood.isNeutral) {
        $('#face').text(':|');
        $('#play').removeClass('disabled');
        $('#study').addClass('disabled');
      }
        
      if (T.mood.isHappy) {
        $('#face').text(':)');
        $('#play,#study').removeClass('disabled');
      }
      
      if (T.action.track.study == 5) {
        $('#options span').removeClass('active').addClass('disabled');
        $('#face').text('You win!').addClass('victory');
      }
      
      T.debug();
      
      return T;
    }, // END T.mood.display() 
  }, // END T.mood
  buttons: {
    move: function() {
        var options = document.getElementById('options').getElementsByTagName('span');
        var ol = options.length;
        var $currentOpt, $nextOpt, j;
        for (var i = 0; i < ol; i++) {
          j = i+1;
          $currentOpt = $(options[i]);
          if ($currentOpt.hasClass('active')) {
            if (undefined == options[j]) {
              $nextOpt = $(options[0]);
            } else {
              $nextOpt = $(options[j]);
            }
            $currentOpt.removeClass('active');
          }
        }
        if ($nextOpt) 
          $nextOpt.addClass('active');
        return T;
    }, // END T.buttons.move()
    
    enter: function() {
      var action = $('#options .active').attr('id');
      if ($('#action').hasClass('hidden')) {
        $('#action').text(action).removeClass('hidden');
      } else {
        T.action[action]();
        $('#action').text('').addClass('hidden');
      }
    }, // END T.buttons.enter()
    
    escape: function() {
      $('#action').text('').addClass('hidden');
    } // END T.buttons.escape()
  }, // END T.buttons
  
  init: function() {
    $('#move').on('click', function(e) { T.buttons.move() });
    $('#enter').on('click', function(e) { T.buttons.enter() });
    $('#escape').on('click', function(e) { T.buttons.escape() });
    
		T.mood.update();
  }, 
 debug: function() {
    $('#status-food').text('food: ' + T.state.food);
    $('#status-toilet').text('toilet: ' + T.state.toilet);
    $('#status-fun').text('fun: ' + T.state.fun);
    $('#action-food').text('Ate  ' + T.action.track.feed + ' times');
    $('#action-toilet').text('Pooped  ' + T.action.track.toilet + ' times');
    $('#action-play').text('Played  ' + T.action.track.play + ' times');
    $('#action-study').text('Studied  ' + T.action.track.study + ' times');
  },  
  save: function(key, data) {
    localStorage.setItem(key, data);
    return T;
  },
    
  load: function(key) {
    var ret = localStorage.getItem(key);
    return ret;
  },
  
  delete: function(key) {
    localStorage.removeItem(key);
    return T;
  },
  
  clear: function() {
    localStorage.clear();
    return T;
  }
};


$(document).ready(
    function() {
      T.init();
    }
);