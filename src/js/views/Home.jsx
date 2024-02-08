
var PionirCard = {
    oninit: function() {
        this.image = require(`../../assets/images/oznake/pionir.png`)
    },
    view: function() {
        return <div className="card" style="width: 18rem; border: 0;">
            <img src={this.image} className="card-img-top" alt="Pionir" />
            <div className="card-body border" style="flex: 0">
                <h5 className="card-title">Pionir</h5>
                <p>Kviz za pionirčke.</p>
                <a class="btn btn-primary" onclick={ () => { m.route.set("/pionirji/kviz") }}>Kviz</a>
            </div>
        </div>
    }
}

var MladinecCard = {
    oninit: function() {
        this.image = require(`../../assets/images/oznake/mladinec.png`)
    },
    view: function() {
        return <div className="card" style="width: 18rem; border: 0;">
            <img src={this.image} className="card-img-top" alt="Mladinci" />
            <div className="card-body border" style="flex: 0;">
                <h5 className="card-title">Mladinec</h5>
                <p>Kviz za mladince.</p>
                <a class="btn btn-primary" onclick={ () => { m.route.set("/mladinci/kviz") }}>Kviz</a>
            </div>
        </div>
    }
}

var PripravnikCard = {
    oninit: function() {
        this.image = require(`../../assets/images/oznake/pripravnik.png`)
    },
    view: function() {
        return <div className="card" style="width: 18rem; border: 0;">
            <img src={this.image} className="card-img-top" alt="Pripravniki" />
            <div className="card-body border" style="flex: 0;">
                <h5 className="card-title">Pripravnik</h5>
                <p>Kviz za pripravnike.</p>
                <a class="btn btn-primary" onclick={ () => { m.route.set("/pripravniki/kviz") }}>Kviz</a>
            </div>
        </div>
    }
}


var HomeView = {
    oninit: function() {
    },
    view: function() {
        return <div className="d-flex flex-column justify-content-center min-vh-100">
            <div className="d-flex justify-content-around align-items-center mb-5">
                <PionirCard />
                <MladinecCard />
                <PripravnikCard />
            </div>

            <div className="d-flex justify-content-center">
                <button type="button" class="btn btn-primary btn-lg" onclick={ () => { m.route.set("/literatura") }}>
                    Literatura
                </button>
            </div>
        </div>
    }
}

export { HomeView }
