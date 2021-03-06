var CookiesCnilBanner;

(function(navigator, window, document){
    CookiesCnilBanner = function(launchFunction){
        if(!(this instanceof CookiesCnilBanner)){
            return new CookiesCnilBanner(launchFunction);
        }

        this.cookieTimeout = 33696000000; // 13 months in milliseconds
        this.bots = /bot|googlebot|crawler|spider|robot|crawling/i;
        this.trackingCookiesNames = ["__utma","__utmb","__utmc","__utmt","__utmv","__utmz","_ga","_gat"];
        this.launchFunction = launchFunction;
        this.init();
    };

    CookiesCnilBanner.prototype = {
        init: function(){
            // Do nothing if it is a bot
            // If DoNotTrack is activated, do nothing too
            if(this.isBot() || !this.isToTrack() || this.hasConsent() === false){
                return false;
            }

            // User has already consent to use cookies to tracking
            if(this.hasConsent() === true){
                // Launch user custom function
                this.launchFunction();
                return true;
            }

            // If it's not a bot, no DoNotTrack and not already accept : show banner
            this.showBanner();

            // Accept cookies by default for the next page
            this.setCookie("hasConsent", true);
        },

        /*
         * Show banner at the top of the page
         */
        showBanner: function(){
            var _this = this,
                banner = document.getElementById("cookies-cnil-banner"),
                rejectButton = document.getElementById("cookies-cnil-reject"),
                acceptButton = document.getElementById("cookies-cnil-accept"),
                moreLink = document.getElementById("cookies-cnil-more");

            banner.style.display = "block";

            this.addEventListener(moreLink, "click", function(){
                _this.deleteCookie("hasConsent");
            });

            this.addEventListener(acceptButton, "click", function(){ 
                banner.parentNode.removeChild(banner);
                _this.setCookie("hasConsent", true);
                _this.launchFunction();
            });

            this.addEventListener(rejectButton, "click", function(){ 
                banner.parentNode.removeChild(banner);
                _this.setCookie("hasConsent", false);
                _this.deleteTrackingCookies();
            });
        },

        /*
         * Check if user already consent
         */
        hasConsent: function(){
            if(document.cookie.indexOf("hasConsent=true") > -1){
                return true;
            } else if(document.cookie.indexOf("hasConsent=false") > -1){
                return false;
            }
            return undefined;
        },

        /*
         * Detect if the visitor is a bot or not
         * Prevent for search engine take the cookie
         * alert message as main content of the page
         */
        isBot: function(){
            return this.bots.test(navigator.userAgent);
        },

        /*
         * Check if DoNotTrack is activated
         */
        isToTrack: function() {
            var dnt = navigator.doNotTrack || navigator.msDoNotTrack || window.doNotTrack;
            return (dnt !== undefined) ? (dnt && dnt !== "yes" && dnt !== 1 && dnt !== "1") : true;
        },

        /*
         * Delete existants tracking cookies
         */
        deleteTrackingCookies: function(){
            var nameId;
            for(nameId in this.trackingCookiesNames){
                this.deleteCookie(this.trackingCookiesNames[nameId]);
            }
        },

        /*
         * Create/update cookie
         */
        setCookie: function(name, value){
            var date = new Date();
            date.setTime(date.getTime() + this.cookieTimeout);

            document.cookie = name + "=" + value + ";expires=" + date.toGMTString() + ";path=/";
        },

        /*
         * Delete cookie by changing expire
         */
        deleteCookie: function(name){
            var hostname = document.location.hostname;
            if(hostname.indexOf("www.") === 0){
                hostname = hostname.substring(4);
            }
            document.cookie = name + "=; domain=." + hostname + "; expires=Thu, 01-Jan-1970 00:00:01 GMT; path=/";
            document.cookie = name + "=; expires=Thu, 01-Jan-1970 00:00:01 GMT; path=/";
        },

        addEventListener: function(DOMElement, evnt, callback){
            if(document.addEventListener){ // For all major browsers, except IE 8 and earlier
                DOMElement.addEventListener(evnt, callback);
            } else if(DOMElement.attachEvent){ // For IE 8 and earlier versions
                DOMElement.attachEvent("on"+evnt, callback);
            }
        }
    };
})(navigator, window, document);
