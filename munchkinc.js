Games = new Meteor.Collection("games");

var generate_game_id = function() {
    return Math.round(Math.random() * 10000000);
}
var join_game = function(game_id) {
    Session.set('game_id', "" + game_id);
    Session.set('in_game', true);
    $("#welcome").hide();
    $("#game").show();    
};

var leave_game = function() {
    Session.set('in_game', false);
    Session.set('game_id', "" + generate_game_id());
    $("#welcome").show();
    $("#game").hide();
    
}

if (Meteor.is_client) {
    Meteor.startup(function() {
        $("#addPlayer").modal({show: false});
        
        var hash = window.location.hash;
        
        if (hash == "" || hash == "#") {
            Session.set('game_id', "" + generate_game_id());
        } else {
            game_id = hash.split("#")[1];
            join_game(game_id);
        }
    });
    
    Template.player_list.players = function() {
        var personal = Session.get('player');
        
        if (typeof(personal) != "undefined") {
            return [personal];
        }
        
        game = Games.findOne({game_id: Session.get('game_id')});
        
        if (typeof(game) == "undefined") {
            return [];
        }
        return game.players;
    };
    
    Template.header.events = {
        'click .add_player': function() {
            $("#addPlayer").modal('show');
            return false;
        },
        
        'click #new_game': function() {
            if (Session.get('in_game') == false) {
                return;
            }
            var c = confirm("Are you sure you want to leave current game?");
            if (c == true) {
                leave_game();
            }
        }
    };
    
    Template.player_list.events = {        
        'click .save_add': function() {
            var avatar = Session.get('avatar'),
                player_name = $("#munchkin_name").val();
            
            if (avatar == false || typeof(avatar) == "undefined") {
                avatar = "duckofdoom.png";
            }
            
            Games.update({game_id: Session.get('game_id')}, {$addToSet: {players: {name: player_name, level: 1, avatar: avatar}}});
            Session.set('avatar', false);
            $("#addPlayer").modal('hide');
        }
    };
    
    $("li.avatar").live('click', function() {
        $("li.avatar img").removeClass("selectedAvatar");
        $(this).children().addClass("selectedAvatar");
       Session.set('avatar', $(this).attr("id"));
    });
    
    function find_player_pid(name) {
        var game = Games.findOne({game_id: Session.get('game_id')}),
            pid = false, upd = {};
        for (player in game.players) {
            if (game.players[player].name == name) {
                pid = player;
            }
        }
        return pid;
    }
    
    Template.player_info.events = {
        'click #player_up': function() {
            var upd = {}, pid = find_player_pid(this.name);
            if (this.level == 10) {
                return;
            }
            if (pid === false) {
                return;
            }
            upd["players." + pid + ".level"] = 1;
            Games.update({game_id: Session.get('game_id'), 'players.name': this.name}, {$inc: upd});
        },
        'click #player_down': function() {
            var upd = {}, pid = find_player_pid(this.name);
            if (this.level == 1) {
                return;
            }
            if (pid === false) {
                return;
            }
            upd["players." + pid + ".level"] = -1;
            Games.update({game_id: Session.get('game_id'), 'players.name': this.name}, {$inc: upd});
        },
        'click #player_name': function() {
            Session.set('player', {name: this.name, level: this.level, avatar: this.avatar});
        }
    };
    
    Template.player_info.level_colour = function() {
        if (this.level < 3) {
            return "white";
        } else if (this.level < 5) {
            return "blue";
        } else if (this.level < 7) {
            return "yellow";
        } else if (this.level < 9) {
            return "orange";
        } else {
            return "red";
        }
    };
    
    Template.player_info.level_text = function() {
        if (this.level == 10) {
            return "M";
        }
        return this.level;
    };
    
    // these next bits are ugly as hell :/
    Template.player_list.game_id = function() {
        return Session.get('game_id');
    }
    
    Template.header.game_id = function() {
        return Session.get('game_id');
    }
    
    Template.player_info.game_id = function() {
        return Session.get('game_id');
    }
    
    Template.header.in_game = function() {
        if (Session.get('in_game')) {
            return true;
        }
        return false;
    }
    
    Template.welcome.game_id = function() {
        return Session.get('game_id');
    }
    
    Template.welcome.events = {
        'click .start_game': function() {
            Games.insert({game_id: Session.get('game_id'), players: []});
            Session.set('in_game', true);
            $("#welcome").hide();
            $("#game").show();
        },
        
        'click .join_game': function() {
            var game_number = prompt("Enter game number");
            var game = Games.findOne({game_id: game_number});
            if (typeof(game) == "undefined") {
                alert("Game not found.");
                return;
            }
            
            join_game(game_number);
        }
    }
}

if (Meteor.is_server) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}