const async = require('async');
const COLOUR = "#3AA3E3";

// display error message
function displayErrorMsg(errorMsg, callback) {
  callback("Oops, something went wrong! :thinking-face:\nPlease contact an organizer! :telephone_receiver:");
  console.error(`ERROR: ${errorMsg}`);
}

// list commands
function helpMsg(callback) {
  callback({ text: "List of commands:\n  `/team start` to begin the search!\n  `/team display` to display your preferences\n  `/team list (members/teams)` to display the list of discoverable users" });
}

// Welcome new users
function welcomeNewUser(userName, callback) {
  callback({
    text: `Hi ${userName}!  I'm here to assist you with forming a team!\nTo start, are you looking to join a team or are you part of a team looking for team members?`,
    attachments: [
      {
        "text": "I am looking for:",
        "fallback": "The features of this app are not supported by your device",
        "callback_id": "user_type",
        "color": COLOUR,
        "attachment_type": "default",
        "actions": [
          {
            "name": "user_team",
            "text": "A Team",
            "type": "button",
            "value": "team"
          },
          {
            "name": "user_member",
            "text": "Team Members",
            "type": "button",
            "value": "member"
          }
        ]
      }
    ]
  });
}

// Welcome returning user
function welcomeOldUser(userName, userId, data, callback) {
  var actions = [];
  var action_userType = {
    "name": "user_type",
    "text": "",
    "type": "button",
    "value": ""
  };

  // Switch user type
  if(data.user_type === "team") {
    action_userType["text"] = "Find members instead";
    action_userType["value"] = "member";
  } else if (data.user_type === "member") {
    action_userType["text"] = "Find a team instead";
    action_userType["value"] = "team";
  }
  actions.push(action_userType);

  // Set roles
  if (!data.roles) {
    actions.push({
      "name": "set_roles",
      "text": "Pick roles",
      "type": "button",
      "value": "roles"
    });
  }
  // Toggle visibility
  else if (!data.visible)
    actions.push({
      "name": "visibility",
      "text": "Discover me!",
      "type": "button",
      "value": (data.user_type === "team") ? "team" : "members"
    });

  // Remove User
  actions.push({
    "name": "remove",
    "text": "Remove me",
    "type": "button",
    "value": "remove"
  });

  callback({
    text: `Welcome back ${userName}! What would you like to do?`,
    attachments: [
      {
        "text": "Select an action:",
        "fallback": "The features of this app are not supported by your device",
        "callback_id": "edit",
        "color": COLOUR,
        "attachment_type": "default",
        "actions": actions
      }
    ]
  });
}

function formatMatches(sortedMatches, callback) {
  async.map(sortedMatches, (match, next) => {
    formatUser(match.user_id, match.user_name, match.roles, match.skills, obj => next(null, obj));
  }, (err, matches) => {
    if (err) return displayErrorMsg("Could not sort matches", msg => callback({ "text": msg }));
    else return callback(matches);
  });
}

function formatUser(userId, userName, roles, skills, callback) {
  callback({
    "fallback": "Required plain-text summary of the attachment.",
    "color": COLOUR,
    "title": `<@${userId}|${userName}>`,
    "fields": [
      {
        "title": "Roles",
        "value": roles,
        "short": true
      },
      {
        "title": "Skills (Level: out of 5)",
        "value": skills,
        "short": true
      }
    ]
  });
}

function formatInfo(roles, skills, userType, visible, callback) {
  callback({
      "fallback": "Required plain-text summary of the attachment.",
      "color": COLOUR,
      "pretext": "Here are your preferences!",
      "fields": [
          {
              "title": "Looking For",
              "value": userType,
              "short": true
          },
          {
              "title": "Discoverable?",
              "value": visible,
              "short": true
          },
          {
              "title": "Roles",
              "value": roles,
              "short": true
          },
          {
              "title": "Skills (Level: out of 5)",
              "value": skills,
              "short": true
          }
      ]
  });
}

function formatSkillLvl(skill, actions, callback) {
  callback({
    "fallback": "The features of this app are not supported by your device",
    "callback_id": "skills",
    "color": COLOUR,
    "attachment_type": "default",
    "title": skill,
    "actions": actions
  });
}

module.exports = {
  displayErrorMsg,
  helpMsg,
  welcomeNewUser,
  welcomeOldUser,
  formatMatches,
  formatUser,
  formatInfo,
  formatSkillLvl
}
