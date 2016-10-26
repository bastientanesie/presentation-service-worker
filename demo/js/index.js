var $registerResult = $(".js-register-result");
var $controllerState = $(".js-controller-state");
var $registrationState = $(".js-registration-state");
var $registrationActivity = $(".js-registration-activity");
var $activity = $(".js-activity");

// ServiceWorker is a progressive technology. Ignore unsupported browsers
if ("serviceWorker" in navigator) {
    log("Service worker registration in progress.");

    if (navigator.serviceWorker.controller) {
        $controllerState.text("is").removeClass("label-default").addClass("label-success");
    }
    else {
        $controllerState.text("is not").removeClass("label-default").addClass("label-danger");
    }

    navigator.serviceWorker.register("service-worker.js")
        .then(function(registration) {
            log("Service worker registration complete.", registration);
            $registerResult.text("succeeded").removeClass("label-default").addClass("label-success");

            registration.addEventListener("updatefound", function(event) {
                logActivity("Found a new Service Worker VERSION");

                var installing = registration.installing;
                installing.addEventListener("statechange", function() {
                    if (installing.state == "installed") {
                        logActivity("New ServiceWorker installed.");
                        // give it a second to see if it activates immediately
                        setTimeout(function() {
                            if (installing.state == "activated") {
                                logActivity("New ServiceWorker activated! Reload to load this page with the new ServiceWorker.");
                            }
                            else {
                                showWaitingMessage();
                            }
                        }, 1000);
                    }
                    else if (installing.state == "redundant") {
                        logActivity("The new worker failed to install - likely an error during install");
                    }
                });
            });

            var serviceWorker;

            if (registration.installing) {
                serviceWorker = registration.installing;
                $registrationState.text("installing");
            }
            else if (registration.waiting) {
                serviceWorker = registration.waiting;
                $registrationState.text("waiting");
                showWaitingMessage();
            }
            else if (registration.active) {
                serviceWorker = registration.active;
                $registrationState.text("active").removeClass("label-default").addClass("label-success");
            }

            if (serviceWorker) {
                logRegistrationState(serviceWorker.state);
                serviceWorker.addEventListener("statechange", function (event) {
                    logRegistrationState(event.target.state);
                });

                serviceWorker.addEventListener("controllerchange", function(event) {
                    log("SW: controller has changed.", event);
                    logActivity("Controller has changed (serviceWorker)");
                });
            }
        })
        .catch(function(error) {
            log("Service worker registration failure.", error);
            $registerResult.text("failed: " + error).removeClass("label-default").addClass("label-danger");
        });

    navigator.serviceWorker.addEventListener("controllerchange", function(event) {
        log("Controller has changed.", event);
        logActivity("Controller has changed (navigator.serviceWorker)");
    });

    navigator.serviceWorker.ready.then(function(registration) {
        logActivity("ServiceWorker activated");
        $controllerState.text("is").removeClass("label-default").addClass("label-success");

        var serviceWorker = registration.active;
    });
}
else {
    log("Service worker is not supported.");
}

$(".js-test").on("click", function() {
    fetch("/css/index.css").then(function(response) {
        console.log(response);
    });
});

function log() {
    var args = Array.apply(null, arguments);
    var message = args.shift();
    args.unshift("[Client] " + message);
    console.log.apply(null, args);
}

function logRegistrationState(state) {
    $registrationActivity.append("<li>" + state + "</li>");
}

function logActivity(message) {
    $activity.append("<li>" + message + "</li>");
}

function showWaitingMessage() {
    logActivity("A new ServiceWorker is waiting to become active. It can't become active now because pages are still open that are controlled by the older VERSION. Either close those tabs, or shift+reload them (which loads them without the ServiceWorker). That will allow the new VERSION to become active, so it'll be used for the next page load.");
}