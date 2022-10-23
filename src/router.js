var Home = {
    view: function() {
        return "Welcome"
    }
}

var Bla = {
    view: function() {
        return "Welcome"
    }
}

m.route(document.body, "/home", {
    "/home": Home, // defines `https://localhost/#!/home`
    "/bla": Bla
})